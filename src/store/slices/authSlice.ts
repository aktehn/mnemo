/**
 * Authentication Slice
 * 
 * Manages authentication state and actions for the application.
 * Handles login, logout, guest mode, and Supabase auth state changes.
 * 
 * @module store/slices/authSlice
 */

import type { StateCreator } from 'zustand';
import type { AppState, AuthSlice } from '../types';
import { signIn, signOut } from '../../services/supabaseClient';
import * as hybridDataService from '../../services/hybridDataService';

/**
 * Creates the authentication slice
 */
export const createAuthSlice: StateCreator<
    AppState,
    [],
    [],
    { auth: AuthSlice }
> = (set, get) => ({
    auth: {
        // Initial state
        user: null,
        session: null,
        isAuthenticated: false,
        isAdmin: false,
        isGuest: false,
        isAuthChecking: true,

        // Actions
        actions: {
            /**
             * Logs in a user with email and password
             * 
             * @param email - User's email address
             * @param password - User's password
             * @returns Promise<boolean> - True if login successful, false otherwise
             */
            login: async (email: string, password: string): Promise<boolean> => {
                // Set loading state through word slice
                set((state) => ({
                    word: { ...state.word, isLoading: true },
                }));

                try {
                    const { user, error } = await signIn(email, password);

                    if (error || !user) {
                        console.error('[Auth] Login failed:', error);
                        set((state) => ({
                            word: { ...state.word, isLoading: false },
                        }));
                        return false;
                    }

                    set((state) => ({
                        auth: {
                            ...state.auth,
                            isAuthenticated: true,
                            isAdmin: user.email === 'adag6534@gmail.com',
                        },
                        word: { ...state.word, isLoading: false },
                    }));

                    // Start auto-sync after login
                    hybridDataService.startAutoSync();

                    return true;
                } catch (error) {
                    console.error('[Auth] Login error:', error);
                    set((state) => ({
                        word: { ...state.word, isLoading: false },
                    }));
                    return false;
                }
            },

            /**
             * Enters guest mode (offline mode with local data only)
             */
            loginAsGuest: () => {
                set((state) => ({
                    auth: {
                        ...state.auth,
                        isAuthenticated: true,
                        isGuest: true,
                        isAdmin: false,
                        user: null,
                        session: null,
                    },
                    word: { ...state.word, isLoading: false },
                }));

                // Force load from local JSON for guests
                hybridDataService.getAllWordsHybrid().then((words) => {
                    set((state) => ({
                        word: { ...state.word, words },
                    }));
                });
            },

            /**
             * Logs out the current user
             */
            logout: async (): Promise<void> => {
                set((state) => ({
                    word: { ...state.word, isLoading: true },
                }));

                try {
                    await signOut();

                    // Stop auto-sync
                    hybridDataService.stopAutoSync();

                    set((state) => ({
                        auth: {
                            ...state.auth,
                            user: null,
                            session: null,
                            isAuthenticated: false,
                            isGuest: false,
                        },
                        word: { ...state.word, isLoading: false },
                    }));
                } catch (error) {
                    console.error('[Auth] Logout error:', error);
                    set((state) => ({
                        word: { ...state.word, isLoading: false },
                    }));
                }
            },

            /**
             * Checks if user is authenticated (on app startup)
             */
            checkAuth: async (): Promise<void> => {
                try {
                    const timeoutPromise = new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('Auth check timeout')), 5000)
                    );

                    const supabase = (
                        await import('../../services/supabaseClient')
                    ).getSupabaseClient();

                    if (!supabase) {
                        set((state) => ({
                            auth: {
                                ...state.auth,
                                isAuthenticated: false,
                                isAuthChecking: false,
                            },
                            word: { ...state.word, isLoading: false },
                        }));
                        return;
                    }

                    const {
                        data: { session },
                        error,
                    } = await Promise.race([supabase.auth.getSession(), timeoutPromise]);

                    if (error || !session) {
                        set((state) => ({
                            auth: {
                                ...state.auth,
                                isAuthenticated: false,
                                user: null,
                                session: null,
                                isAuthChecking: false,
                            },
                            word: { ...state.word, isLoading: false },
                        }));
                        return;
                    }

                    set((state) => ({
                        auth: {
                            ...state.auth,
                            isAuthenticated: true,
                            isAdmin: session.user.email === 'adag6534@gmail.com',
                            user: session.user,
                            session: session,
                            isAuthChecking: false,
                        },
                        word: { ...state.word, isLoading: false },
                    }));

                    // Start auto-sync if authenticated
                    hybridDataService.startAutoSync();
                } catch (error) {
                    console.warn('[Auth] Auth check failed or timed out:', error);
                    set((state) => ({
                        auth: {
                            ...state.auth,
                            isAuthenticated: false,
                            isAuthChecking: false,
                        },
                        word: { ...state.word, isLoading: false },
                    }));
                }
            },

            /**
             * Initializes Supabase Auth Listener for real-time auth state changes
             */
            initializeAuthListener: async () => {
                const supabase = (
                    await import('../../services/supabaseClient')
                ).getSupabaseClient();

                if (!supabase) {
                    console.warn('[Auth] Supabase client not available for auth listener');
                    return;
                }

                supabase.auth.onAuthStateChange(async (event, session) => {
                    console.log('[Auth] Auth state changed:', event, session?.user?.email);

                    if (
                        event === 'SIGNED_IN' ||
                        event === 'TOKEN_REFRESHED' ||
                        event === 'INITIAL_SESSION'
                    ) {
                        set((state) => ({
                            auth: {
                                ...state.auth,
                                isAuthenticated: !!session?.user,
                                isAdmin: session?.user?.email === 'adag6534@gmail.com',
                                user: session?.user ?? null,
                                session: session,
                                isAuthChecking: false,
                            },
                            word: { ...state.word, isLoading: false },
                        }));

                        if (session?.user) {
                            hybridDataService.startAutoSync();
                            // Reload words to fetch user progress from Supabase
                            get().word.actions.loadWords();
                        }
                    } else if (event === 'SIGNED_OUT') {
                        set((state) => ({
                            auth: {
                                ...state.auth,
                                user: null,
                                session: null,
                                isAuthenticated: false,
                                isAuthChecking: false,
                            },
                            word: { ...state.word, isLoading: false },
                        }));
                        hybridDataService.stopAutoSync();
                    }
                });
            },
        },
    },
});
