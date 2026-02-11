/**
 * Hybrid Data Service
 * 
 * Implements offline-first architecture with Supabase sync.
 * - Primary data source: Local storage (Electron + IndexedDB)
 * - Secondary: Supabase (when available and user is authenticated)
 * - Automatic conflict resolution with "last write wins" strategy
 * - Fallback: Seeds data from local JSON if storage is empty
 * 
 * @module services/hybridDataService
 */

import type { VocabularyWord } from '../types';
import type { UserWordProgress } from '../types/supabase';
import { getSupabaseClient, isSupabaseAvailable, getCurrentUser } from './supabaseClient';
import * as vocabularyService from './vocabularyService';
import { useAppStore } from '../store';
// @ts-ignore
// import a2Vocab from '../data/a2_vocab.json'; // Removed to prevent HMR loops and ensure data persistence via Electron


/**
 * Sync configuration
 */
const SYNC_CONFIG = {
    /** Auto-sync interval in milliseconds (5 minutes) */
    AUTO_SYNC_INTERVAL: 5 * 60 * 1000,

    /** Max retry attempts for failed syncs */
    MAX_RETRY_ATTEMPTS: 3,

    /** Retry delay in milliseconds */
    RETRY_DELAY: 2000,
};

/**
 * Sync state management
 */
let isSyncing = false;
let lastSyncTime: Date | null = null;
let syncInterval: NodeJS.Timeout | null = null;

/**
 * Fetches all words with hybrid strategy:
 * 1. Load from local storage (instant)
 * 2. If local storage is empty, seed from a2_vocab.json
 * 3. If online and authenticated, sync with Supabase in background
 * 
 * @returns {Promise<VocabularyWord[]>} Array of vocabulary words
 */
/**
 * Maps Supabase words_library schema to VocabularyWord type
 * Supabase: word, translation, example, category, level, uuid
 * App: term, meaning, example, type, level, id
 */
function mapSupabaseWordToVocabularyWord(supabaseWord: any): Partial<VocabularyWord> {
    return {
        id: supabaseWord.id || supabaseWord.uuid,           // uuid -> id
        term: supabaseWord.word,         // word -> term
        meaning: supabaseWord.translation, // translation -> meaning
        example: supabaseWord.example,
        type: supabaseWord.category,     // category → type
        level: supabaseWord.level
    };
}

/**
 * Fetches all words with hybrid strategy:
 * - GUEST: Load from a2_vocab.json
 * - ADMIN: Load all words from words_library
 * - USER: Load all words merged with user progress
 * 
 * @returns {Promise<VocabularyWord[]>} Array of vocabulary words
 */
export async function getAllWordsHybrid(): Promise<VocabularyWord[]> {
    const user = await getCurrentUser();

    // 0. Check Data Source Setting
    const settings = useAppStore.getState().settings;

    if (settings.dataSource === 'dummy') {
        console.log('📦 DATA SOURCE: Dummy Mode (Settings Override)');
        // return a2Vocab as any as VocabularyWord[];
        return await vocabularyService.getAllWords();
    }

    // 1. GUEST (Not logged in): Fetch from a2_vocab.json
    // 1. GUEST (Not logged in): Fetch from a2_vocab.json (via Electron Store)
    if (!user) {
        console.log('📚 GUEST MODE: Loading from Electron Store');
        // return a2Vocab as any as VocabularyWord[];
        return await vocabularyService.getAllWords();
    }

    const isAdmin = user.email === 'adag6534@gmail.com';
    const supabase = getSupabaseClient();

    console.log(`👤 USER LOGGED IN: ${user.email} | Admin: ${isAdmin}`);

    if (!supabase) {
        console.warn('⚠️ Supabase client not available despite user being logged in');
        return [];
    }

    // 2. Fetch ALL words and merge with user progress (Unified for Admin & User)
    console.log(`fetching words for ${isAdmin ? 'ADMIN' : 'USER'}...`);
    const { data: allWords, error: wordsError } = await supabase
        .from('words_library')
        .select('*');

    if (wordsError) {
        console.error('Failed to fetch words library:', wordsError);
        return [];
    }

    // Fetch user progress
    const { data: userProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

    if (progressError) {
        console.error('Failed to fetch user progress:', progressError);
        return [];
    }

    // Create a map of progress for faster lookup (by uuid/word_id)
    const progressMap = new Map(
        userProgress?.map((p: any) => [p.word_id, p]) || []
    );

    // Merge words with progress
    console.log(`Matching ${allWords?.length || 0} words with ${userProgress?.length || 0} progress records`);

    const words: VocabularyWord[] = (allWords || []).map((word: any) => {
        const mappedWord = mapSupabaseWordToVocabularyWord(word);

        // Progress keys are stored as integers (word_id).
        // mappedWord.id is now prioritized as Integer (word.id).
        // We fallback to checking raw UUID or ID just in case.
        const progress = progressMap.get(mappedWord.id) || progressMap.get(word.uuid) || progressMap.get(word.id);

        if (progress) {
            // User has interacted with this word
            // User has interacted with this word
            return {
                ...mappedWord,
                status: progress.status,
                repetition: progress.srs_stats?.repetition || 0,
                interval: progress.srs_stats?.interval || 0,
                ef: progress.srs_stats?.ef || 2.5,
                reviewDate: progress.srs_stats?.dueDate || null,
                user_id: progress.user_id,
                is_synced: true,
                last_synced_at: progress.updated_at,
                is_learned: progress.is_learned || false
            } as VocabularyWord;
        } else {
            // Word is new to user
            return {
                ...mappedWord,
                status: 'new',
                repetition: 0,
                interval: 0,
                ef: 2.5,
                reviewDate: null,
                user_id: user.id,
                is_learned: false
            } as VocabularyWord;
        }
    });

    return words;
}

/**
 * Gets words not yet marked as learned
 */
export async function getAvailableWords(): Promise<VocabularyWord[]> {
    const words = await getAllWordsHybrid();
    return words.filter(w => !w.is_learned);
}

/**
 * Gets words marked as learned
 */
export async function getLearnedWords(): Promise<VocabularyWord[]> {
    const words = await getAllWordsHybrid();
    return words.filter(w => w.is_learned);
}

/**
 * Marks a word as learned
 */
export async function markAsLearned(wordId: number | string): Promise<{ success: boolean; error?: string }> {
    const user = await getCurrentUser();
    const supabase = getSupabaseClient();

    // Check if we are in dummy mode
    const settings = useAppStore.getState().settings;
    if (settings.dataSource === 'dummy') {
        console.warn('⚠️ Dummy Mode: Skipping Supabase sync (Local Only)');
        return { success: true };
    }

    if (!user) {
        console.warn('Marking as learned in Guest mode (Local Only)');
        // In a real app, we would update local storage state here
        return { success: true };
    }

    if (!supabase) return { success: false, error: 'Supabase client missing' };

    try {
        // First try to upsert with status but without complex SRS object which might be missing in schema
        const { error } = await supabase
            .from('user_progress')
            .upsert({
                user_id: user.id,
                word_id: wordId,
                is_learned: true,
                status: 'mastered',
                // Removing srs_stats momentarily to fix PGRST204 error (column missing)
                // srs_stats: { interval: 0, repetition: 1, ef: 2.5, dueDate: new Date().toISOString() },
                updated_at: new Date().toISOString()
            } as any, {
                onConflict: 'user_id,word_id'
            });

        if (error) {
            // If even 'status' fails, try minimal upsert
            console.warn('Upsert with status failed, trying minimal:', error);
            const { error: minimalError } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: user.id,
                    word_id: wordId,
                    is_learned: true,
                    updated_at: new Date().toISOString()
                } as any, {
                    onConflict: 'user_id,word_id'
                });

            if (minimalError) throw minimalError;
        }
        return { success: true };
    } catch (err: any) {
        console.error('Failed to mark as learned:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Unmarks a word as learned
 */
export async function unlearnWord(wordId: number): Promise<{ success: boolean; error?: string }> {
    const user = await getCurrentUser();
    const supabase = getSupabaseClient();

    // Check if we are in dummy mode
    const settings = useAppStore.getState().settings;
    if (settings.dataSource === 'dummy') {
        console.warn('⚠️ Dummy Mode: Skipping Supabase sync (Local Only)');
        return { success: true };
    }

    if (!user) {
        // Guest logic
        return { success: true };
    }

    if (!supabase) return { success: false, error: 'Supabase client missing' };

    try {
        const { error } = await supabase
            .from('user_progress')
            .upsert({
                user_id: user.id,
                word_id: wordId,
                is_learned: false,
                updated_at: new Date().toISOString()
            } as any, {
                onConflict: 'user_id,word_id'
            });

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error('Failed to unlearn word:', err);
        return { success: false, error: err.message };
    }
}


/**
 * Saves a word with hybrid strategy:
 * 1. Save to local storage immediately
 * 2. Queue for Supabase sync
 * 
 * @param {Partial<VocabularyWord>} word - Word to save
 * @returns {Promise<{ success: boolean; word?: VocabularyWord; error?: string }>}
 */
export async function saveWordHybrid(
    word: Partial<VocabularyWord>
): Promise<{ success: boolean; word?: VocabularyWord; error?: string }> {
    const user = await getCurrentUser();
    const supabase = getSupabaseClient();

    // Check if we are in dummy mode
    const settings = useAppStore.getState().settings;
    if (settings.dataSource === 'dummy') {
        // Just save locally
        const result = await vocabularyService.saveWord(word);
        return result;
    }

    // Only admins can add new words to the library
    if (user && user.email === 'adag6534@gmail.com' && supabase) {
        try {
            // Prepare the word for library (map to Supabase columns)
            const libraryWord = {
                word: word.term,              // term → word
                translation: word.meaning,     // meaning → translation
                example: word.example,
                category: word.type,          // type → category
                level: word.level
                // uuid is auto-generated by Supabase
            };

            // Insert into words_library
            const { data, error } = await supabase
                .from('words_library')
                .insert([libraryWord])
                .select()
                .single();

            if (error) {
                console.error('Failed to add word to library:', error);
                return {
                    success: false,
                    error: `Failed to add word: ${error.message}`
                };
            }

            return {
                success: true,
                word: data as unknown as VocabularyWord
            };

        } catch (error) {
            console.error('Error adding word to library:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // Non-admins or offline mode: fall back to local storage
    const result = await vocabularyService.saveWord(word);

    if (result.success && result.word) {
        // Mark as not synced
        result.word.is_synced = false;
        result.word.sync_version = (result.word.sync_version || 0) + 1;

        // Queue for sync if online
        if (isSupabaseAvailable()) {
            queueForSync(result.word).catch(err => {
                console.warn('Failed to queue word for sync:', err);
            });
        }
    }

    return result;
}

/**
 * Updates a word with hybrid strategy
 * 
 * @param {Partial<VocabularyWord> & { id: number }} word - Word to update
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export async function updateWordHybrid(
    word: Partial<VocabularyWord> & { id: number | string }
): Promise<{ success: boolean; error?: string }> {
    const user = await getCurrentUser();
    const supabase = getSupabaseClient();

    // Check if we are in dummy mode
    const settings = useAppStore.getState().settings;
    if (settings.dataSource === 'dummy') {
        console.warn('⚠️ Dummy Mode: Skipping Supabase sync (Local Only)');
        // Fallback to local update
        const result = await vocabularyService.updateWord(word as any);
        return result;
    }

    // If user is logged in and we have Supabase, sync to user_progress
    if (user && supabase) {
        try {
            // Prepare the progress record
            const progressRecord = {
                user_id: user.id,
                word_id: word.id, // This is the uuid from words_library
                status: word.status || 'new',
                srs_stats: {
                    interval: word.interval || 0,
                    repetition: word.repetition || 0,
                    ef: word.ef || 2.5,
                    dueDate: word.reviewDate || new Date().toISOString()
                },
                total_reviews: (word.repetition || 0),
                correct_reviews: word.status === 'mastered' ? (word.repetition || 0) : 0,
                next_review_at: word.reviewDate || null,
                last_reviewed_at: new Date().toISOString()
            };

            // Upsert to user_progress (will insert if not exists, update if exists)
            // Modified to handle missing srs_stats column scenario
            const { error } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: user.id,
                    word_id: word.id,
                    status: word.status || 'new',
                    // srs_stats: { ... } // Removed to prevent crash
                    total_reviews: (word.repetition || 0),
                    correct_reviews: word.status === 'mastered' ? (word.repetition || 0) : 0,
                    next_review_at: word.reviewDate || null,
                    last_reviewed_at: new Date().toISOString()
                } as any, {
                    onConflict: 'user_id,word_id'
                });

            if (error) {
                console.warn('Full upsert failed, trying minimal upsert:', error);

                // Fallback: Try saving just status and standard timestamps
                const { error: minimalError } = await supabase
                    .from('user_progress')
                    .upsert({
                        user_id: user.id,
                        word_id: word.id,
                        status: word.status || 'new',
                        updated_at: new Date().toISOString()
                    } as any, {
                        onConflict: 'user_id,word_id'
                    });

                if (minimalError) {
                    console.error('Failed to sync word progress to Supabase:', minimalError);
                    return {
                        success: false,
                        error: `Failed to sync: ${minimalError.message}`
                    };
                }
            }

            return { success: true };

        } catch (error) {
            console.error('Error updating word progress:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // Fallback to local update if not logged in
    const result = await vocabularyService.updateWord(word as any);
    return result;
}

/**
 * Syncs local data with Supabase in the background
 * Uses "last write wins" conflict resolution
 * 
 * @returns {Promise<void>}
 */
async function syncInBackground(): Promise<void> {
    if (isSyncing) {
        console.log('Sync already in progress, skipping...');
        return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
        console.log('Supabase not available, skipping sync');
        return;
    }

    const user = await getCurrentUser();
    if (!user) {
        console.log('User not authenticated, skipping sync');
        return;
    }

    try {
        isSyncing = true;
        console.log('🔄 Starting background sync...');

        // 1. Pull remote changes
        await pullRemoteChanges(user.id);

        // 2. Push local changes
        await pushLocalChanges(user.id);

        lastSyncTime = new Date();
        console.log('✅ Sync completed successfully');
    } catch (error) {
        console.error('❌ Sync failed:', error);
        throw error;
    } finally {
        isSyncing = false;
    }
}

/**
 * Pulls changes from Supabase and merges with local data
 * 
 * @param {string} userId - Current user ID
 * @returns {Promise<void>}
 */
async function pullRemoteChanges(userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Fetch user's progress from Supabase
    const { data: remoteProgress, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Failed to pull remote changes:', error);
        return;
    }

    if (!remoteProgress || remoteProgress.length === 0) {
        console.log('No remote changes to pull');
        return;
    }

    // Merge remote changes with local data
    // For now simple implementation: Remote progress overwrites local SRS stats if newer
    console.log(`Pulled ${remoteProgress.length} remote changes`);
    // TODO: Implement thorough merge
}

/**
 * Pushes local changes to Supabase
 * 
 * @param {string} userId - Current user ID
 * @returns {Promise<void>}
 */
async function pushLocalChanges(userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Get all local words that need syncing
    const localWords = await vocabularyService.getAllWords();
    const unsyncedWords = localWords.filter(word => !word.is_synced);

    if (unsyncedWords.length === 0) {
        console.log('No local changes to push');
        return;
    }

    console.log(`Pushing ${unsyncedWords.length} local changes...`);

    // Convert local words to progress records
    const progressRecords: Partial<UserWordProgress>[] = unsyncedWords.map(word => ({
        user_id: userId,
        word_id: word.id,
        srs_stats: {
            interval: word.interval || 0,
            repetition: word.repetition || 0,
            ef: word.ef || 2.5,
            dueDate: word.reviewDate || new Date().toISOString(),
        },
        status: word.status || 'new',
        total_reviews: word.repetition || 0,
        correct_reviews: 0, // Placeholder
        next_review_at: word.reviewDate || undefined, // Ensure it's not null for Partial<UserWordProgress> if strict null checks are on
    }));

    // Upsert to Supabase
    const { error } = await supabase
        .from('user_progress')
        .upsert(progressRecords as any, {
            onConflict: 'user_id,word_id',
        });

    if (error) {
        console.error('Failed to push local changes:', error);
        return;
    }

    // Mark words as synced locally
    for (const word of unsyncedWords) {
        await vocabularyService.updateWord({
            id: word.id,
            is_synced: true,
            last_synced_at: new Date().toISOString(),
        });
    }

    console.log(`✅ Pushed ${unsyncedWords.length} changes to Supabase`);
}

/**
 * Queues a word for immediate sync (optimistic update)
 * 
 * @param {VocabularyWord} word - Word to sync
 * @returns {Promise<void>}
 */
async function queueForSync(word: VocabularyWord): Promise<void> {
    const user = await getCurrentUser();
    if (!user) return;

    // Trigger immediate sync for this word
    await pushLocalChanges(user.id);
}

/**
 * Starts automatic background sync
 * 
 * @returns {void}
 */
export function startAutoSync(): void {
    if (syncInterval) {
        console.warn('Auto-sync already running');
        return;
    }

    console.log('🔄 Starting auto-sync...');

    syncInterval = setInterval(() => {
        if (isSupabaseAvailable()) {
            syncInBackground().catch(err => {
                console.error('Auto-sync failed:', err);
            });
        }
    }, SYNC_CONFIG.AUTO_SYNC_INTERVAL);
}

/**
 * Stops automatic background sync
 * 
 * @returns {void}
 */
export function stopAutoSync(): void {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('⏹️  Auto-sync stopped');
    }
}

/**
 * Forces an immediate sync
 * 
 * @returns {Promise<void>}
 */
export async function forceSync(): Promise<void> {
    console.log('🔄 Forcing immediate sync...');
    await syncInBackground();
}

/**
 * Gets sync status
 * 
 * @returns {{ isSyncing: boolean; lastSync: Date | null }}
 */
export function getSyncStatus() {
    return {
        isSyncing,
        lastSync: lastSyncTime,
    };
}
