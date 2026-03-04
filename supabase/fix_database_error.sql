-- 🚨 MASTER HARMONIZER v3 (The Final Fix)
-- Run this in the Supabase SQL Editor to fix the "Database error saving new user"

-- 1. DROP THE CONFLICTING COLUMN
-- The 'full_name' column in your current schema is "GENERATED", which prevents us from manually saving names.
ALTER TABLE public.users DROP COLUMN IF EXISTS full_name;

-- 2. ADD COMPATIBLE COLUMNS
-- We add 'name' and 'avatar' to match exactly what your code (SupabaseService.ts) is looking for.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. UPGRADE THE AUTO-SIGNUP TRIGGER
-- This function is now "Universal" - it looks for every possible way Supabase or Google might send a name.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    name, 
    first_name, 
    last_name, 
    avatar, 
    avatar_url,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'avatar', NEW.raw_user_meta_data->>'picture'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'avatar', NEW.raw_user_meta_data->>'picture'),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RE-APPLY THE TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. VERIFY
SELECT 'SUCCESS! Database is now harmonized and ready for signups.' as Status;
