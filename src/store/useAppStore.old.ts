/**
 * Global Application Store
 * 
 * Centralized state management using Zustand.
 * Manages authentication, vocabulary data, sync status, and app settings.
 * 
 * @module store/useAppStore
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Session, User } from '@supabase/supabase-js';
import type { VocabularyWord, AppSettings } from '../types';
import type { SyncStatus } from '../types/supabase';
import * as hybridDataService from '../services/hybridDataService';
import { signIn, signOut } from '../services/supabaseClient';

/**
 * Application state interface
 */
interface AppState {
    // Authentication
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isGuest: boolean;
    isAuthChecking: boolean;
    isLoading: boolean;

    // Vocabulary data
    words: VocabularyWord[];
    currentWord: VocabularyWord | null;

    // Sync status
    syncStatus: SyncStatus;

    // App settings
    settings: AppSettings;

    // Actions
    actions: {
        // Auth actions
        login: (email: string, password: string) => Promise<boolean>;
        loginAsGuest: () => void;
        logout: () => Promise<void>;
        checkAuth: () => Promise<void>;
        initializeAuthListener: () => void;

        // Word actions
        loadWords: () => Promise<void>;
        addWord: (word: Partial<VocabularyWord>) => Promise<boolean>;
        updateWord: (word: Partial<VocabularyWord> & { id: number }) => Promise<boolean>;
        deleteWord: (id: number) => Promise<boolean>;
        markAsLearned: (id: number) => Promise<boolean>;
        unlearnWord: (id: number) => Promise<boolean>;
        setCurrentWord: (word: VocabularyWord | null) => void;

        // Sync actions
        startSync: () => void;
        stopSync: () => void;
        forceSync: () => Promise<void>;

        // Settings actions
        updateSettings: (settings: Partial<AppSettings>) => void;
        clearLocalData: () => Promise<void>;
    };
}

/**
 * Default app settings
 */
const DEFAULT_SETTINGS: AppSettings = {
    workHoursStart: '09:00',
    workHoursEnd: '18:00',
    focusModeEnabled: true,
    frequency: 15,
    dataSource: 'dummy',
    popupPosition: 'Bottom Right',
};

/**
 * Global app store
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { words, actions } = useAppStore();
 *   
 *   useEffect(() => {
 *     actions.loadWords();
 *   }, []);
 *   
 *   return <div>{words.length} words loaded</div>;
 * }
 * ```
 */
export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            session: null,
            isAuthenticated: false,
            isAdmin: false,
            isGuest: false,
            isAuthChecking: true,
            isLoading: false,
            words: [],
            currentWord: null,
            syncStatus: {
                last_sync: null,
                is_syncing: false,
                pending_changes: 0,
                errors: [],
            },
            settings: DEFAULT_SETTINGS,

            // Actions
            actions: {
                /**
                 * Logs in a user
                 */
                login: async (email: string, password: string): Promise<boolean> => {
                    set({ isLoading: true });

                    try {
                        const { user, error } = await signIn(email, password);

                        if (error || !user) {
                            console.error('Login failed:', error);
                            set({ isLoading: false });
                            return false;
                        }

                        set({
                            isAuthenticated: true,
                            isAdmin: user.email === 'adag6534@gmail.com',
                            isLoading: false,
                        });

                        // Start auto-sync after login
                        hybridDataService.startAutoSync();

                        return true;
                    } catch (error) {
                        console.error('Login error:', error);
                        set({ isLoading: false });
                        return false;
                    }
                },

                /**
                 * Enters guest mode
                 */
                loginAsGuest: () => {
                    set({
                        isAuthenticated: true, // Allow access to protected routes
                        isGuest: true,
                        isAdmin: false,
                        user: null,
                        session: null,
                        isLoading: false
                    });

                    // Force load from local JSON for guests
                    hybridDataService.getAllWordsHybrid().then(words => {
                        set({ words });
                    });
                },

                /**
                 * Logs out the current user
                 */
                logout: async (): Promise<void> => {
                    set({ isLoading: true });

                    try {
                        await signOut();

                        // Stop auto-sync
                        hybridDataService.stopAutoSync();

                        set({
                            user: null,
                            isAuthenticated: false,
                            isGuest: false,
                            isLoading: false,
                        });
                    } catch (error) {
                        console.error('Logout error:', error);
                        set({ isLoading: false });
                    }
                },

                /**
                 * Checks if user is authenticated
                 */
                /**
                 * Checks if user is authenticated
                 */
                checkAuth: async (): Promise<void> => {
                    // Silent check
                    try {
                        const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Auth check timeout')), 5000)
                        );

                        // Use getSupabaseClient directly to avoid circular dependency issues if imported top-level
                        const supabase = (await import('../services/supabaseClient')).getSupabaseClient();

                        if (!supabase) {
                            set({ isAuthenticated: false, isLoading: false, isAuthChecking: false });
                            return;
                        }

                        const { data: { session }, error } = await Promise.race([
                            supabase.auth.getSession(),
                            timeoutPromise
                        ]) as any;

                        if (error || !session) {
                            set({
                                isAuthenticated: false,
                                user: null,
                                session: null,
                                isLoading: false,
                                isAuthChecking: false
                            });
                            return;
                        }

                        set({
                            isAuthenticated: true,
                            isAdmin: session.user.email === 'adag6534@gmail.com',
                            user: session.user,
                            session: session,
                            isLoading: false,
                            isAuthChecking: false
                        });

                        // Start auto-sync if authenticated
                        hybridDataService.startAutoSync();
                    } catch (error) {
                        console.warn('Auth check failed or timed out:', error);
                        set({
                            isAuthenticated: false,
                            isLoading: false,
                            isAuthChecking: false
                        });
                    }
                },

                /**
                 * Initializes Supabase Auth Listener
                 */
                initializeAuthListener: async () => {
                    const supabase = (await import('../services/supabaseClient')).getSupabaseClient();
                    if (!supabase) return;

                    supabase.auth.onAuthStateChange(async (event, session) => {
                        console.log('🔐 Auth state changed:', event, session?.user?.email);

                        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                            set({
                                isAuthenticated: !!session?.user,
                                isAdmin: session?.user?.email === 'adag6534@gmail.com',
                                user: session?.user ?? null,
                                session: session,
                                isLoading: false,
                                isAuthChecking: false
                            });
                            if (session?.user) {
                                hybridDataService.startAutoSync();
                                // Reload words to fetch user progress from Supabase
                                get().actions.loadWords();
                            }
                        } else if (event === 'SIGNED_OUT') {
                            set({
                                user: null,
                                session: null,
                                isLoading: false,
                                isAuthChecking: false
                            });
                            hybridDataService.stopAutoSync();
                        }
                    });
                },

                /**
                 * Loads all vocabulary words
                 */
                loadWords: async (): Promise<void> => {
                    set({ isLoading: true });

                    try {
                        const words = await hybridDataService.getAllWordsHybrid();
                        set({ words, isLoading: false });
                    } catch (error) {
                        console.error('Failed to load words:', error);
                        set({ isLoading: false });
                    }
                },

                /**
                 * Adds a new word
                 */
                addWord: async (word: Partial<VocabularyWord>): Promise<boolean> => {
                    try {
                        const result = await hybridDataService.saveWordHybrid(word);

                        if (result.success && result.word) {
                            set(state => ({
                                words: [...state.words, result.word!],
                            }));
                            return true;
                        }

                        return false;
                    } catch (error) {
                        console.error('Failed to add word:', error);
                        return false;
                    }
                },

                /**
                 * Updates an existing word
                 */
                updateWord: async (word: Partial<VocabularyWord> & { id: number | string }): Promise<boolean> => {
                    set({ isLoading: true });

                    try {
                        const result = await hybridDataService.updateWordHybrid(word);

                        if (result.success) {
                            // Reload all words from Supabase to get fresh data
                            const words = await hybridDataService.getAllWordsHybrid();
                            set({ words, isLoading: false });
                            return true;
                        }

                        set({ isLoading: false });
                        return false;
                    } catch (error) {
                        console.error('Failed to update word:', error);
                        set({ isLoading: false });
                        return false;
                    }
                },

                /**
                 * Deletes a word
                 */
                deleteWord: async (id: number): Promise<boolean> => {
                    try {
                        const result = await (window.electron?.deleteWord(id) || Promise.resolve({ success: false }));

                        if (result.success) {
                            set(state => ({
                                words: state.words.filter(w => w.id !== id),
                            }));
                            return true;
                        }

                        return false;
                    } catch (error) {
                        console.error('Failed to delete word:', error);
                        return false;
                    }
                },

                /**
                 * Marks a word as learned
                 */
                markAsLearned: async (id: number): Promise<boolean> => {
                    try {
                        const result = await hybridDataService.markAsLearned(id);

                        if (result.success) {
                            set(state => ({
                                words: state.words.map(w =>
                                    w.id === id ? { ...w, is_learned: true } : w
                                ),
                            }));

                            // Guest mode toast logic handles itself in UI or here? 
                            // User request: "Misafir Modu... sadece yerel state'de kelimeyi gizle"
                            // If isGuest, hybridDataService just returns success: true, so state update above hides it.
                            return true;
                        }
                        return false;
                    } catch (error) {
                        console.error('Failed to mark word as learned:', error);
                        return false;
                    }
                },

                /**
                 * Unmarks a word as learned
                 */
                unlearnWord: async (id: number): Promise<boolean> => {
                    try {
                        const result = await hybridDataService.unlearnWord(id);

                        if (result.success) {
                            set(state => ({
                                words: state.words.map(w =>
                                    w.id === id ? { ...w, is_learned: false } : w
                                ),
                            }));
                            return true;
                        }
                        return false;
                    } catch (error) {
                        console.error('Failed to unlearn word:', error);
                        return false;
                    }
                },

                /**
                 * Sets the current word being studied
                 */
                setCurrentWord: (word: VocabularyWord | null): void => {
                    set({ currentWord: word });
                },

                /**
                 * Starts automatic sync
                 */
                startSync: (): void => {
                    hybridDataService.startAutoSync();
                },

                /**
                 * Stops automatic sync
                 */
                stopSync: (): void => {
                    hybridDataService.stopAutoSync();
                },

                /**
                 * Forces an immediate sync
                 */
                forceSync: async (): Promise<void> => {
                    set(state => ({
                        syncStatus: { ...state.syncStatus, is_syncing: true },
                    }));

                    try {
                        await hybridDataService.forceSync();

                        const status = hybridDataService.getSyncStatus();
                        set({
                            syncStatus: {
                                last_sync: status.lastSync?.toISOString() || null,
                                is_syncing: false,
                                pending_changes: 0,
                                errors: [],
                            },
                        });
                    } catch (error) {
                        console.error('Force sync failed:', error);
                        set(state => ({
                            syncStatus: { ...state.syncStatus, is_syncing: false },
                        }));
                    }
                },

                /**
                 * Updates app settings
                 */
                updateSettings: (newSettings: Partial<AppSettings>): void => {
                    set(state => ({
                        settings: { ...state.settings, ...newSettings },
                    }));

                    // Also update Electron settings
                    if (window.electron?.updateSettings) {
                        window.electron.updateSettings(newSettings);
                    }
                },

                /**
                 * Clears all local data
                 */
                clearLocalData: async (): Promise<void> => {
                    localStorage.clear();
                    // Optional: You might want to reload the window to reset everything cleanly
                    window.location.reload();
                },
            },
        }),
        {
            name: 'vocab-app-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                isAdmin: state.isAdmin,
                settings: state.settings,
                // Do not persist isGuest to clear it on reload/restart as requested
            }),
        }
    )
);
