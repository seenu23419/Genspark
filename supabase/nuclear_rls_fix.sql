-- NUCLEAR RLS FIX (Run this if the leaderboard is still empty)
-- This disables the "Lock" that stops users from seeing each other.

-- 1. Disable RLS entirely for a moment to ensure it's not the problem
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Drop EVERY policy just to be safe
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to view all profiles" ON public.users;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.users;
DROP POLICY IF EXISTS "Leaderboard Visibility" ON public.users;
DROP POLICY IF EXISTS "Self Update" ON public.users;

-- 3. Re-enable with a "Wide Open" policy for Reading
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PUBLIC_READ_ACCESS" 
ON public.users 
FOR SELECT 
USING (true);

CREATE POLICY "USER_SELF_UPDATE" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- 4. Check real counts
SELECT 'Auth Users (Signups)' as type, count(*) FROM auth.users
UNION ALL
SELECT 'Profile Users (Leaderboard)' as type, count(*) FROM public.users;
