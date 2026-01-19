-- Practice Progress Table Schema
-- Run this in your Supabase SQL Editor to enable permanent saving

CREATE TABLE IF NOT EXISTS practice_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('attempted', 'completed')),
    code_snapshot TEXT,
    language_used TEXT,
    attempts_count INTEGER DEFAULT 1,
    last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    last_opened_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per user per challenge
    UNIQUE(user_id, challenge_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_practice_progress_user_id ON practice_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_progress_challenge_id ON practice_progress(challenge_id);

-- Row Level Security (RLS)
ALTER TABLE practice_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own progress
CREATE POLICY "Users can view own practice progress"
    ON practice_progress FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own practice progress"
    ON practice_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own practice progress"
    ON practice_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_practice_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER practice_progress_updated_at
    BEFORE UPDATE ON practice_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_practice_progress_timestamp();

-- Grant permissions
GRANT ALL ON practice_progress TO authenticated;
GRANT ALL ON practice_progress TO service_role;
