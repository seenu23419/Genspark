-- MASTER SETUP SCRIPT (Run this in the CORRECT project)
-- This creates everything needed for the Leaderboard and Profiles to work.

-- 1. Create the Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the Automatic Signup Trigger
-- This makes sure anyone who signs up is added to the Leaderboard instantly.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. UNLOCK EVERYTHING (The Leaderboard Fix)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.users TO anon, authenticated, service_role;

-- 4. ADD PREVIOUS USERS (If any exist in Auth but not in Profiles)
INSERT INTO public.users (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. VERIFY
SELECT count(*) as total_users_on_leaderboard FROM public.users;
