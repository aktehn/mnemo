/**
 * Seed Words to Supabase
 * 
 * One-time script to populate words_library table from a2_vocab.json
 * Run this manually after first setup to initialize the database.
 * 
 * @module services/seedWords
 */

import { getSupabaseClient } from './supabaseClient';
// @ts-ignore
import a2Vocab from '../data/a2_vocab.json';

/**
 * Seeds the words_library table with data from a2_vocab.json
 * Uses upsert to avoid duplicate entries
 * 
 * @returns {Promise<{ success: boolean; count: number; error?: string }>}
 */
export async function seedWordsToLibrary(): Promise<{ success: boolean; count: number; error?: string }> {
    const supabase = getSupabaseClient();

    if (!supabase) {
        return {
            success: false,
            count: 0,
            error: 'Supabase client not available. Please check your configuration.'
        };
    }

    try {
        // Map JSON fields to Supabase column names
        const cleanedWords = a2Vocab.map((word: any) => ({
            word: word.term,              // term → word
            translation: word.meaning,     // meaning → translation
            example: word.example,
            category: word.type,          // type → category
            level: word.level
            // Note: uuid is auto-generated, status/reviewDate are user-specific
        }));

        console.log(`🌱 Starting seed process for ${cleanedWords.length} words...`);

        // Batch insert in chunks of 100 to avoid hitting limits
        const BATCH_SIZE = 100;
        let totalInserted = 0;

        for (let i = 0; i < cleanedWords.length; i += BATCH_SIZE) {
            const batch = cleanedWords.slice(i, i + BATCH_SIZE);

            const { error } = await supabase
                .from('words_library')
                .upsert(batch, {
                    onConflict: 'word', // Requires UNIQUE constraint on 'word' column
                    ignoreDuplicates: false
                });

            if (error) {
                console.error(`❌ Error in batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error);
                return {
                    success: false,
                    count: totalInserted,
                    error: `Failed at batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`
                };
            }

            totalInserted += batch.length;
            console.log(`✅ Seeded batch ${Math.floor(i / BATCH_SIZE) + 1} (${totalInserted}/${cleanedWords.length})`);
        }

        console.log(`🎉 Successfully seeded ${totalInserted} words to words_library table!`);

        return {
            success: true,
            count: totalInserted
        };

    } catch (error) {
        console.error('❌ Seed operation failed:', error);
        return {
            success: false,
            count: 0,
            error: error instanceof Error ? error.message : 'Unknown error during seeding'
        };
    }
}

/**
 * Checks if words_library table is empty
 * Useful for determining if seeding is needed
 * 
 * @returns {Promise<boolean>} True if table is empty
 */
export async function isLibraryEmpty(): Promise<boolean> {
    const supabase = getSupabaseClient();

    if (!supabase) {
        console.warn('Supabase not available');
        return true;
    }

    try {
        const { count, error } = await supabase
            .from('words_library')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error checking library:', error);
            return true;
        }

        return count === 0;
    } catch (error) {
        console.error('Error checking if library is empty:', error);
        return true;
    }
}
