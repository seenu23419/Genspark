-- FINAL UNLOCK SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Grant public permissions (The "Master Key")
GRANT SELECT ON public.users TO anon, authenticated;

-- 2. Force the policy to allow EVERYONE to read
DROP POLICY IF EXISTS "PUBLIC_READ_ACCESS" ON public.users;
CREATE POLICY "PUBLIC_READ_ACCESS" 
ON public.users 
FOR SELECT 
USING (true);

-- 3. Verify the final "Visible" names for the app
-- This will show 38 names if it worked
SELECT id, name, first_name, last_name, email FROM public.users LIMIT 40;
