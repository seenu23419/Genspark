-- GenSpark Database Schema

-- Create users table (only run this if table doesn't exist)
-- If you get an error about table already existing, skip this section
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) STORED,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  subscription_status TEXT DEFAULT 'FREE' CHECK (subscription_status IN ('FREE', 'PREMIUM_ACTIVE', 'PREMIUM_EXPIRED')),
  subscription_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table (skip if they already exist)
-- CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Create subscriptions table (only run this if table doesn't exist)
-- If you get an error about table already existing, skip this section
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  plan TEXT DEFAULT 'PREMIUM' CHECK (plan IN ('FREE', 'PREMIUM')),
  status TEXT DEFAULT 'PREMIUM_ACTIVE' CHECK (status IN ('FREE', 'PREMIUM_ACTIVE', 'PREMIUM_EXPIRED')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  razorpay_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS for subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions table (skip if they already exist)
-- CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can update own subscription" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Create payments table (only run this if table doesn't exist)
-- If you get an error about table already existing, skip this section
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in paise (for INR)
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  razorpay_payment_id TEXT UNIQUE NOT NULL,
  razorpay_subscription_id TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments table (skip if they already exist)
-- CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- Create compiler_executions table (only run this if table doesn't exist)
-- If you get an error about table already existing, skip this section
CREATE TABLE IF NOT EXISTS public.compiler_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for compiler_executions table
ALTER TABLE public.compiler_executions ENABLE ROW LEVEL SECURITY;

-- Create policies for compiler_executions table (skip if they already exist)
-- CREATE POLICY "Users can view own executions" ON public.compiler_executions FOR SELECT USING (auth.uid() = user_id);

-- Create certificates table (only run this if table doesn't exist)
-- If you get an error about table already existing, skip this section
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_name TEXT NOT NULL,
  mentor_name TEXT NOT NULL,
  completion_date TIMESTAMPTZ NOT NULL,
  certificate_id TEXT UNIQUE NOT NULL, -- Generated certificate ID
  pdf_url TEXT, -- URL to the certificate PDF in Supabase storage
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for certificates table
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Create policies for certificates table (skip if they already exist)
-- CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Public can view certificates by ID" ON public.certificates FOR SELECT USING (true); -- For verification page

-- Create study goals table (only run this if table doesn't exist)
CREATE TABLE IF NOT EXISTS public.study_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  target INTEGER NOT NULL,
  current INTEGER DEFAULT 0,
  unit TEXT NOT NULL, -- 'lessons', 'days', 'problems', etc.
  deadline TIMESTAMPTZ NOT NULL,
  color_gradient TEXT DEFAULT 'from-blue-500 to-cyan-500', -- Tailwind gradient classes
  icon_type TEXT DEFAULT 'target', -- 'target', 'zap', 'clock', etc.
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for study_goals table
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for study_goals table
CREATE POLICY "Users can view own goals" ON public.study_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON public.study_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.study_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.study_goals FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Functions
CREATE OR REPLACE FUNCTION public.is_user_member(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users WHERE id = user_id AND id = auth.uid()
  );
END;
$$;

-- Update user profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, avatar_url, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url',
    false
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();