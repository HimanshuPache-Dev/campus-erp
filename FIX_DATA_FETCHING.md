## 🔧 Fix Data Fetching Issues - Complete Guide

The website is not fetching data properly from the database. Follow these steps to diagnose and fix all issues.

---

## Step 1: Diagnose the Problem

Run this SQL in Supabase SQL Editor:

**File**: `campus-erp/backend/DIAGNOSE_DATABASE.sql`

This will show you:
- ✅ Which tables exist
- ✅ How much data is in each table
- ⚠️ What data is missing
- ⚠️ Common issues (students without enrollments, courses without timetable, etc.)

---

## Step 2: Check Supabase Configuration

### Verify Environment Variables

Check `campus-erp/frontend/.env`:

```env
VITE_SUPABASE_URL=https://xwlglapzycdseitkwqlr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_RtV3uo_NTL5HqtDI1i85Cw_tEnwulUM
```

✅ These look correct!

### Verify Supabase Client

Check `campus-erp/frontend/src/config/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

✅ This looks correct!

---

## Step 3: Run Complete Database Setup

Run this SQL in Supabase SQL Editor:

**File**: `campus-erp/backend/COMPLETE_FRESH_DATABASE.sql`

This will:
1. Add missing columns (password_reset_required, temporary_password)
2. Fix admin login
3. Add Computer Engineering faculty
4. Verify all data exists

---

## Step 4: Check Supabase RLS (Row Level Security)

### Option A: Disable RLS for Testing

Run this SQL:

```sql
-- Disable RLS on all tables for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE results DISABLE ROW LEVEL SECURITY;
ALTER TABLE fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE timetable DISABLE ROW LEVEL SECURITY;
```

### Option B: Enable RLS with Proper Policies

If you want to keep RLS enabled, run this:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;

-- Create policies to allow read access
CREATE POLICY "Allow read access to users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow read access to courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Allow read access to enrollments" ON student_enrollments FOR SELECT USING (true);
CREATE POLICY "Allow read access to fees" ON fees FOR SELECT USING (true);
CREATE POLICY "Allow read access to notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow read access to timetable" ON timetable FOR SELECT USING (true);

-- Allow insert/update for authenticated users
CREATE POLICY "Allow insert for authenticated" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for authenticated" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update notifications" ON notifications FOR UPDATE USING (true);
```

---

## Step 5: Test Data Fetching

### Test in Browser Console

Open browser console (F12) and run:

```javascript
// Test Supabase connection
const { data, error } = await supabase.from('users').select('*').limit(5);
console.log('Users:', data, error);

// Test courses
const { data: courses } = await supabase.from('courses').select('*').limit(5);
console.log('Courses:', courses);

// Test enrollments
const { data: enrollments } = await supabase.from('student_enrollments').select('*').limit(5);
console.log('Enrollments:', enrollments);
```

---

## Step 6: Common Issues & Solutions

### Issue 1: "Failed to fetch" or Network Error

**Cause**: Supabase URL or API key is wrong

**Solution**:
1. Go to Supabase Dashboard → Settings → API
2. Copy the correct URL and anon key
3. Update `.env` file
4. Restart dev server: `npm run dev`

### Issue 2: Empty data arrays but no error

**Cause**: Row Level Security (RLS) is blocking access

**Solution**: Disable RLS (see Step 4, Option A)

### Issue 3: "relation does not exist" error

**Cause**: Tables not created

**Solution**: Run `COMPLETE_DATABASE_WITH_TIMETABLE.sql`

### Issue 4: Data exists but not showing on pages

**Cause**: Query is wrong or filtering incorrectly

**Solution**: Check browser console for errors

### Issue 5: "column does not exist" error

**Cause**: Missing columns from migrations

**Solution**: Run all migration files:
- `add-password-reset-required.sql`
- `add-sender-to-notifications.sql`

---

## Step 7: Verify Each Page

### Admin Dashboard
- Should show: student count, faculty count, courses, fees
- Check: `/admin/dashboard`

### Student Dashboard  
- Should show: courses, attendance, fees, notifications
- Check: `/student/dashboard`

### Faculty Dashboard
- Should show: courses, students, schedule
- Check: `/faculty/dashboard`

### Students List
- Should show: all students with details
- Check: `/admin/students`

### Courses List
- Should show: all courses
- Check: `/admin/courses`

---

## Step 8: Check Browser Console

Open browser console (F12) and look for:

❌ **Red errors** - These are critical
⚠️ **Yellow warnings** - These might be issues
ℹ️ **Blue info** - These are just logs

Common errors:
- `Failed to fetch` → Network/CORS issue
- `relation does not exist` → Table missing
- `column does not exist` → Column missing
- `RLS policy violation` → RLS blocking access

---

## Quick Fix Script

If nothing works, run this complete reset:

```sql
-- 1. Disable all RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE results DISABLE ROW LEVEL SECURITY;
ALTER TABLE fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE timetable DISABLE ROW LEVEL SECURITY;

-- 2. Add missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS temporary_password VARCHAR(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES users(id);

-- 3. Fix admin
UPDATE users SET password_reset_required = false WHERE role = 'admin';

-- 4. Verify data
SELECT 'Users:', COUNT(*) FROM users;
SELECT 'Courses:', COUNT(*) FROM courses;
SELECT 'Enrollments:', COUNT(*) FROM student_enrollments;
SELECT 'Fees:', COUNT(*) FROM fees;
SELECT 'Timetable:', COUNT(*) FROM timetable;
```

---

## Checklist

- [ ] Run DIAGNOSE_DATABASE.sql
- [ ] Check all tables exist
- [ ] Check data exists in tables
- [ ] Disable RLS or add policies
- [ ] Add missing columns
- [ ] Fix admin login
- [ ] Test in browser console
- [ ] Check each page loads
- [ ] Check browser console for errors
- [ ] Verify Supabase credentials

---

## Still Not Working?

1. **Check Supabase Dashboard**:
   - Go to Table Editor
   - Verify tables exist
   - Verify data exists
   - Check RLS settings

2. **Check Network Tab**:
   - Open browser DevTools → Network
   - Filter by "supabase"
   - Check if requests are being made
   - Check response status (200 = good, 400/500 = error)

3. **Restart Everything**:
   ```bash
   # Stop dev server
   Ctrl+C
   
   # Clear cache
   npm run dev -- --force
   
   # Or restart completely
   npm run dev
   ```

4. **Check .env file is loaded**:
   ```javascript
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('Has API Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
   ```

---

**Last Updated**: April 6, 2026
**Status**: Diagnostic tools ready
