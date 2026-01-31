/**
 * useDictionary Hook
 * Provides dictionary functionality to React components.
 * Features:
 * - Caching (in-memory)
 * - Loading/Error states
 * - Auto-provider selection based on language
 */

import { useState, useCallback, useRef } from 'react';
import { DictionaryFactory } from '../services/dictionary/DictionaryFactory';
import { WordDefinition, DictionaryError } from '../services/dictionary/types';

interface UseDictionaryResult {
    definition: WordDefinition | null;
    loading: boolean;
    error: string | null;
    searchDefinition: (word: string, lang?: string) => Promise<void>;
    clear: () => void;
}

// Global cache to persist across component re-renders (simple in-memory cache)
const dictionaryCache = new Map<string, WordDefinition>();

export const useDictionary = (defaultLang: string = 'en'): UseDictionaryResult => {
    const [definition, setDefinition] = useState<WordDefinition | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // To handle race conditions (ignore responses from old requests)
    const currentRequestRef = useRef<string>('');

    const searchDefinition = useCallback(async (word: string, lang: string = defaultLang) => {
        if (!word || word.trim().length === 0) {
            setDefinition(null);
            setError(null);
            return;
        }

        const cleanWord = word.trim().toLowerCase();
        const cacheKey = `${lang}:${cleanWord}`;

        // Prevent race condition: track current request
        const requestId = Date.now().toString();
        currentRequestRef.current = requestId;

        // 1. Check Cache
        if (dictionaryCache.has(cacheKey)) {
            setDefinition(dictionaryCache.get(cacheKey)!);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setDefinition(null);

        try {
            const provider = DictionaryFactory.getProvider(lang);
            const result = await provider.fetchDefinition(cleanWord);

            // Only update state if this is still the active request
            if (currentRequestRef.current === requestId) {
                setDefinition(result);
                // Save to cache
                dictionaryCache.set(cacheKey, result);
            }
        } catch (err) {
            if (currentRequestRef.current === requestId) {
                const message = err instanceof DictionaryError
                    ? err.message
                    : 'An unexpected error occurred';
                setError(message);
                setDefinition(null); // Clear previous definition on error
            }
        } finally {
            if (currentRequestRef.current === requestId) {
                setLoading(false);
            }
        }
    }, [defaultLang]);

    const clear = useCallback(() => {
        setDefinition(null);
        setError(null);
        setLoading(false);
    }, []);

    return { definition, loading, error, searchDefinition, clear };
};
