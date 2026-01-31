/**
 * Extended Type Definitions for Supabase Integration
 * @module types/supabase
 */

import type { WordLevel, WordStatus, AppSettings, SRSStats } from './index';

/**
 * User profile stored in Supabase
 */
export interface UserProfile {
    /** User ID (matches Supabase Auth) */
    id: string;

    /** Email address */
    email: string;

    /** Display name */
    display_name?: string;

    /** Avatar URL */
    avatar_url?: string;

    /** User preferences */
    preferences: UserPreferences;

    /** Account creation date */
    created_at: string;

    /** Last update date */
    updated_at: string;
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
    /** Target language for translations */
    target_language: string;

    /** Daily learning goal (words per day) */
    daily_goal: number;

    /** Notification settings */
    notifications_enabled: boolean;

    /** Theme preference */
    theme: 'light' | 'dark' | 'auto';

    /** App settings */
    app_settings: AppSettings;
}

/**
 * Word pack metadata (for downloadable content)
 */
export interface WordPack {
    /** Pack ID */
    id: string;

    /** Pack name */
    name: string;

    /** Description */
    description: string;

    /** CEFR level */
    level: WordLevel;

    /** Number of words in pack */
    word_count: number;

    /** Category/topic */
    category: string;

    /** Is premium content */
    is_premium: boolean;

    /** Download count */
    download_count: number;

    /** Created date */
    created_at: string;

    /** Updated date */
    updated_at: string;
}

/**
 * User's learning progress for a specific word
 */
export interface UserWordProgress {
    /** Progress ID */
    id: string;

    /** User ID */
    user_id: string;

    /** Word ID */
    word_id: number | string;

    /** SRS statistics */
    srs_stats: SRSStats;

    /** Learning status */
    status: WordStatus;

    /** Total reviews */
    total_reviews: number;

    /** Correct reviews */
    correct_reviews: number;

    /** Last reviewed date */
    last_reviewed_at?: string;

    /** Next review date */
    next_review_at?: string;

    /** Manual learned flag */
    is_learned?: boolean;

    /** Created date */
    created_at: string;

    /** Updated date */
    updated_at: string;
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
 * Database tables structure
 */
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: UserProfile;
                Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
                Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
            };
            word_packs: {
                Row: WordPack;
                Insert: Omit<WordPack, 'created_at' | 'updated_at' | 'download_count'>;
                Update: Partial<Omit<WordPack, 'id' | 'created_at'>>;
            };
            user_progress: {
                Row: UserWordProgress;
                Insert: Omit<UserWordProgress, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<UserWordProgress, 'id' | 'user_id' | 'word_id' | 'created_at'>>;
            };
        };
    };
}
