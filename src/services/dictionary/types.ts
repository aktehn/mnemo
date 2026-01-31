/**
 * Dictionary Service Types
 * Defines the contract/interface for all dictionary providers.
 * Follows the Strategy Pattern.
 */

/**
 * Standardized word definition object.
 * Regardless of the API source, the UI will always receive this structure.
 */
export interface WordDefinition {
    word: string;
    phonetic?: string;
    audio?: string; // URL to pronunciation audio
    meanings: {
        partOfSpeech: string;
        definitions: {
            definition: string;
            example?: string;
        }[];
    }[];
    source: string; // To track which API provided the data
}

/**
 * Interface that all dictionary services must implement.
 * This is the 'Strategy' interface.
 */
export interface DictionaryProvider {
    /**
     * Fetches definition for a given word.
     * @param word The word to search for
     * @returns Promise resolving to the standardized WordDefinition
     * @throws Error if word not found or API fails
     */
    fetchDefinition(word: string): Promise<WordDefinition>;

    /**
     * Returns the language code supported by this provider (e.g., 'en', 'tr')
     */
    getLanguage(): string;
}

/**
 * Custom error class for dictionary operations
 */
export class DictionaryError extends Error {
    constructor(message: string, public code: 'NOT_FOUND' | 'NETWORK_ERROR' | 'API_LIMIT' | 'UNKNOWN') {
        super(message);
        this.name = 'DictionaryError';
    }
}
