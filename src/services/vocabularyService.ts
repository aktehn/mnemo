/**
 * Vocabulary Service
 * 
 * Handles all vocabulary word data operations through Electron IPC.
 * Provides a clean abstraction layer between UI components and Electron backend.
 * 
 * @module services/vocabularyService
 */

import type { VocabularyWord } from '../types';

/**
 * Fetches all vocabulary words from the database
 * 
 * @returns {Promise<VocabularyWord[]>} Array of all vocabulary words
 * @throws {Error} If Electron API is not available
 * 
 * @example
 * ```typescript
 * const words = await getAllWords();
 * console.log(`Total words: ${words.length}`);
 * ```
 */
export async function getAllWords(): Promise<VocabularyWord[]> {
    if (!window.electron?.getAllWords) {
        console.warn('Electron API not available, returning empty array');
        return [];
    }

    try {
        const words = await window.electron.getAllWords();
        return words || [];
    } catch (error) {
        console.error('Failed to fetch words:', error);
        return [];
    }
}

/**
 * Saves a new vocabulary word
 * 
 * @param {Partial<VocabularyWord>} word - Word data (id will be auto-generated)
 * @returns {Promise<{ success: boolean; word?: VocabularyWord; error?: string }>}
 * 
 * @example
 * ```typescript
 * const result = await saveWord({
 *   term: 'ephemeral',
 *   meaning: 'kısa ömürlü',
 *   example: 'The beauty of cherry blossoms is ephemeral.',
 *   type: 'adjective',
 *   level: 'C1'
 * });
 * ```
 */
export async function saveWord(
    word: Partial<VocabularyWord>
): Promise<{ success: boolean; word?: VocabularyWord; error?: string }> {
    if (!window.electron?.saveWord) {
        return { success: false, error: 'Electron API not available' };
    }

    try {
        return await window.electron.saveWord(word);
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Updates an existing vocabulary word
 * 
 * @param {Partial<VocabularyWord> & { id: number }} word - Updated word data (must include id)
 * @returns {Promise<{ success: boolean; error?: string }>}
 * 
 * @example
 * ```typescript
 * const result = await updateWord({
 *   id: 42,
 *   status: 'mastered',
 *   interval: 30,
 *   repetition: 5
 * });
 * ```
 */
export async function updateWord(
    word: Partial<VocabularyWord> & { id: number }
): Promise<{ success: boolean; error?: string }> {
    if (!window.electron?.updateWord) {
        return { success: false, error: 'Electron API not available' };
    }

    try {
        return await window.electron.updateWord(word);
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Deletes a vocabulary word by ID
 * 
 * @param {number} id - Word ID to delete
 * @returns {Promise<{ success: boolean; error?: string }>}
 * 
 * @example
 * ```typescript
 * const result = await deleteWord(42);
 * if (result.success) {
 *   console.log('Word deleted successfully');
 * }
 * ```
 */
export async function deleteWord(
    id: number
): Promise<{ success: boolean; error?: string }> {
    if (!window.electron?.deleteWord) {
        return { success: false, error: 'Electron API not available' };
    }

    try {
        return await window.electron.deleteWord(id);
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Filters words that are due for review
 * 
 * @param {VocabularyWord[]} words - Array of words to filter
 * @returns {VocabularyWord[]} Words that need review
 * 
 * @example
 * ```typescript
 * const allWords = await getAllWords();
 * const dueWords = getDueWords(allWords);
 * console.log(`${dueWords.length} words need review`);
 * ```
 */
export function getDueWords(words: VocabularyWord[]): VocabularyWord[] {
    const now = new Date();
    return words.filter(word => {
        if (!word.reviewDate) return true; // New words are always due
        return new Date(word.reviewDate) <= now;
    });
}

/**
 * Gets words by status
 * 
 * @param {VocabularyWord[]} words - Array of words to filter
 * @param {string} status - Status to filter by
 * @returns {VocabularyWord[]} Filtered words
 * 
 * @example
 * ```typescript
 * const allWords = await getAllWords();
 * const masteredWords = getWordsByStatus(allWords, 'mastered');
 * ```
 */
export function getWordsByStatus(
    words: VocabularyWord[],
    status: string
): VocabularyWord[] {
    return words.filter(word => word.status === status);
}

/**
 * Searches words by term or meaning
 * 
 * @param {VocabularyWord[]} words - Array of words to search
 * @param {string} query - Search query
 * @returns {VocabularyWord[]} Matching words
 * 
 * @example
 * ```typescript
 * const results = searchWords(allWords, 'ephemeral');
 * ```
 */
export function searchWords(
    words: VocabularyWord[],
    query: string
): VocabularyWord[] {
    const lowerQuery = query.toLowerCase();
    return words.filter(word =>
        word.term.toLowerCase().includes(lowerQuery) ||
        word.meaning.toLowerCase().includes(lowerQuery)
    );
}
