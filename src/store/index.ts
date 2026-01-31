/**
 * Application Store - Main Export
 * 
 * Combines all Zustand slices with backward compatibility.
 * 
 * @module store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Session, User } from '@supabase/supabase-js';
import type { VocabularyWord, AppSettings, SyncStatus } from '../types/models';
import * as hybridDataService from '../services/hybridDataService';
import { signIn, signOut } from '../services/supabaseClient';

const DEFAULT_SETTINGS: AppSettings = {
    workHoursStart: '09:00',
    workHoursEnd: '18:00',
    focusModeEnabled: true,
    frequency: 15,
    dataSource: 'dummy',
    popupPosition: 'Bottom Right',
};

export interface AppState {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isGuest: boolean;
    isAuthChecking: boolean;
    isLoading: boolean;
    words: VocabularyWord[];
    currentWord: VocabularyWord | null;
    syncStatus: SyncStatus;
    settings: AppSettings;
    actions: {
        login: (email: string, password: string) => Promise<boolean>;
        loginAsGuest: () => void;
        logout: () => Promise<void>;
        checkAuth: () => Promise<void>;
        initializeAuthListener: () => void;
        loadWords: () => Promise<void>;
        addWord: (word: Partial<VocabularyWord>) => Promise<boolean>;
        updateWord: (word: Partial<VocabularyWord> & { id: number | string }) => Promise<boolean>;
        deleteWord: (id: number) => Promise<boolean>;
        markAsLearned: (id: number | string) => Promise<boolean>;
        unlearnWord: (id: number) => Promise<boolean>;
        setCurrentWord: (word: VocabularyWord | null) => void;
        updateSettings: (settings: Partial<AppSettings>) => void;
        startSync: () => void;
        stopSync: () => void;
        forceSync: () => Promise<void>;
        clearLocalData: () => Promise<void>;
    };
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
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

            actions: {
                login: async (email: string, password: string): Promise<boolean> => {
                    set({ isLoading: true });
                    try {
                        const { user, error } = await signIn(email, password);
                        if (error || !user) {
                            console.error('[Auth] Login failed:', error);
                            set({ isLoading: false });
                            return false;
                        }
                        set({
                            isAuthenticated: true,
                            isAdmin: user.email === 'adag6534@gmail.com',
                            isLoading: false,
                        });
                        hybridDataService.startAutoSync();
                        return true;
                    } catch (error) {
                        console.error('[Auth] Login error:', error);
                        set({ isLoading: false });
                        return false;
                    }
                },

                loginAsGuest: () => {
                    set({
                        isAuthenticated: true,
                        isGuest: true,
                        isAdmin: false,
                        user: null,
                        session: null,
                        isLoading: false,
                    });
                    hybridDataService.getAllWordsHybrid().then((words) => set({ words }));
                },

                logout: async (): Promise<void> => {
                    set({ isLoading: true });
                    try {
                        await signOut();
                        hybridDataService.stopAutoSync();
                        set({
                            user: null,
                            session: null,
                            isAuthenticated: false,
                            isGuest: false,
                            isLoading: false,
                        });
                    } catch (error) {
                        console.error('[Auth] Logout error:', error);
                        set({ isLoading: false });
                    }
                },

                checkAuth: async (): Promise<void> => {
                    try {
                        const timeoutPromise = new Promise<never>((_, reject) =>
                            setTimeout(() => reject(new Error('Auth check timeout')), 5000)
                        );
                        const supabase = (await import('../services/supabaseClient')).getSupabaseClient();
                        if (!supabase) {
                            set({ isAuthenticated: false, isAuthChecking: false, isLoading: false });
                            return;
                        }
                        const { data: { session }, error } = await Promise.race([
                            supabase.auth.getSession(),
                            timeoutPromise,
                        ]);
                        if (error || !session) {
                            set({
                                isAuthenticated: false,
                                user: null,
                                session: null,
                                isAuthChecking: false,
                                isLoading: false,
                            });
                            return;
                        }
                        set({
                            isAuthenticated: true,
                            isAdmin: session.user.email === 'adag6534@gmail.com',
                            user: session.user,
                            session: session,
                            isAuthChecking: false,
                            isLoading: false,
                        });
                        hybridDataService.startAutoSync();
                    } catch (error) {
                        console.warn('[Auth] Auth check failed:', error);
                        set({ isAuthenticated: false, isAuthChecking: false, isLoading: false });
                    }
                },

                initializeAuthListener: async () => {
                    const supabase = (await import('../services/supabaseClient')).getSupabaseClient();
                    if (!supabase) return;
                    supabase.auth.onAuthStateChange(async (event, session) => {
                        console.log('[Auth] Auth state changed:', event);
                        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                            set({
                                isAuthenticated: !!session?.user,
                                isAdmin: session?.user?.email === 'adag6534@gmail.com',
                                user: session?.user ?? null,
                                session: session,
                                isAuthChecking: false,
                                isLoading: false,
                            });
                            if (session?.user) {
                                hybridDataService.startAutoSync();
                                get().actions.loadWords();
                            }
                        } else if (event === 'SIGNED_OUT') {
                            set({
                                user: null,
                                session: null,
                                isAuthenticated: false,
                                isAuthChecking: false,
                                isLoading: false,
                            });
                            hybridDataService.stopAutoSync();
                        }
                    });
                },

                loadWords: async (): Promise<void> => {
                    set({ isLoading: true });
                    try {
                        const words = await hybridDataService.getAllWordsHybrid();
                        set({ words, isLoading: false });
                    } catch (error) {
                        console.error('[Word] Failed to load words:', error);
                        set({ isLoading: false });
                    }
                },

                addWord: async (word: Partial<VocabularyWord>): Promise<boolean> => {
                    try {
                        const result = await hybridDataService.saveWordHybrid(word);
                        if (result.success && result.word) {
                            set((state) => ({ words: [...state.words, result.word!] }));
                            return true;
                        }
                        return false;
                    } catch (error) {
                        console.error('[Word] Failed to add word:', error);
                        return false;
                    }
                },

                updateWord: async (word: Partial<VocabularyWord> & { id: number | string }): Promise<boolean> => {
                    set({ isLoading: true });
                    try {
                        const result = await hybridDataService.updateWordHybrid(word);
                        if (result.success) {
                            const words = await hybridDataService.getAllWordsHybrid();
                            set({ words, isLoading: false });
                            return true;
                        }
                        set({ isLoading: false });
                        return false;
                    } catch (error) {
                        console.error('[Word] Failed to update word:', error);
                        set({ isLoading: false });
                        return false;
                    }
                },

                deleteWord: async (id: number): Promise<boolean> => {
                    try {
                        const result = await (window.electron?.deleteWord(id) || Promise.resolve({ success: false }));
                        if (result.success) {
                            set((state) => ({ words: state.words.filter((w) => w.id !== id) }));
                            return true;
                        }
                        return false;
                    } catch (error) {
                        console.error('[Word] Failed to delete word:', error);
                        return false;
                    }
                },

                markAsLearned: async (id: number | string): Promise<boolean> => {
                    try {
                        const result = await hybridDataService.markAsLearned(id);
                        if (result.success) {
                            set((state) => ({
                                words: state.words.map((w) => (w.id === id ? { ...w, is_learned: true } : w)),
                            }));
                            return true;
                        }
                        return false;
                    } catch (error) {
                        console.error('[Word] Failed to mark as learned:', error);
                        return false;
                    }
                },

                unlearnWord: async (id: number): Promise<boolean> => {
                    try {
                        const result = await hybridDataService.unlearnWord(id);
                        if (result.success) {
                            set((state) => ({
                                words: state.words.map((w) => (w.id === id ? { ...w, is_learned: false } : w)),
                            }));
                            return true;
                        }
                        return false;
                    } catch (error) {
                        console.error('[Word] Failed to unlearn word:', error);
                        return false;
                    }
                },

                setCurrentWord: (word: VocabularyWord | null): void => {
                    set({ currentWord: word });
                },

                updateSettings: (newSettings: Partial<AppSettings>): void => {
                    set((state) => ({ settings: { ...state.settings, ...newSettings } }));
                    if (window.electron?.updateSettings) {
                        window.electron.updateSettings(newSettings);
                    }
                },

                startSync: (): void => {
                    hybridDataService.startAutoSync();
                },

                stopSync: (): void => {
                    hybridDataService.stopAutoSync();
                },

                forceSync: async (): Promise<void> => {
                    set((state) => ({ syncStatus: { ...state.syncStatus, is_syncing: true } }));
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
                        console.error('[Settings] Force sync failed:', error);
                        set((state) => ({ syncStatus: { ...state.syncStatus, is_syncing: false } }));
                    }
                },

                clearLocalData: async (): Promise<void> => {
                    localStorage.clear();
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
            }),
        }
    )
);
