-- Create practice_progress table to track problems
CREATE TABLE IF NOT EXISTS public.practice_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id TEXT NOT NULL,
  status TEXT DEFAULT 'attempted' CHECK (status IN ('attempted', 'completed')),
  code_snapshot TEXT,
  language_used TEXT,
  attempts_count INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  last_opened_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.practice_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own practice progress"
  ON public.practice_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice progress"
  ON public.practice_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice progress"
  ON public.practice_progress FOR UPDATE
  USING (auth.uid() = user_id);
