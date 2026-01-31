/**
 * Free Dictionary API Service
 * Implementation of DictionaryProvider using dictionaryapi.dev
 */

import { DictionaryProvider, WordDefinition, DictionaryError } from './types';

// Type definitions for the raw API response (internal use only)
interface FreeDictResponse {
    word: string;
    phonetic?: string;
    phonetics: {
        text?: string;
        audio?: string;
    }[];
    meanings: {
        partOfSpeech: string;
        definitions: {
            definition: string;
            example?: string;
        }[];
    }[];
}

export class FreeDictionaryService implements DictionaryProvider {
    private readonly API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

    getLanguage(): string {
        return 'en';
    }

    async fetchDefinition(word: string): Promise<WordDefinition> {
        if (!word) throw new DictionaryError('Word cannot be empty', 'UNKNOWN');

        try {
            const response = await fetch(`${this.API_URL}/${encodeURIComponent(word)}`);

            if (response.status === 404) {
                throw new DictionaryError(`Word '${word}' not found`, 'NOT_FOUND');
            }

            if (!response.ok) {
                throw new DictionaryError(`API Error: ${response.statusText}`, 'NETWORK_ERROR');
            }

            const data: FreeDictResponse[] = await response.json();

            if (!data || data.length === 0) {
                throw new DictionaryError('Empty response from API', 'NOT_FOUND');
            }

            // Map standardizing logic (Adapter Pattern)
            return this.mapResponseToDefinition(data[0]);

        } catch (error) {
            if (error instanceof DictionaryError) throw error;
            throw new DictionaryError(
                error instanceof Error ? error.message : 'Unknown network error',
                'NETWORK_ERROR'
            );
        }
    }

    /**
     * Maps the raw API response to our standardized WordDefinition object.
     * Handles finding the best audio source and cleaning up data.
     */
    private mapResponseToDefinition(raw: FreeDictResponse): WordDefinition {
        // Find the first valid audio URL
        const audio = raw.phonetics.find(p => p.audio && p.audio.length > 0)?.audio;

        return {
            word: raw.word,
            phonetic: raw.phonetic || raw.phonetics.find(p => p.text)?.text,
            audio: audio,
            meanings: raw.meanings.map(m => ({
                partOfSpeech: m.partOfSpeech,
                definitions: m.definitions.slice(0, 3).map(d => ({ // Limit to top 3 definitions
                    definition: d.definition,
                    example: d.example
                }))
            })),
            source: 'FreeDictionaryAPI'
        };
    }
}
