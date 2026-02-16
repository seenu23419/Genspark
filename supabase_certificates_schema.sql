-- =====================================================
-- GENSPARK CERTIFICATE SYSTEM - SUPABASE SQL SCHEMA
-- =====================================================
-- Run this in Supabase SQL Editor

-- 1. CREATE CERTIFICATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    course_name TEXT NOT NULL,
    user_name TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    certificate_number TEXT NOT NULL UNIQUE,
    certificate_data JSONB,  -- Stores PDF metadata and settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite unique constraint: one certificate per user per course
    CONSTRAINT unique_user_course_certificate UNIQUE(user_id, course_id)
);

-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Fast lookup by user
CREATE INDEX idx_certificates_user_id ON certificates(user_id);

-- Fast lookup by course
CREATE INDEX idx_certificates_course_id ON certificates(course_id);

-- Fast lookup by certificate number (for verification)
CREATE INDEX idx_certificates_number ON certificates(certificate_number);

-- Composite index for user + course (most common query)
CREATE INDEX idx_certificates_user_course ON certificates(user_id, course_id);

-- Index for recent certificates
CREATE INDEX idx_certificates_issued_at ON certificates(issued_at DESC);

-- 3. CREATE USER COMPLETION TRACKING TABLE (optional but recommended)
-- =====================================================
-- This table tracks which lessons/quizzes are completed per user per course

CREATE TABLE IF NOT EXISTS user_course_progress (
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

CREATE INDEX idx_progress_user_id ON user_course_progress(user_id);
CREATE INDEX idx_progress_course_id ON user_course_progress(course_id);
CREATE INDEX idx_progress_complete ON user_course_progress(is_course_complete);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on certificates table
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view only their own certificates
CREATE POLICY "Users can view their own certificates"
    ON certificates
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Users can insert only their own certificates (and only 1 per course)
-- Insert is handled by backend trigger to prevent duplicates
CREATE POLICY "Users can insert their own certificates"
    ON certificates
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update only their own certificates (admin only via backend)
CREATE POLICY "Users cannot update certificates"
    ON certificates
    FOR UPDATE
    USING (FALSE)
    WITH CHECK (FALSE);

-- Policy 4: Users cannot delete their own certificates (permanent record)
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

-- 5. CREATE FUNCTION TO PREVENT DUPLICATE CERTIFICATES
-- =====================================================
-- This function ensures only ONE certificate per user per course

CREATE OR REPLACE FUNCTION check_duplicate_certificate()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if certificate already exists for this user and course
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

-- Attach trigger to certificates table
CREATE TRIGGER trigger_prevent_duplicate_certificates
BEFORE INSERT OR UPDATE ON certificates
FOR EACH ROW
EXECUTE FUNCTION check_duplicate_certificate();

-- 6. CREATE FUNCTION TO AUTO-UPDATE TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION update_certificate_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_certificate_timestamp
BEFORE UPDATE ON certificates
FOR EACH ROW
EXECUTE FUNCTION update_certificate_timestamp();

-- 7. SAMPLE DATA (Optional - for testing)
-- =====================================================
-- INSERT INTO certificates (
--     user_id,
--     course_id,
--     course_name,
--     user_name,
--     certificate_number,
--     certificate_data
-- ) VALUES (
--     (SELECT id FROM auth.users LIMIT 1),
--     'c-programming',
--     'C Programming',
--     'John Doe',
--     'GENSPARK-C-PROGRAMMING-2024-ABC123',
--     '{"issued_date": "2024-01-18", "verified": true}'
-- );

-- =====================================================
-- EXPLANATION OF SCHEMA DESIGN
-- =====================================================

/*
WHY THIS SCHEMA IS SECURE:
1. Row Level Security (RLS) enforced:
   - Users can ONLY see their own certificates
   - Users can INSERT but NOT DELETE/UPDATE
   - Makes certificate creation audit trail immutable

2. UNIQUE constraint on (user_id, course_id):
   - Prevents accidental duplicate certificate generation
   - Database enforces business rule at storage level

3. Trigger function `check_duplicate_certificates()`:
   - Additional safety net against duplicates
   - Raises exception if attempt is made

4. Primary key is UUID:
   - Cannot be guessed or iterated
   - Secure reference for URLs

5. Certificate number format stored:
   - Human-readable, unique identifier
   - Format: GENSPARK-{COURSE}-{YEAR}-{RANDOM}
   - Example: GENSPARK-C-PROGRAMMING-2024-X7K9L2

WHY THIS SCHEMA IS SCALABLE:
1. Proper indexing strategy:
   - Composite index (user_id, course_id) for most common query
   - Individual indexes for filtering
   - Indexes on issued_at for time-based queries

2. Separate progress tracking table:
   - Allows progress updates without touching certificates
   - Efficient course completion checks
   - Easy to query "courses in progress" vs "completed"

3. JSONB field for extensibility:
   - Can store metadata without schema changes
   - Verification data, digital signature, etc.
   - Future-proof design

4. Timestamp tracking:
   - created_at: immutable creation time
   - updated_at: auto-managed by trigger
   - issued_at: when certificate was officially issued
   - Good for auditing and analytics

5. ON DELETE CASCADE:
   - When user is deleted, certificates are automatically cleaned up
   - Maintains referential integrity
   - No orphaned records

PERFORMANCE CONSIDERATIONS:
1. UNIQUE constraint on certificate_number:
   - Prevents duplicates
   - Automatically creates index for O(1) lookups

2. Composite index on (user_id, course_id):
   - Most queries are "Get my certificate for course X"
   - This index makes that instant

3. RLS policies are simple and indexed:
   - auth.uid() = user_id
   - No complex joins in policy
   - Minimal performance impact

4. JSONB over separate columns:
   - Reduces table width
   - Faster row access
   - Allows adding fields without migrations

AUDIT TRAIL:
- created_at timestamp proves when it was generated
- user_id proves who generated it
- Immutability via RLS DELETE policy
- Perfect for compliance/verification
*/

-- =====================================================
-- HOW TO USE THIS SCHEMA
-- =====================================================

/*
INSERTING A CERTIFICATE:

INSERT INTO certificates (
    user_id,
    course_id,
    course_name,
    user_name,
    certificate_number,
    certificate_data
) VALUES (
    'user-uuid-here',
    'javascript',
    'JavaScript Complete',
    'Alice Johnson',
    'GENSPARK-JAVASCRIPT-2024-M5N8P3',
    '{"issued_date": "2024-01-18", "verified": true}'
)
RETURNING *;

Note: Will fail if user already has certificate for this course
(Due to UNIQUE constraint and trigger)

QUERYING USER'S CERTIFICATES:

SELECT * FROM certificates
WHERE user_id = 'user-uuid-here'
ORDER BY issued_at DESC;

CHECKING IF CERTIFICATE EXISTS:

SELECT EXISTS (
    SELECT 1 FROM certificates
    WHERE user_id = 'user-uuid-here'
    AND course_id = 'javascript'
);

CERTIFICATE VERIFICATION (public endpoint):

SELECT certificate_number, user_name, course_name, issued_at
FROM certificates
WHERE certificate_number = 'GENSPARK-JAVASCRIPT-2024-M5N8P3';

This can be made public for verification without exposing user data.
*/
