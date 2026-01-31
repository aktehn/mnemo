/**
 * Store Types
 * 
 * Type definitions for Zustand store slices and combined state.
 * 
 * @module store/types
 */

import type { Session, User } from '@supabase/supabase-js';
import type { VocabularyWord, AppSettings, SyncStatus } from '../types/models';

/**
 * Authentication slice state
 */
export interface AuthState {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isGuest: boolean;
    isAuthChecking: boolean;
}

/**
 * Authentication slice actions
 */
export interface AuthActions {
    login: (email: string, password: string) => Promise<boolean>;
    loginAsGuest: () => void;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    initializeAuthListener: () => void;
}

/**
 * Complete authentication slice
 */
export interface AuthSlice extends AuthState {
    actions: AuthActions;
}

/**
 * Word slice state
 */
export interface WordState {
    words: VocabularyWord[];
    isLoading: boolean;
}

/**
 * Word slice actions
 */
export interface WordActions {
    loadWords: () => Promise<void>;
    addWord: (word: Partial<VocabularyWord>) => Promise<boolean>;
    updateWord: (word: Partial<VocabularyWord> & { id: number | string }) => Promise<boolean>;
    deleteWord: (id: number) => Promise<boolean>;
    markAsLearned: (id: number) => Promise<boolean>;
    unlearnWord: (id: number) => Promise<boolean>;
}

/**
 * Complete word slice
 */
export interface WordSlice extends WordState {
    actions: WordActions;
}

/**
 * UI slice state
 */
export interface UIState {
    currentWord: VocabularyWord | null;
}

/**
 * UI slice actions
 */
export interface UIActions {
    setCurrentWord: (word: VocabularyWord | null) => void;
}

/**
 * Complete UI slice
 */
export interface UISlice extends UIState {
    actions: UIActions;
}

/**
 * Settings slice state
 */
export interface SettingsState {
    settings: AppSettings;
    syncStatus: SyncStatus;
}

/**
 * Settings slice actions
 */
export interface SettingsActions {
    updateSettings: (settings: Partial<AppSettings>) => void;
    startSync: () => void;
    stopSync: () => void;
    forceSync: () => Promise<void>;
    clearLocalData: () => Promise<void>;
}

/**
 * Complete settings slice
 */
export interface SettingsSlice extends SettingsState {
    actions: SettingsActions;
}

/**
 * Combined application state
 * 
 * This is the final shape of the store that combines all slices.
 */
export interface AppState {
    auth: AuthSlice;
    word: WordSlice;
    ui: UISlice;
    settings: SettingsSlice;
}
