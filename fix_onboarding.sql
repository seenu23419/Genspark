-- Run this in Supabase SQL Editor to fix the onboarding loop
-- This will set onboarding_completed to TRUE for your user

UPDATE users 
SET onboarding_completed = TRUE,
    first_name = COALESCE(first_name, 'User'),
    last_name = COALESCE(last_name, '')
WHERE id = '7982847e-9aaf-4024-ba0c-54879a2b20b8';

-- Verify the update
SELECT id, email, first_name, last_name, onboarding_completed 
FROM users 
WHERE id = '7982847e-9aaf-4024-ba0c-54879a2b20b8';
