/**
 * Application Constants
 * @module constants
 */

/**
 * Default SRS (Spaced Repetition System) settings
 */
export const SRS_DEFAULTS = {
    /** Initial easiness factor */
    INITIAL_EF: 2.5,

    /** Minimum easiness factor */
    MIN_EF: 1.3,

    /** First interval (days) */
    FIRST_INTERVAL: 1,

    /** Second interval (days) */
    SECOND_INTERVAL: 6,

    /** Passing grade threshold */
    PASSING_GRADE: 3,
} as const;

/**
 * Popup window configuration
 */
export const POPUP_CONFIG = {
    /** Width in pixels */
    WIDTH: 400,

    /** Height in pixels */
    HEIGHT: 450,

    /** Padding from screen edge (pixels) */
    SCREEN_PADDING: 20,

    /** Auto-close timer duration (seconds) */
    AUTO_REFRESH_SECONDS: 30,
} as const;

/**
 * Development server configuration
 */
export const DEV_CONFIG = {
    /** Vite dev server URL */
    URL: 'http://localhost:5173',

    /** Port number */
    PORT: 5173,
} as const;

/**
 * Default application settings
 */
export const DEFAULT_SETTINGS = {
    workHoursStart: '09:00',
    workHoursEnd: '18:00',
    focusModeEnabled: false, // OFF by default — avoids suppressing popups outside work hours accidentally
    frequency: 5, // minutes — 5 minute default for good UX
} as const;

/**
 * Word levels with descriptions
 */
export const WORD_LEVELS = {
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper Intermediate',
    C1: 'Advanced',
    C2: 'Proficient',
} as const;

/**
 * Word types with descriptions
 */
export const WORD_TYPES = {
    noun: 'Noun',
    verb: 'Verb',
    adjective: 'Adjective',
    adverb: 'Adverb',
    phrase: 'Phrase',
    other: 'Other',
} as const;

/**
 * Application metadata
 */
export const APP_METADATA = {
    name: 'Vocabulary Learning',
    appId: 'com.vocabulary.app',
    version: '1.0.0',
    description: 'A spaced repetition vocabulary learning application',
    author: 'Your Name',
    license: 'MIT',
    repository: 'https://github.com/yourusername/vocabulary-app',
} as const;
