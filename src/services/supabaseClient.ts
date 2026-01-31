/**
 * Supabase Client Configuration
 * 
 * Provides a singleton Supabase client instance with proper typing.
 * Handles authentication and database operations.
 * 
 * @module services/supabaseClient
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

/**
 * Supabase configuration from environment variables
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Validates that required Supabase environment variables are set
 * 
 * @throws {Error} If environment variables are missing
 */
function validateConfig(): void {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            'Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
        );
    }

    if (supabaseUrl.includes('your_supabase') || supabaseAnonKey.includes('your_supabase')) {
        console.warn(
            '⚠️  Supabase is not configured. Using offline mode only. ' +
            'To enable cloud sync, update your .env file with real Supabase credentials.'
        );
    }
}

/**
 * Singleton Supabase client instance
 */
let supabaseInstance: SupabaseClient<Database> | null = null;

if (supabaseUrl && !supabaseUrl.includes('your_supabase')) {
    console.log(`🔌 Supabase Client Initialized: ${supabaseUrl}`);
}

/**
 * Gets or creates the Supabase client instance
 * 
 * @returns {SupabaseClient<Database> | null} Supabase client or null if not configured
 * 
 * @example
 * ```typescript
 * const supabase = getSupabaseClient();
 * if (supabase) {
 *   const { data, error } = await supabase.from('profiles').select('*');
 * }
 * ```
 */
export function getSupabaseClient(): SupabaseClient<Database> | null {
    // Return null if Supabase is not configured (offline mode)
    if (!supabaseUrl || !supabaseAnonKey ||
        supabaseUrl.includes('your_supabase') ||
        supabaseAnonKey.includes('your_supabase')) {
        return null;
    }

    // Create singleton instance
    if (!supabaseInstance) {
        try {
            validateConfig();
            supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true,
                },
            });
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            return null;
        }
    }

    return supabaseInstance;
}

/**
 * Checks if Supabase is properly configured and available
 * 
 * @returns {boolean} True if Supabase is available
 */
export function isSupabaseAvailable(): boolean {
    return getSupabaseClient() !== null;
}

/**
 * Gets the current authenticated user
 * Uses cached session first to avoid unnecessary API calls
 * 
 * @returns {Promise<User | null>} Current user or null
 */
export async function getCurrentUser() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
        // First try to get from session cache (faster, no network call)
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
            return session.user;
        }

        // Fallback: try to get user directly (forces refresh)
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Signs in with email and password
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{ user: User | null; error: Error | null }>}
 */
export async function signIn(email: string, password: string) {
    const supabase = getSupabaseClient();
    if (!supabase) {
        return { user: null, error: new Error('Supabase not configured') };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    return { user: data.user, error };
}

/**
 * Signs up a new user
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{ user: User | null; error: Error | null }>}
 */
export async function signUp(email: string, password: string) {
    const supabase = getSupabaseClient();
    if (!supabase) {
        return { user: null, error: new Error('Supabase not configured') };
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    return { user: data.user, error };
}

/**
 * Signs in with GitHub OAuth
 * 
 * Redirects the user to GitHub for authentication.
 * On success, redirects back to the application (window.location.origin).
 * 
 * @returns {Promise<{ data: { session: Session | null; url: string | null } | null; error: AuthError | null }>}
 */
export async function signInWithGithub() {
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.error('❌ Supabase not configured for GitHub Auth');
        return { data: null, error: new Error('Supabase not configured') };
    }

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin,
            },
        });

        if (error) {
            console.error('❌ GitHub Login Error:', error.message);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('❌ GitHub Login Exception:', err);
        return {
            data: null,
            error: err instanceof Error ? err : new Error('Unknown error during GitHub login')
        };
    }
}

/**
 * Signs out the current user
 * 
 * @returns {Promise<{ error: Error | null }>}
 */
export async function signOut() {
    const supabase = getSupabaseClient();
    if (!supabase) {
        return { error: new Error('Supabase not configured') };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
}

// Export the client for direct access when needed
export const supabase = getSupabaseClient();
