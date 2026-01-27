-- FIX: Add missing streak columns to users table
-- Run this in the Supabase SQL Editor to resolve the "automatic refresh" loop

-- 1. Ensure columns exist
DO $$
BEGIN
    -- Add streak column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'streak') THEN
        ALTER TABLE public.users ADD COLUMN streak INTEGER DEFAULT 0;
    END IF;

    -- Add last_active_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_active_at') THEN
        ALTER TABLE public.users ADD COLUMN last_active_at TIMESTAMPTZ;
    END IF;

    -- Add activity_log column if missing for historical tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'activity_log') THEN
        ALTER TABLE public.users ADD COLUMN activity_log JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add completed_lesson_ids column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'completed_lesson_ids') THEN
        ALTER TABLE public.users ADD COLUMN completed_lesson_ids TEXT[] DEFAULT '{}'::text[];
    END IF;

    -- Add unlocked_lesson_ids column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'unlocked_lesson_ids') THEN
        ALTER TABLE public.users ADD COLUMN unlocked_lesson_ids TEXT[] DEFAULT '{"c1"}'::text[];
    END IF;
END $$;

-- 2. Ensure RLS Policy exists
-- We drop and recreate to ensure it's up to date and correctly assigned
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
    
    CREATE POLICY "Users can update own profile" ON public.users
        FOR UPDATE USING (auth.uid() = id);
EXCEPTION
    WHEN undefined_object THEN
        -- Handle cases where table might not exist yet during initial setup
        NULL;
END $$;

-- 3. Add column descriptions for clarity and as cache hints
COMMENT ON COLUMN public.users.streak IS 'Current daily coding streak';
COMMENT ON COLUMN public.users.last_active_at IS 'Timestamp of last meaningful activity for streak calculation';
COMMENT ON COLUMN public.users.activity_log IS 'Historical record of dates user was active (last 30-60 entries)';
