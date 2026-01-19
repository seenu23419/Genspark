# GenSpark Certificate System - Production Setup

## 📋 Implementation Guide

### Components Included:
1. **Supabase SQL Schema** - Database design with RLS
2. **Certificate PDF Component** - React component using jsPDF
3. **Certificate Generation Hook** - Business logic
4. **Profile Integration** - Certificates section
5. **Course Completion Check** - Validation logic

---

## ✅ STEP 1: Supabase Setup

Run the SQL schema provided in `supabase_certificates_schema.sql`

---

## ✅ STEP 2: Install Dependencies

```bash
npm install jspdf html2canvas
```

---

## ✅ STEP 3: Add Certificate Components

- Place `CertificatePDF.jsx` in `src/components/certificates/`
- Place `useCertificate.js` in `src/hooks/`
- Place `courseCompletion.js` in `src/services/`

---

## ✅ STEP 4: Update Profile Page

Import `CertificatesSection.jsx` in profile page

---

## ✅ STEP 5: Update Course Completion Page

Add "Generate Certificate" button when course is complete

---

## 🔒 Security Features Implemented:
✓ Unique certificate numbers (GENSPARK-{COURSE}-{YEAR}-{RANDOM})
✓ RLS policies prevent unauthorized access
✓ Duplicate prevention at database level
✓ User can only view their own certificates

---

## 🎨 Professional Design:
✓ Clean, minimal aesthetic
✓ Academic feel (college-acceptable)
✓ GenSpark branding
✓ No gamification elements

---

## 📱 Mobile-First:
✓ PDF responsive and downloadable
✓ Works on all devices
✓ PWA compatible
