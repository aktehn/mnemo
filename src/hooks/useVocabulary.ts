/**
 * Custom React Hook for managing vocabulary words
 * 
 * Wrapper around the global app store for vocabulary operations.
 * Maintained for backward compatibility and convenience.
 * 
 * @module hooks/useVocabulary
 */

import { useAppStore } from '../store';
import type { VocabularyWord } from '../types';

interface UseVocabularyReturn {
    words: VocabularyWord[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    addWord: (word: Partial<VocabularyWord>) => Promise<boolean>;
    updateWord: (word: Partial<VocabularyWord> & { id: number }) => Promise<boolean>;
    deleteWord: (id: number) => Promise<boolean>;
    searchWords: (query: string) => VocabularyWord[];
    filterByStatus: (status: string) => VocabularyWord[];
    getDueWords: () => VocabularyWord[];
}

export function useVocabulary(): UseVocabularyReturn {
    const store = useAppStore();

    const searchWords = (query: string) => {
        const lowerQuery = query.toLowerCase();
        return store.words.filter(word =>
            word.term.toLowerCase().includes(lowerQuery) ||
            word.meaning.toLowerCase().includes(lowerQuery)
        );
    };

    const filterByStatus = (status: string) => {
        return store.words.filter(word => word.status === status);
    };

    const getDueWords = () => {
        const now = new Date();
        return store.words.filter(word => {
            if (!word.reviewDate) return true;
            return new Date(word.reviewDate) <= now;
        });
    };

    return {
        words: store.words,
        loading: store.isLoading,
        error: null, // Error handling moved to individual actions or separate store slice
        refresh: store.actions.loadWords,
        addWord: store.actions.addWord,
        updateWord: store.actions.updateWord,
        deleteWord: store.actions.deleteWord,
        searchWords,
        filterByStatus,
        getDueWords,
    };
}
