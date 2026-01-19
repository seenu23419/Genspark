// =====================================================
// CERTIFICATE SYSTEM INTEGRATION GUIDE
// File: CERTIFICATE_SYSTEM_INTEGRATION.md
// ===================================================== 

## Complete GenSpark Certificate System Implementation Guide

This guide walks through implementing the production-ready certificate system for GenSpark.

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites & Setup](#prerequisites--setup)
2. [Database Setup](#database-setup)
3. [Component Installation](#component-installation)
4. [Integration Points](#integration-points)
5. [User Flow](#user-flow)
6. [Security & Validation](#security--validation)
7. [Testing Checklist](#testing-checklist)
8. [Deployment](#deployment)

---

## Prerequisites & Setup

### 1. **Install Required Dependencies**

```bash
npm install jspdf html2canvas
```

### 2. **Ensure Supabase Client is configured**

File: `src/services/supabaseClient.js`

```javascript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)
```

### 3. **Environment Variables** (if not already set)

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=https://genspark.app (or localhost:5173 for dev)
```

---

## Database Setup

### Step 1: Run SQL Schema in Supabase

1. Go to Supabase Dashboard → SQL Editor
2. Open file: `supabase_certificates_schema.sql`
3. Copy and paste the entire SQL into the editor
4. Click "Run" to execute

**What this creates:**
- ✅ `certificates` table (with RLS policies)
- ✅ `user_course_progress` table
- ✅ Automatic duplicate prevention (triggers)
- ✅ Proper indexing for performance
- ✅ Audit trail (timestamps)

### Step 2: Verify Tables Created

In Supabase:
1. Go to Table Editor
2. Confirm you see:
   - `certificates` table with columns: id, user_id, course_id, course_name, user_name, issued_at, certificate_number, certificate_data, created_at, updated_at
   - `user_course_progress` table with columns: id, user_id, course_id, completed_lessons, total_lessons, completed_quizzes, total_quizzes, quiz_passed, is_course_complete, completion_date, updated_at

### Step 3: Verify RLS Policies

1. Go to Authentication → Policies
2. Check that `certificates` table has:
   - Policy: "Users can view their own certificates" (SELECT)
   - Policy: "Users can insert their own certificates" (INSERT)
   - Policy: "Users cannot update certificates" (UPDATE - deny all)
   - Policy: "Users cannot delete certificates" (DELETE - deny all)

---

## Component Installation

### Step 1: Create Certificate Components Directory

```bash
mkdir -p src/components/certificates
mkdir -p src/components/profile
mkdir -p src/hooks
mkdir -p src/services
```

### Step 2: Copy Files

Place these files in their respective directories:

```
src/
├── components/
│   ├── certificates/
│   │   ├── CertificatePDF.jsx          ← PDF rendering component
│   │   └── CertificatePDF.css           ← Optional styling
│   └── profile/
│       ├── CertificatesSection.jsx      ← Profile display
│       └── CertificatesSection.css      ← Styling
├── hooks/
│   └── useCertificate.js                ← Generation logic
├── services/
│   └── courseCompletion.js              ← Progress tracking
└── pages/
    └── Profile.jsx                      ← Integration point
```

### Step 3: Verify File Paths in Imports

Update import paths to match your project structure. Common adjustments:

```javascript
// If your import structure is different:
import { supabase } from '@/lib/supabase'  // vs @/services/supabaseClient
import CertificatePDF from '@/components/CertificatePDF'  // vs nested path
```

---

## Integration Points

### Integration Point 1: Course Completion Page

**File:** `src/pages/CourseCompletion.jsx` (or similar)

```jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCertificate } from '@/hooks/useCertificate';
import * as courseCompletion from '@/services/courseCompletion';
import CertificatePDF from '@/components/certificates/CertificatePDF';

export function CourseCompletionPage({ courseId, courseName }) {
  const { user } = useAuth();
  const { generateCertificate, isLoading, error, success } = useCertificate(user?.id);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [generatedCertificate, setGeneratedCertificate] = useState(null);

  // Check if course is complete
  useEffect(() => {
    const checkCompletion = async () => {
      const status = await courseCompletion.checkCourseCompletion(
        user?.id,
        courseId
      );
      setCompletionStatus(status);
    };

    if (user?.id && courseId) {
      checkCompletion();
    }
  }, [user?.id, courseId]);

  // Handle certificate generation
  const handleGenerateCertificate = async () => {
    const result = await generateCertificate(
      courseId,
      courseName,
      user?.user_metadata?.full_name || user?.email
    );

    if (result.success) {
      setGeneratedCertificate(result.data);
    }
  };

  return (
    <div className="course-completion">
      <h1>🎉 Course Completed!</h1>

      {/* PROGRESS SUMMARY */}
      {completionStatus && (
        <div className="completion-stats">
          <p>Lessons: {completionStatus.completedLessons}/{completionStatus.totalLessons}</p>
          <p>Quizzes: {completionStatus.completedQuizzes}/{completionStatus.totalQuizzes}</p>
          <p>Overall: {completionStatus.progress}% Complete</p>
        </div>
      )}

      {/* CERTIFICATE SECTION */}
      {completionStatus?.complete && !generatedCertificate && (
        <div className="certificate-generation">
          <h2>Generate Your Certificate</h2>
          <p>You've completed all requirements! Generate your certificate to showcase your achievement.</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            onClick={handleGenerateCertificate}
            disabled={isLoading}
            className="btn btn-primary btn-large"
          >
            {isLoading ? '⏳ Generating...' : '🏆 Generate Certificate'}
          </button>
        </div>
      )}

      {/* CERTIFICATE PREVIEW */}
      {generatedCertificate && (
        <div className="certificate-preview">
          <h2>Your Certificate</h2>
          <CertificatePDF
            userName={generatedCertificate.user_name}
            courseName={generatedCertificate.course_name}
            courseId={generatedCertificate.course_id}
            certificateNumber={generatedCertificate.certificate_number}
            issueDate={generatedCertificate.issued_at}
            showDownloadButton={true}
          />
          <p>
            Certificate saved to your profile.{' '}
            <a href="/profile#certificates">View in Profile</a>
          </p>
        </div>
      )}
    </div>
  );
}
```

### Integration Point 2: User Profile Page

**File:** `src/pages/Profile.jsx` (or similar)

```jsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CertificatesSection from '@/components/profile/CertificatesSection';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      {/* Other profile sections */}
      <section id="basic-info">
        {/* Email, name, bio, etc. */}
      </section>

      {/* Certificates Section */}
      <section id="certificates">
        <CertificatesSection
          userId={user?.id}
          userName={user?.user_metadata?.full_name || user?.email}
        />
      </section>
    </div>
  );
}
```

### Integration Point 3: Progress Tracking (During Course)

**File:** `src/components/LessonView.jsx` (or similar)

```jsx
import * as courseCompletion from '@/services/courseCompletion';

export function LessonView({ lesson, courseId }) {
  const { user } = useAuth();

  // When lesson is completed
  const handleLessonComplete = async () => {
    // Mark lesson complete
    await courseCompletion.markLessonComplete(
      user?.id,
      courseId,
      lesson.id
    );
  };

  // When quiz is completed
  const handleQuizSubmit = async (score, totalQuestions) => {
    // Mark quiz complete
    const result = await courseCompletion.markQuizComplete(
      user?.id,
      courseId,
      lesson.id,
      score,
      totalQuestions
    );

    if (result.quizPassed) {
      console.log('Quiz passed!');
    }

    // Check if entire course is complete
    const courseStatus = await courseCompletion.checkCourseCompletion(
      user?.id,
      courseId
    );

    if (courseStatus.complete) {
      // Redirect to completion page
      window.location.href = `/course/${courseId}/complete`;
    }
  };

  return (
    <div className="lesson">
      {/* Lesson content */}
      <button onClick={handleLessonComplete}>Mark as Complete</button>
    </div>
  );
}
```

### Integration Point 4: Navbar/Menu (Certificate Badge)

**File:** `src/components/Navigation.jsx`

```jsx
import { useCertificate } from '@/hooks/useCertificate';

export function Navigation() {
  const { user } = useAuth();
  const { certificates } = useCertificate(user?.id);

  return (
    <nav>
      {/* Menu items */}
      <a href="/profile">
        Profile {certificates?.length > 0 && <span className="badge">{certificates.length} 🏆</span>}
      </a>
    </nav>
  );
}
```

---

## User Flow

### Complete User Journey

```
┌─────────────────────────────────────────────────────┐
│ 1. USER STARTS COURSE                               │
│    - initializeCourseProgress()                      │
│    - Sets up progress tracking in database           │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 2. USER COMPLETES LESSONS                           │
│    - markLessonComplete() called for each lesson    │
│    - Progress updated in database                   │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 3. USER COMPLETES QUIZZES                           │
│    - markQuizComplete() called for each quiz        │
│    - Quiz score stored, pass/fail determined        │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 4. CHECK COMPLETION                                 │
│    - checkCourseCompletion() verifies:              │
│      * All lessons completed (count matches)        │
│      * All quizzes passed (score >= 70%)            │
└─────────────────────────────────────────────────────┘
                         ↓
                    COMPLETE?
                    /        \
                  YES         NO
                  ↓            ↓
            ┌─────────┐   [Continue Learning]
            │ 5. SHOW │
            │ CERT BTN│
            └─────────┘
                  ↓
        [USER CLICKS "GENERATE CERTIFICATE"]
                  ↓
┌─────────────────────────────────────────────────────┐
│ 6. GENERATE CERTIFICATE                             │
│    - generateCertificate() called                   │
│    - Check for existing certificate (prevent dup)   │
│    - Verify completion again (security)             │
│    - Generate unique certificate number             │
│    - Insert into database                           │
│    - Return certificate data                        │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 7. DISPLAY CERTIFICATE                              │
│    - Show CertificatePDF component                  │
│    - User can preview and download                  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ 8. PERSISTENT ACCESS                                │
│    - Certificate saved to database                  │
│    - Always accessible from profile                 │
│    - Can be downloaded anytime                      │
│    - Shareable via verification link                │
└─────────────────────────────────────────────────────┘
```

---

## Security & Validation

### 1. **Duplicate Prevention**

**Multiple layers:**

1. **Database Unique Constraint**
   ```sql
   UNIQUE(user_id, course_id)  -- Only 1 cert per user per course
   ```

2. **Trigger Function**
   ```javascript
   // Prevents insert if already exists
   check_duplicate_certificate()
   ```

3. **Application Check**
   ```javascript
   // useCertificate.js
   const existing = await checkExistingCertificate(courseId);
   if (existing) throw new Error('Certificate already exists');
   ```

### 2. **Course Completion Verification**

**Checks before issuing:**

```javascript
// Must have:
- All lessons marked complete (count matches)
- All quizzes passed (score >= 70%)
- Recorded completion date
```

### 3. **Row Level Security (RLS)**

**Users can ONLY:**
- ✅ SELECT their own certificates
- ✅ INSERT their own certificates (via app)
- ❌ UPDATE any certificate (immutable)
- ❌ DELETE any certificate (audit trail)

**This means:**
- Users see only their certificates
- Users cannot see others' certificates
- Certificates cannot be modified after creation
- Perfect audit trail is maintained

### 4. **Certificate Number Format**

**Format:** `GENSPARK-{COURSE}-{YEAR}-{RANDOM}`

**Example:** `GENSPARK-JAVASCRIPT-2024-X7K9L2`

**Why this format:**
- ✅ Human-readable
- ✅ Unique globally
- ✅ Time-stamped (year)
- ✅ Cannot be guessed (random suffix)
- ✅ Anti-forgery protection

### 5. **Public Verification Endpoint** (Optional)

Add this to your API/verification page:

```jsx
// src/pages/VerifyCertificate.jsx
export async function VerifyCertificatePage({ certificateNumber }) {
  const { data, error } = await supabase
    .from('certificates')
    .select('user_name, course_name, issued_at, certificate_number')
    .eq('certificate_number', certificateNumber)
    .single();

  if (!data) return <p>Certificate not found</p>;

  return (
    <div className="verification-result">
      <h1>✅ Certificate Verified</h1>
      <p><strong>Name:</strong> {data.user_name}</p>
      <p><strong>Course:</strong> {data.course_name}</p>
      <p><strong>Issued:</strong> {new Date(data.issued_at).toLocaleDateString()}</p>
      <p><strong>Certificate #:</strong> {data.certificate_number}</p>
    </div>
  );
}
```

---

## Testing Checklist

### ✅ Unit Tests

```javascript
// __tests__/useCertificate.test.js
describe('useCertificate', () => {
  test('prevents duplicate certificates', async () => {
    // Implementation
  });

  test('validates course completion', async () => {
    // Implementation
  });

  test('generates unique certificate numbers', () => {
    // Implementation
  });
});
```

### ✅ Integration Tests

```javascript
// __tests__/certificateFlow.test.js
describe('Certificate Flow', () => {
  test('complete user journey: start → complete → generate', async () => {
    // 1. Start course
    // 2. Mark lessons complete
    // 3. Pass quizzes
    // 4. Generate certificate
    // 5. Verify database entry
  });

  test('prevents generating duplicate certificates', async () => {
    // Generate once - success
    // Try again - should fail
  });
});
```

### ✅ Manual Testing

1. **Test Duplicate Prevention**
   - Generate certificate
   - Try to generate again → Should show error

2. **Test Course Completion Check**
   - Start course but don't complete
   - Try to generate → Should fail
   - Complete course
   - Try to generate → Should succeed

3. **Test PDF Download**
   - Generate certificate
   - Download PDF
   - Verify file opens correctly
   - Check all data is accurate

4. **Test Profile Display**
   - Go to profile
   - Verify all certificates display
   - Try preview → Modal should open
   - Try download → PDF should generate
   - Try share → Link should copy

5. **Test RLS Security**
   - Sign in as User A
   - Try to query User B's certificates
   - Should return empty (RLS blocks it)

---

## Deployment

### 1. **Pre-Deployment Checklist**

- ✅ SQL schema executed in production Supabase
- ✅ RLS policies verified
- ✅ Environment variables set
- ✅ jsPDF and html2canvas installed
- ✅ All components and hooks copied
- ✅ Integration points updated
- ✅ Testing completed
- ✅ No console errors

### 2. **Build & Deploy**

```bash
npm run build
npm run deploy  # or your deployment command
```

### 3. **Post-Deployment Verification**

1. Test on production URL
2. Generate test certificate
3. Verify it appears in database
4. Download PDF and verify content
5. Check RLS is working (try unauthorized access)

### 4. **Monitoring**

Monitor these metrics:

- Certificate generation success rate
- PDF generation errors
- Database query performance
- RLS policy violations
- User complaints

**In Supabase Dashboard:**
- Logs → Check for errors
- Functions → Monitor performance
- Replication Status → Verify sync

---

## Troubleshooting

### Issue: Certificate insertion fails

**Solution 1:** Check RLS policy
```sql
SELECT * FROM certificates WHERE user_id = 'your-user-id';
```

**Solution 2:** Verify certificate doesn't already exist
```javascript
const existing = await checkExistingCertificate(courseId);
```

### Issue: PDF doesn't download

**Solution:** Check browser console for errors
```javascript
// Add error logging
onDownload={(result) => {
  if (!result.success) {
    console.error('PDF error:', result.error);
  }
}}
```

### Issue: Course completion check returns false

**Solution:** Verify progress data
```sql
SELECT * FROM user_course_progress 
WHERE user_id = 'your-user-id' 
AND course_id = 'javascript';
```

### Issue: RLS blocks legitimate requests

**Solution:** Verify auth context
```javascript
// Check if user is authenticated
console.log('Current user:', user?.id);
```

---

## Files Summary

| File | Purpose | Type |
|------|---------|------|
| `supabase_certificates_schema.sql` | Database schema | SQL |
| `useCertificate.js` | Certificate generation logic | Hook |
| `courseCompletion.js` | Progress tracking | Service |
| `CertificatePDF.jsx` | PDF rendering | Component |
| `CertificatesSection.jsx` | Profile display | Component |
| `CertificatesSection.css` | Styling | CSS |

---

## Next Steps

After implementation:

1. **Monitor** - Watch for errors and performance
2. **Gather Feedback** - Ask users about UX
3. **Optimize** - Improve based on feedback
4. **Expand** - Add more features (e.g., printable certificates, shareable social posts)
5. **Scale** - Ensure system handles growth

---

## Support & Questions

For issues or questions:
1. Check troubleshooting section above
2. Review Supabase documentation
3. Check browser console for errors
4. Review component documentation in file comments

---

**Certificate System Implementation Complete! 🎉**

Your GenSpark users can now earn and showcase their achievements.
