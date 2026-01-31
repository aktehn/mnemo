/**
 * Dictionary Factory
 * Implements Factory Pattern to provide the appropriate dictionary service.
 * Supports singleton instances to save resources.
 */

import { DictionaryProvider } from './types';
import { FreeDictionaryService } from './FreeDictionaryService';

export class DictionaryFactory {
    private static instances: Map<string, DictionaryProvider> = new Map();

    /**
     * Returns a dictionary provider for the specified language.
     * Defaults to English (FreeDictionaryService) if language not supported.
     * 
     * @param lang Language code (e.g., 'en', 'tr', 'es')
     */
    static getProvider(lang: string = 'en'): DictionaryProvider {
        // Reuse existing instance if available (Singleton)
        if (this.instances.has(lang)) {
            return this.instances.get(lang)!;
        }

        let provider: DictionaryProvider;

        switch (lang.toLowerCase()) {
            case 'en':
                provider = new FreeDictionaryService();
                break;
            // Future extensions:
            // case 'tr':
            //     provider = new TDKDictionaryService();
            //     break;
            // case 'es':
            //     provider = new SpanishDictService();
            //     break;
            default:
                console.warn(`Dictionary for language '${lang}' not found, falling back to English.`);
                provider = new FreeDictionaryService();
        }

        this.instances.set(lang, provider);
        return provider;
    }
}
