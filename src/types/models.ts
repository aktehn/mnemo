/**
 * Domain Model Types
 * 
 * Core types and interfaces used throughout the application.
 * These represent the business logic entities.
 * 
 * @module types/models
 */

/**
 * Word difficulty levels based on CEFR (Common European Framework of Reference)
 */
export type WordLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Word types (parts of speech)
 */
export type WordType = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'other';

/**
 * Learning status of a word
 */
export type WordStatus = 'new' | 'learning' | 'hard' | 'easy' | 'mastered' | 'impartial';

/**
 * User grade for word recall (0-5 scale)
 * Based on SM-2 algorithm
 */
export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Represents a vocabulary word with all its metadata
 */
export interface VocabularyWord {
    /** Unique identifier */
    id: number | string;

    /** The English word or phrase */
    term: string;

    /** Translation or meaning in target language */
    meaning: string;

    /** Example sentence using the word */
    example: string;

    /** Part of speech */
    type: WordType;

    /** Difficulty level */
    level: WordLevel;

    /** Current learning status */
    status?: WordStatus;

    /** Next review date (ISO string) */
    reviewDate?: string | null;

    /** SRS interval in days */
    interval?: number;

    /** Number of successful repetitions */
    repetition?: number;

    /** Easiness factor for SRS algorithm */
    ef?: number;

    /** Supabase metadata */
    created_at?: string;
    updated_at?: string;
    user_id?: string;

    /** Sync metadata */
    is_synced?: boolean;
    last_synced_at?: string;
    sync_version?: number;

    /** Learning status flag */
    is_learned?: boolean;
}

/**
 * SRS (Spaced Repetition System) statistics for a word
 */
export interface SRSStats {
    /** Interval in days until next review */
    interval: number;

    /** Number of successful repetitions */
    repetition: number;

    /** Easiness factor (difficulty multiplier) */
    ef: number;

    /** Next review date (ISO string) */
    dueDate: string;
}

/**
 * Application settings
 */
export interface AppSettings {
    /** Start time for work hours (HH:MM format) */
    workHoursStart: string;

    /** End time for work hours (HH:MM format) */
    workHoursEnd: string;

    /** Whether focus mode is enabled */
    focusModeEnabled: boolean;

    /** Popup frequency in minutes */
    frequency: number;

    /** Data source for vocabulary */
    dataSource: 'dummy' | 'api';

    /** Position of the popup window on screen */
    popupPosition: 'Top Left' | 'Top Right' | 'Bottom Left' | 'Bottom Right' | 'Center';
}

/**
 * Sync status for offline-first architecture
 */
export interface SyncStatus {
    /** Last successful sync timestamp */
    last_sync: string | null;

    /** Is currently syncing */
    is_syncing: boolean;

    /** Pending changes count */
    pending_changes: number;

    /** Sync errors */
    errors: SyncError[];
}

/**
 * Sync error details
 */
export interface SyncError {
    /** Error ID */
    id: string;

    /** Error message */
    message: string;

    /** Entity type that failed */
    entity_type: 'word' | 'progress' | 'settings';

    /** Entity ID */
    entity_id: string | number;

    /** Timestamp */
    timestamp: string;

    /** Retry count */
    retry_count: number;
}

/**
 * Electron IPC API exposed to renderer process
 */
export interface ElectronAPI {
    // Word Management
    getAllWords: () => Promise<VocabularyWord[]>;
    saveWord: (word: Partial<VocabularyWord>) => Promise<{ success: boolean; word?: VocabularyWord; error?: string }>;
    updateWord: (word: Partial<VocabularyWord> & { id: number }) => Promise<{ success: boolean; error?: string }>;
    deleteWord: (id: number) => Promise<{ success: boolean; error?: string }>;

    // Popup Control
    showPopup: (force?: boolean) => void;
    hidePopup: () => void;
    onRefreshWord: (callback: () => void) => void;
    onOpenQuickAdd: (callback: () => void) => void;

    // Settings
    updateSettings: (settings: Partial<AppSettings>) => void;
    getSettings: (callback: (settings: AppSettings) => void) => void;
    /** Called when Electron main pushes updated settings to this window (e.g., on popup load or when admin changes settings) */
    onSettingsUpdate: (callback: (settings: AppSettings) => void) => void;

    // Logging
    log: (message: string) => void;
}

/**
 * Extend Window interface to include Electron API
 */
declare global {
    interface Window {
        electron?: ElectronAPI;
    }
}
