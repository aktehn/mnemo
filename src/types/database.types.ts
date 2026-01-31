/**
 * Supabase Database Types
 * 
 * This file contains all type definitions for Supabase database tables and views.
 * These types ensure type safety when interacting with the Supabase database.
 * 
 * @module types/database.types
 */

import type { WordLevel, WordStatus, WordType } from './models';

/**
 * Vocabulary word table row type from Supabase
 */
export interface VocabularyWordRow {
    /** Unique identifier (UUID in Supabase) */
    id: string;

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
    status: WordStatus | null;

    /** Next review date (ISO string) */
    review_date: string | null;

    /** SRS interval in days */
    interval: number | null;

    /** Number of successful repetitions */
    repetition: number | null;

    /** Easiness factor for SRS algorithm */
    ef: number | null;

    /** User ID (owner of this word) */
    user_id: string | null;

    /** Learning status flag */
    is_learned: boolean | null;

    /** Supabase metadata */
    created_at: string;
    updated_at: string;
}

/**
 * Type for inserting a new vocabulary word into Supabase
 */
export interface VocabularyWordInsert {
    term: string;
    meaning: string;
    example: string;
    type: WordType;
    level: WordLevel;
    status?: WordStatus | null;
    review_date?: string | null;
    interval?: number | null;
    repetition?: number | null;
    ef?: number | null;
    user_id?: string | null;
    is_learned?: boolean | null;
}

/**
 * Type for updating an existing vocabulary word in Supabase
 */
export interface VocabularyWordUpdate {
    term?: string;
    meaning?: string;
    example?: string;
    type?: WordType;
    level?: WordLevel;
    status?: WordStatus | null;
    review_date?: string | null;
    interval?: number | null;
    repetition?: number | null;
    ef?: number | null;
    is_learned?: boolean | null;
}

/**
 * User profile table row type from Supabase
 */
export interface UserProfileRow {
    /** User ID (matches Supabase Auth) */
    id: string;

    /** Email address */
    email: string;

    /** Display name */
    display_name: string | null;

    /** Avatar URL */
    avatar_url: string | null;

    /** User preferences (JSON) */
    preferences: Record<string, unknown> | null;

    /** Account creation date */
    created_at: string;

    /** Last update date */
    updated_at: string;
}

/**
 * User word progress table row type from Supabase
 */
export interface UserWordProgressRow {
    /** Progress ID */
    id: string;

    /** User ID */
    user_id: string;

    /** Word ID */
    word_id: string;

    /** SRS statistics (JSON) */
    srs_stats: {
        interval: number;
        repetition: number;
        ef: number;
        dueDate: string;
    } | null;

    /** Learning status */
    status: WordStatus | null;

    /** Total reviews */
    total_reviews: number;

    /** Correct reviews */
    correct_reviews: number;

    /** Last reviewed date */
    last_reviewed_at: string | null;

    /** Next review date */
    next_review_at: string | null;

    /** Manual learned flag */
    is_learned: boolean | null;

    /** Created date */
    created_at: string;

    /** Updated date */
    updated_at: string;
}

/**
 * Supabase database schema definition
 */
export interface Database {
    public: {
        Tables: {
            vocabulary: {
                Row: VocabularyWordRow;
                Insert: VocabularyWordInsert;
                Update: VocabularyWordUpdate;
            };
            profiles: {
                Row: UserProfileRow;
                Insert: Omit<UserProfileRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<UserProfileRow, 'id' | 'created_at'>>;
            };
            user_progress: {
                Row: UserWordProgressRow;
                Insert: Omit<UserWordProgressRow, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<UserWordProgressRow, 'id' | 'user_id' | 'word_id' | 'created_at'>>;
            };
        };
    };
}
