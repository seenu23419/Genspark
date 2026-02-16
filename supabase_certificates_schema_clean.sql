-- =====================================================
-- GENSPARK CERTIFICATE SYSTEM - SUPABASE SQL SCHEMA
-- CLEAN/IDEMPOTENT VERSION - Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing objects if they exist (clean slate)
DROP TRIGGER IF EXISTS trigger_prevent_duplicate_certificates ON certificates;
DROP TRIGGER IF EXISTS trigger_update_certificate_timestamp ON certificates;
DROP FUNCTION IF EXISTS check_duplicate_certificate();
DROP FUNCTION IF EXISTS update_certificate_timestamp();
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS user_course_progress CASCADE;

-- =====================================================
-- 1. CREATE CERTIFICATES TABLE
-- =====================================================

CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    course_name TEXT NOT NULL,
    user_name TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    certificate_number TEXT NOT NULL UNIQUE,
    certificate_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite unique constraint: one certificate per user per course
    CONSTRAINT unique_user_course_certificate UNIQUE(user_id, course_id)
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_course_id ON certificates(course_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_user_course ON certificates(user_id, course_id);
CREATE INDEX idx_certificates_issued_at ON certificates(issued_at DESC);

-- =====================================================
-- 3. CREATE USER COMPLETION TRACKING TABLE
-- =====================================================

CREATE TABLE user_course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    completed_lessons INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    completed_quizzes INTEGER DEFAULT 0,
    total_quizzes INTEGER DEFAULT 0,
    quiz_passed BOOLEAN DEFAULT FALSE,
    is_course_complete BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_course_progress UNIQUE(user_id, course_id)
);

-- =====================================================
-- 4. CREATE INDEXES FOR PROGRESS TABLE
-- =====================================================

CREATE INDEX idx_progress_user_id ON user_course_progress(user_id);
CREATE INDEX idx_progress_course_id ON user_course_progress(course_id);
CREATE INDEX idx_progress_complete ON user_course_progress(is_course_complete);

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on certificates table
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view only their own certificates
CREATE POLICY "Users can view their own certificates"
    ON certificates
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Users can insert only their own certificates
CREATE POLICY "Users can insert their own certificates"
    ON certificates
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users cannot update certificates
CREATE POLICY "Users cannot update certificates"
    ON certificates
    FOR UPDATE
    USING (FALSE)
    WITH CHECK (FALSE);

-- Policy 4: Users cannot delete certificates
CREATE POLICY "Users cannot delete certificates"
    ON certificates
    FOR DELETE
    USING (FALSE);

-- Enable RLS on user_course_progress
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
    ON user_course_progress
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
    ON user_course_progress
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 6. CREATE TRIGGER FUNCTIONS
-- =====================================================

-- Function to prevent duplicate certificates
CREATE OR REPLACE FUNCTION check_duplicate_certificate()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM certificates
        WHERE user_id = NEW.user_id
        AND course_id = NEW.course_id
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Certificate already exists for this course';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to prevent duplicates
CREATE TRIGGER trigger_prevent_duplicate_certificates
BEFORE INSERT OR UPDATE ON certificates
FOR EACH ROW
EXECUTE FUNCTION check_duplicate_certificate();

-- Function to auto-update timestamp
CREATE OR REPLACE FUNCTION update_certificate_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to update timestamp
CREATE TRIGGER trigger_update_certificate_timestamp
BEFORE UPDATE ON certificates
FOR EACH ROW
EXECUTE FUNCTION update_certificate_timestamp();

-- =====================================================
-- VERIFICATION: Check tables were created
-- =====================================================

SELECT 'Certificates table created' AS status;
SELECT COUNT(*) AS index_count FROM pg_indexes WHERE tablename = 'certificates';
SELECT 'user_course_progress table created' AS status;
SELECT COUNT(*) AS progress_index_count FROM pg_indexes WHERE tablename = 'user_course_progress';

-- =====================================================
-- SUCCESS!
-- =====================================================
-- The schema is now ready for use.
-- Tables created:
--   ✓ certificates
--   ✓ user_course_progress
-- 
-- RLS policies enabled:
--   ✓ Users see only their own certificates
--   ✓ Users cannot modify/delete certificates
--
-- Triggers active:
--   ✓ Duplicate prevention
--   ✓ Automatic timestamp updates
--
-- Indexes created:
--   ✓ 5 performance indexes on certificates table
--   ✓ 3 performance indexes on progress table
