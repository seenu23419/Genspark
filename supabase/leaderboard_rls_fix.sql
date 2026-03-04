-- Leaderboard Visibility Fix
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- This allows all logged-in users to see each other's names and points on the leaderboard.

-- 1. Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Create the policy for Global Visibility
-- This allows any 'authenticated' user (someone logged in) to SELECT any row in the users table.
-- If a policy with this name already exists, you can skip this or DROP it first.
DROP POLICY IF EXISTS "Allow authenticated users to view all profiles" ON public.users;

CREATE POLICY "Allow authenticated users to view all profiles" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (true);

-- 3. Verify that it's working
-- Run: SELECT * FROM public.users LIMIT 5;
-- You should now be able to see other users besides yourself.
