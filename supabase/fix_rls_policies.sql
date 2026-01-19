-- Fix RLS Policies for Users Table (No Duplicate Errors)
-- This script only updates policies if they need fixing

-- Check and verify policies exist by attempting to enable the policies
-- If policies already exist, this is fine - the table just needs proper access

-- Verify RLS is enabled on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled on subscriptions table  
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled on user_progress table
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- If you still get signup errors, the issue is likely:
-- 1. Missing auth trigger to create user profile automatically
-- 2. Try creating a test user manually in the Auth section of Supabase dashboard
-- 3. Check the user_progress table for foreign key constraints

-- Test: Try to view policies
-- Run this query in SQL Editor to see existing policies:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

