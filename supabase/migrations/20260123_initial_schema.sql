-- =====================================================
-- Vocabulary Learning App - Database Schema
-- =====================================================
-- This migration creates the core database structure with
-- Row Level Security (RLS) policies for secure multi-tenant access.
--
-- Tables:
-- 1. profiles - User profiles and preferences
-- 2. word_packs - Downloadable vocabulary packs
-- 3. pack_words - Words belonging to packs
-- 4. user_word_progress - User's learning progress per word
--
-- Security:
-- - RLS enabled on all tables
-- - Users can only access their own data
-- - Word packs are read-only for all authenticated users
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
-- Stores user profiles and preferences
-- One-to-one relationship with auth.users

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    preferences JSONB NOT NULL DEFAULT '{
        "target_language": "tr",
        "daily_goal": 10,
        "notifications_enabled": true,
        "theme": "auto",
        "app_settings": {
            "workHoursStart": "09:00",
            "workHoursEnd": "18:00",
            "focusModeEnabled": true,
            "frequency": 15
        }
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. WORD PACKS TABLE
-- =====================================================
-- Stores vocabulary pack metadata
-- Read-only for all authenticated users

CREATE TABLE IF NOT EXISTS public.word_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    word_count INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    download_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.word_packs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for word_packs
-- All authenticated users can read word packs
CREATE POLICY "Authenticated users can view word packs"
    ON public.word_packs
    FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can insert/update/delete word packs
-- (This would require a custom claim or separate admin role)

-- =====================================================
-- 3. PACK WORDS TABLE
-- =====================================================
-- Stores individual words belonging to packs

CREATE TABLE IF NOT EXISTS public.pack_words (
    id BIGSERIAL PRIMARY KEY,
    pack_id UUID NOT NULL REFERENCES public.word_packs(id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    meaning TEXT NOT NULL,
    example TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('noun', 'verb', 'adjective', 'adverb', 'phrase', 'other')),
    level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_pack_words_pack_id ON public.pack_words(pack_id);
CREATE INDEX idx_pack_words_level ON public.pack_words(level);

-- Enable RLS
ALTER TABLE public.pack_words ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pack_words
-- All authenticated users can read words
CREATE POLICY "Authenticated users can view pack words"
    ON public.pack_words
    FOR SELECT
    TO authenticated
    USING (true);

-- =====================================================
-- 4. USER WORD PROGRESS TABLE
-- =====================================================
-- Tracks user's learning progress for each word

CREATE TABLE IF NOT EXISTS public.user_word_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id BIGINT NOT NULL REFERENCES public.pack_words(id) ON DELETE CASCADE,
    
    -- SRS Statistics (stored as JSONB for flexibility)
    srs_stats JSONB NOT NULL DEFAULT '{
        "interval": 0,
        "repetition": 0,
        "ef": 2.5,
        "dueDate": null
    }'::jsonb,
    
    -- Learning status
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'learning', 'hard', 'easy', 'mastered', 'impartial')),
    
    -- Review statistics
    total_reviews INTEGER NOT NULL DEFAULT 0,
    correct_reviews INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    next_review_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one progress record per user per word
    UNIQUE(user_id, word_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_user_word_progress_user_id ON public.user_word_progress(user_id);
CREATE INDEX idx_user_word_progress_next_review ON public.user_word_progress(next_review_at);
CREATE INDEX idx_user_word_progress_status ON public.user_word_progress(status);

-- Enable RLS
ALTER TABLE public.user_word_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_word_progress
-- Users can only view their own progress
CREATE POLICY "Users can view own progress"
    ON public.user_word_progress
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
    ON public.user_word_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
    ON public.user_word_progress
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete own progress"
    ON public.user_word_progress
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_word_packs_updated_at
    BEFORE UPDATE ON public.word_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pack_words_updated_at
    BEFORE UPDATE ON public.pack_words
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_word_progress_updated_at
    BEFORE UPDATE ON public.user_word_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Insert a sample word pack
INSERT INTO public.word_packs (name, description, level, category, word_count)
VALUES 
    ('Essential A2 Vocabulary', 'Core vocabulary for A2 level learners', 'A2', 'General', 300),
    ('Business English B1', 'Professional vocabulary for workplace', 'B1', 'Business', 150)
ON CONFLICT DO NOTHING;

-- Note: Actual word data should be inserted separately
-- This is just the schema setup
