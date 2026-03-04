-- Leaderboard RESET & FIX
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Completely remove all old policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to view all profiles" ON public.users;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.users;

-- 2. Create the MASTER POLICY for visibility
-- This ensures ANY logged-in user can see names/XP of ALL users
CREATE POLICY "Leaderboard Visibility" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (true);

-- 3. Create the update policy so you can still save your own XP
CREATE POLICY "Self Update" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- 4. Enable RLS (just in case it was off)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. VERIFY (Run this part separately if you want)
-- This lists exactly how many users are stored in the database
-- SELECT count(*) FROM auth.users; -- Auth records
-- SELECT count(*) FROM public.users; -- Profile records
