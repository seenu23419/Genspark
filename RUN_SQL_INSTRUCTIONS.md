# How to Run the SQL Schema in Supabase

## Quick Steps:

### 1. Open Supabase Dashboard
Go to: https://app.supabase.com

### 2. Select Your Project
Choose your GenSpark project

### 3. Go to SQL Editor
- Left sidebar → Click **"SQL Editor"**
- Or click **"New Query"** button

### 4. Copy the SQL
- Open this file: `supabase_certificates_schema.sql`
- Select ALL content (Ctrl+A)
- Copy it (Ctrl+C)

### 5. Paste into Supabase
- In Supabase SQL Editor, paste the SQL (Ctrl+V)
- You should see 300+ lines of SQL code

### 6. Run the Query
- Click the green **"Run"** button (or Ctrl+Enter)
- Wait for completion (should see "Query successful")

### 7. Verify It Worked
After running, check:
1. Go to **"Table Editor"** (left sidebar)
2. Look for these new tables:
   - ✅ `certificates` table
   - ✅ `user_course_progress` table
3. Both should appear in your tables list

## What Gets Created:

✅ `certificates` table - Stores issued certificates  
✅ `user_course_progress` table - Tracks course completion  
✅ RLS Policies - Security access control  
✅ Trigger Functions - Duplicate prevention  
✅ Indexes - Performance optimization  

## If You Get an Error:

**Error: "User already exists"**
→ This is OK - means tables already exist from before

**Error: "Permission denied"**
→ Make sure you're logged into Supabase

**Error: "Something else"**
→ Copy the error message and share it

## Done! ✅

After running the SQL, you're ready for Step 2: Copy the implementation files to your project.
