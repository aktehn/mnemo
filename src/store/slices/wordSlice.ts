/**
 * Word Slice
 * 
 * Manages vocabulary words state and CRUD operations.
 * Handles loading, adding, updating, deleting, and marking words as learned.
 * 
 * @module store/slices/wordSlice
 */

import type { StateCreator } from 'zustand';
import type { AppState, WordSlice } from '../types';
import type { VocabularyWord } from '../../types/models';
import * as hybridDataService from '../../services/hybridDataService';

/**
 * Creates the word slice
 */
export const createWordSlice: StateCreator<
    AppState,
    [],
    [],
    { word: WordSlice }
> = (set) => ({
    word: {
        // Initial state
        words: [],
        isLoading: false,

        // Actions
        actions: {
            /**
             * Loads all vocabulary words
             */
            loadWords: async (): Promise<void> => {
                set((state) => ({
                    word: { ...state.word, isLoading: true },
                }));

                try {
                    const words = await hybridDataService.getAllWordsHybrid();
                    set((state) => ({
                        word: { ...state.word, words, isLoading: false },
                    }));
                } catch (error) {
                    console.error('[Word] Failed to load words:', error);
                    set((state) => ({
                        word: { ...state.word, isLoading: false },
                    }));
                }
            },

            /**
             * Adds a new word
             * 
             * @param word - Partial word object with required fields
             * @returns Promise<boolean> - True if successful, false otherwise
             */
            addWord: async (word: Partial<VocabularyWord>): Promise<boolean> => {
                try {
                    const result = await hybridDataService.saveWordHybrid(word);

                    if (result.success && result.word) {
                        set((state) => ({
                            word: {
                                ...state.word,
                                words: [...state.word.words, result.word!],
                            },
                        }));
                        return true;
                    }

                    return false;
                } catch (error) {
                    console.error('[Word] Failed to add word:', error);
                    return false;
                }
            },

            /**
             * Updates an existing word
             * 
             * @param word - Partial word object with id and fields to update
             * @returns Promise<boolean> - True if successful, false otherwise
             */
            updateWord: async (
                word: Partial<VocabularyWord> & { id: number | string }
            ): Promise<boolean> => {
                set((state) => ({
                    word: { ...state.word, isLoading: true },
                }));

                try {
                    const result = await hybridDataService.updateWordHybrid(word);

                    if (result.success) {
                        // Reload all words from Supabase to get fresh data
                        const words = await hybridDataService.getAllWordsHybrid();
                        set((state) => ({
                            word: { ...state.word, words, isLoading: false },
                        }));
                        return true;
                    }

                    set((state) => ({
                        word: { ...state.word, isLoading: false },
                    }));
                    return false;
                } catch (error) {
                    console.error('[Word] Failed to update word:', error);
                    set((state) => ({
                        word: { ...state.word, isLoading: false },
                    }));
                    return false;
                }
            },

            /**
             * Deletes a word
             * 
             * @param id - Word ID to delete
             * @returns Promise<boolean> - True if successful, false otherwise
             */
            deleteWord: async (id: number): Promise<boolean> => {
                try {
                    const result = await (
                        window.electron?.deleteWord(id) ||
                        Promise.resolve({ success: false })
                    );

                    if (result.success) {
                        set((state) => ({
                            word: {
                                ...state.word,
                                words: state.word.words.filter((w) => w.id !== id),
                            },
                        }));
                        return true;
                    }

                    return false;
                } catch (error) {
                    console.error('[Word] Failed to delete word:', error);
                    return false;
                }
            },

            /**
             * Marks a word as learned
             * 
             * @param id - Word ID to mark as learned
             * @returns Promise<boolean> - True if successful, false otherwise
             */
            markAsLearned: async (id: number): Promise<boolean> => {
                try {
                    const result = await hybridDataService.markAsLearned(id);

                    if (result.success) {
                        set((state) => ({
                            word: {
                                ...state.word,
                                words: state.word.words.map((w) =>
                                    w.id === id ? { ...w, is_learned: true } : w
                                ),
                            },
                        }));
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('[Word] Failed to mark word as learned:', error);
                    return false;
                }
            },

            /**
             * Unmarks a word as learned (marks as not learned)
             * 
             * @param id - Word ID to unlearn
             * @returns Promise<boolean> - True if successful, false otherwise
             */
            unlearnWord: async (id: number): Promise<boolean> => {
                try {
                    const result = await hybridDataService.unlearnWord(id);

                    if (result.success) {
                        set((state) => ({
                            word: {
                                ...state.word,
                                words: state.word.words.map((w) =>
                                    w.id === id ? { ...w, is_learned: false } : w
                                ),
                            },
                        }));
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('[Word] Failed to unlearn word:', error);
                    return false;
                }
            },
        },
    },
});
