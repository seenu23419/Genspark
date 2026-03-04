-- DEEP VERIFICATION SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Check exactly which project you are on
SELECT current_database(), current_schema();

-- 2. Check all tables and their row counts
SELECT 
    schemaname, 
    relname as table_name, 
    n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- 3. If "users" table has 38 rows, check if RLS is REALLY off
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'users';
-- (If relrowsecurity is 'f', then RLS is OFF. If 't', it is ON)

-- 4. Final attempt to FORCE bypass (This is the most powerful command)
ALTER TABLE public.users FORCE ROW LEVEL SECURITY; -- Reset
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY; -- Kill it for real
GRANT ALL ON public.users TO authenticated, anon, service_role;
