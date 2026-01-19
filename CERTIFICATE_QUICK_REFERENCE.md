// =====================================================
// CERTIFICATE SYSTEM QUICK REFERENCE
// File: CERTIFICATE_QUICK_REFERENCE.md
// ===================================================== 

# GenSpark Certificate System - Quick Reference

## 🚀 Quick Start (5 Minutes)

### 1. Database Setup
```bash
# Go to Supabase SQL Editor
# Copy & run: supabase_certificates_schema.sql
# Takes ~30 seconds
```

### 2. Install Packages
```bash
npm install jspdf html2canvas
```

### 3. Copy Files to Project
```
src/components/certificates/CertificatePDF.jsx
src/components/profile/CertificatesSection.jsx
src/components/profile/CertificatesSection.css
src/hooks/useCertificate.js
src/services/courseCompletion.js
```

### 4. Add to Profile Page
```jsx
import CertificatesSection from '@/components/profile/CertificatesSection';

<CertificatesSection userId={user?.id} userName={user?.email} />
```

### 5. Test
- Complete a course
- Click "Generate Certificate"
- Download PDF
- See certificate in profile

---

## 📚 File Structure

```
GENERATED FILES:
├── supabase_certificates_schema.sql        (SQL schema)
├── src/components/
│   ├── certificates/
│   │   └── CertificatePDF.jsx             (PDF component)
│   └── profile/
│       ├── CertificatesSection.jsx        (Profile display)
│       └── CertificatesSection.css        (Styling)
├── src/hooks/
│   └── useCertificate.js                  (Generation hook)
├── src/services/
│   └── courseCompletion.js                (Progress tracking)
├── CERTIFICATE_SYSTEM_INTEGRATION.md       (Full guide)
└── CERTIFICATE_QUICK_REFERENCE.md         (This file)
```

---

## 🔌 Integration Points

### Show "Generate Certificate" Button

```jsx
import { useCertificate } from '@/hooks/useCertificate';
import * as courseCompletion from '@/services/courseCompletion';

export function CourseCompletion({ courseId, courseName }) {
  const { user } = useAuth();
  const { generateCertificate, isLoading, error } = useCertificate(user?.id);
  const [isComplete, setIsComplete] = useState(false);

  // Check if complete
  useEffect(() => {
    const check = async () => {
      const status = await courseCompletion.checkCourseCompletion(
        user?.id,
        courseId
      );
      setIsComplete(status.complete);
    };
    check();
  }, []);

  // Generate cert
  const handleGenerate = async () => {
    await generateCertificate(courseId, courseName, user?.email);
  };

  return (
    <>
      {isComplete && (
        <button onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? 'Generating...' : '🏆 Generate Certificate'}
        </button>
      )}
      {error && <p className="error">{error}</p>}
    </>
  );
}
```

### Track Progress During Course

```jsx
import * as courseCompletion from '@/services/courseCompletion';

// When lesson is completed
await courseCompletion.markLessonComplete(userId, courseId, lessonId);

// When quiz is completed
await courseCompletion.markQuizComplete(
  userId,
  courseId,
  lessonId,
  score,           // e.g., 8
  totalQuestions   // e.g., 10
);

// Check if entire course is complete
const status = await courseCompletion.checkCourseCompletion(userId, courseId);
if (status.complete) {
  // Show completion page / offer certificate
}
```

### Show Certificates in Profile

```jsx
import CertificatesSection from '@/components/profile/CertificatesSection';

<CertificatesSection userId={user?.id} userName={user?.email} />
```

---

## 🎯 Key Functions

### useCertificate Hook

```javascript
const {
  generateCertificate,        // Main function
  fetchUserCertificates,      // Get all certs
  certificates,               // Array of certs
  isLoading,                  // Loading state
  error,                      // Error message
  success                     // Success message
} = useCertificate(userId);

// Generate certificate
const result = await generateCertificate(
  courseId,    // 'javascript'
  courseName,  // 'JavaScript Complete'
  userName     // 'John Doe'
);
// Returns: { success: boolean, data: certificateData, error: string }
```

### courseCompletion Service

```javascript
// Initialize progress
await courseCompletion.initializeCourseProgress(userId, courseId, courseName);

// Mark lesson complete
await courseCompletion.markLessonComplete(userId, courseId, lessonId);

// Mark quiz complete
await courseCompletion.markQuizComplete(userId, courseId, lessonId, score, total);

// Check completion
const status = await courseCompletion.checkCourseCompletion(userId, courseId);
// Returns: { complete: boolean, progress: 0-100, completedLessons, etc. }

// Get all user progress
const progress = await courseCompletion.getUserAllProgress(userId);
```

### CertificatePDF Component

```jsx
<CertificatePDF
  userName="John Doe"
  courseName="JavaScript Complete"
  courseId="javascript"
  certificateNumber="GENSPARK-JAVASCRIPT-2024-X7K9L2"
  issueDate={new Date()}
  showDownloadButton={true}
  onDownload={(result) => {
    if (result.success) console.log('Downloaded');
  }}
/>
```

---

## 🔒 Security Features

✅ **Duplicate Prevention**: Database unique constraint + trigger + app check
✅ **Row Level Security**: Users see only their own certificates
✅ **Immutability**: Certificates cannot be edited or deleted
✅ **Completion Verification**: Must complete all lessons + pass quizzes
✅ **Unique Numbers**: Anti-forgery format with random suffix
✅ **Audit Trail**: Creation timestamp + user ID preserved

---

## ⚠️ Common Issues & Fixes

### "Certificate already exists"
→ User already generated cert for that course
→ This is expected! Show their existing cert instead

### "Course not completed"
→ User hasn't finished all lessons or failed a quiz
→ Show progress page with remaining requirements

### PDF won't download
→ Check browser console for errors
→ Ensure html2canvas can access certificate element
→ Verify user has permission to view certificate

### Certificates not showing in profile
→ Verify user is logged in
→ Check user ID is correct
→ Verify RLS policy allows user to see their certs

### Database connection errors
→ Check Supabase URL and key are correct
→ Verify network connectivity
→ Check Supabase is running

---

## 📊 Database Schema Quick Reference

### certificates table

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK to auth.users |
| course_id | TEXT | e.g., 'javascript' |
| course_name | TEXT | e.g., 'JavaScript Complete' |
| user_name | TEXT | Student's name |
| certificate_number | TEXT | UNIQUE, e.g., 'GENSPARK-JS-2024-X7K9L2' |
| issued_at | TIMESTAMP | When certificate was created |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

### Constraints
- PRIMARY KEY (id)
- UNIQUE (certificate_number)
- UNIQUE (user_id, course_id) ← Only 1 cert per user per course
- FK (user_id) → auth.users

### Indexes
- user_id (fast lookup by user)
- course_id (fast lookup by course)
- certificate_number (verification lookups)
- (user_id, course_id) (most common query)

---

## 🧪 Testing Quick Commands

```javascript
// Test 1: Check database connection
const { data, error } = await supabase.from('certificates').select('count');
console.log('DB OK:', data);

// Test 2: Generate a test certificate
const result = await useCertificate.generateCertificate(
  'javascript',
  'JavaScript Complete',
  'Test User'
);
console.log('Certificate generated:', result.data);

// Test 3: Fetch user's certificates
const certs = await useCertificate.fetchUserCertificates();
console.log('User certificates:', certs);

// Test 4: Check RLS is working
// Try to query another user's certificates
// Should return empty or error (RLS blocking)

// Test 5: Try duplicate generation
// Generate same course twice
// Second should fail with "already exists" error
```

---

## 🎨 Customization Options

### Change Certificate Design

Edit `CertificatePDF.jsx`:

```jsx
// Change colors
style={{ backgroundColor: '#your-color' }}

// Change text
<div>Your Custom Message</div>

// Add logo
<img src="logo.png" />

// Change fonts
style={{ fontFamily: '"Your Font", serif' }}
```

### Change Button Styling

Edit `CertificatesSection.css`:

```css
.btn-primary {
  background-color: #your-color;
  /* Your styles */
}
```

### Change Success Messages

Edit `useCertificate.js`:

```javascript
const successMsg = `Certificate generated successfully!`;
// Change this message
```

---

## 📈 Performance Tips

✅ Use indexes on frequently queried columns
✅ Cache certificates in frontend state
✅ Lazy load certificates on profile (not on page load)
✅ Batch queries when fetching multiple certificates
✅ Use Supabase connection pooling for production

---

## 🚀 Deployment Checklist

- [ ] SQL schema executed in production
- [ ] RLS policies verified
- [ ] Environment variables set
- [ ] jsPDF + html2canvas installed
- [ ] All files copied to correct locations
- [ ] Integration points updated in your code
- [ ] Test certificate generation
- [ ] Test PDF download
- [ ] Test RLS (verify unauthorized access fails)
- [ ] Check for console errors
- [ ] Monitor performance

---

## 📚 Related Files

- `CERTIFICATE_SYSTEM_SETUP.md` - Initial setup overview
- `CERTIFICATE_SYSTEM_INTEGRATION.md` - Full integration guide
- `supabase_certificates_schema.sql` - Database schema

---

## 💡 Pro Tips

1. **Test locally first** before deploying
2. **Monitor errors** in console during testing
3. **Keep certificate numbers** for auditing
4. **Show progress** to users during course
5. **Allow re-download** but prevent re-generation
6. **Use certificates** as marketing (social share)
7. **Display badges** on profile for achievements
8. **Track metrics** (certificates per course, completion rate)

---

## ❓ FAQ

**Q: Can users generate multiple certificates?**
A: No. Only 1 certificate per user per course. Database enforces this.

**Q: What if user fails a quiz?**
A: They can retake it. Progress updates with new score. Can regenerate cert only after all pass.

**Q: Can certificates be shared?**
A: Yes! Share link format: `genspark.app/verify/{certificate-number}`

**Q: Is PDF generation server-side or client-side?**
A: Client-side using jsPDF + html2canvas. No server needed!

**Q: Can users delete certificates?**
A: No. RLS policy prevents deletion. Permanent record for compliance.

**Q: How do I verify a certificate?**
A: Look up certificate_number in database. See integration guide for public endpoint.

---

## 🆘 Need Help?

1. Check integration guide: `CERTIFICATE_SYSTEM_INTEGRATION.md`
2. Review component comments (detailed in source files)
3. Check browser console for errors
4. Verify Supabase setup is correct
5. Test with sample data first

---

**✅ Ready to implement! Follow these 5 steps and you're done.**
