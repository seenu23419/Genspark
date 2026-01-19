-- Force schema update for practice_progress
-- Run this in Supabase SQL Editor to fix "column not found" errors

-- 1. Ensure table exists
CREATE TABLE IF NOT EXISTS practice_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, challenge_id)
);

-- 2. Add columns safely if they are missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practice_progress' AND column_name = 'status') THEN
        ALTER TABLE practice_progress ADD COLUMN status TEXT CHECK (status IN ('attempted', 'completed')) DEFAULT 'attempted';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practice_progress' AND column_name = 'code_snapshot') THEN
        ALTER TABLE practice_progress ADD COLUMN code_snapshot TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practice_progress' AND column_name = 'language_used') THEN
        ALTER TABLE practice_progress ADD COLUMN language_used TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practice_progress' AND column_name = 'attempts_count') THEN
        ALTER TABLE practice_progress ADD COLUMN attempts_count INTEGER DEFAULT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practice_progress' AND column_name = 'last_attempt_at') THEN
        ALTER TABLE practice_progress ADD COLUMN last_attempt_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'practice_progress' AND column_name = 'completed_at') THEN
        ALTER TABLE practice_progress ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Refresh cache hint (Supabase logic specific, sometimes helpful to just alter something trivial)
COMMENT ON TABLE practice_progress IS 'Tracks user coding practice progress';
