-- COMPLETE FIX: Auth Trigger for Auto-Creating User Profiles
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing trigger if it exists (to reset)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Create the function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new user profile
  INSERT INTO public.users (
    id, 
    email, 
    first_name, 
    last_name, 
    onboarding_completed,
    created_at, 
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE((new.raw_user_meta_data->>'full_name')::text, 'User'),
    '',
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't block signup
  RAISE WARNING 'Error creating user profile: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 3: Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verify trigger was created
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Step 5: Test by checking if any users exist
SELECT COUNT(*) as user_count FROM public.users;
