-- Diagnostic: Check RLS Policies and User Creation

-- Check existing policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Check if there's an auth trigger to create user profiles
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'users';

-- Check user_progress RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'user_progress'
ORDER BY policyname;

-- Check subscriptions RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'subscriptions'
ORDER BY policyname;
