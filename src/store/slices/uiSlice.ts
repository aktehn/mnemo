/**
 * UI Slice
 * 
 * Manages UI-related state such as the current word being displayed.
 * 
 * @module store/slices/uiSlice
 */

import type { StateCreator } from 'zustand';
import type { AppState, UISlice } from '../types';
import type { VocabularyWord } from '../../types/models';

/**
 * Creates the UI slice
 */
export const createUISlice: StateCreator<
    AppState,
    [],
    [],
    { ui: UISlice }
> = (set) => ({
    ui: {
        // Initial state
        currentWord: null,

        // Actions
        actions: {
            /**
             * Sets the current word being studied or displayed
             * 
             * @param word - The word to set as current, or null to clear
             */
            setCurrentWord: (word: VocabularyWord | null): void => {
                set((state) => ({
                    ui: { ...state.ui, currentWord: word },
                }));
            },
        },
    },
});
