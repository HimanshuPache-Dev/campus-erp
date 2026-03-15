# Database Fix Required - Critical Issues

## 🚨 Current Errors

Based on the console errors, these database issues need immediate fixing:

### 1. Missing Notifications Table ❌
```
Could not find the table 'public.notifications' in the schema cache
```

### 2. Missing Course Assignments Relationship ❌
```
Could not find a relationship between 'courses' and 'course_assignments'
```

### 3. Course Assignments Table 404 ❌
```
Failed to load resource: 404 on /rest/v1/course_assignments
```

### 4. Results Table Issues ❌
```
400 errors on results queries
```

### 5. Schedule.jsx useEffect Error ✅ FIXED
```
ReferenceError: useEffect is not defined
```
**Status:** Fixed by adding useEffect to imports

## 🔧 How to Fix

### Option 1: Run Complete Fix Script (RECOMMENDED)

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and run: `campus-erp/backend/fix-all-database-issues.sql`

This script will:
- Create notifications table
- Verify course_assignments table exists
- Verify student_enrollments table exists
- Fix results table columns
- Refresh schema cache
- Verify all tables

### Option 2: Run Full Schema (If tables are missing)

If the fix script shows missing tables, run the full schema:

1. Open Supabase Dashboard
2. Go to SQL Editor  
3. Copy and run: `campus-erp/backend/src/schema.sql`
4. Then run: `campus-erp/backend/fix-all-database-issues.sql`

### Option 3: Run Seed Data (After schema is fixed)

To populate with test data:

```bash
cd campus-erp/backend
node src/seed.js
```

## 📋 Required Tables

Your database MUST have these 10 tables:

1. ✅ users
2. ✅ student_details
3. ✅ faculty_details
4. ✅ courses
5. ❌ course_assignments (MISSING or no relationship)
6. ❌ student_enrollments (possibly missing)
7. ✅ attendance
8. ✅ results (may need column fixes)
9. ✅ fees
10. ❌ notifications (MISSING)

## 🔍 Verify Tables Exist

Run this in Supabase SQL Editor to check:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'users', 'student_details', 'faculty_details', 'courses',
    'course_assignments', 'student_enrollments', 'attendance',
    'results', 'fees', 'notifications'
  )
ORDER BY tablename;
```

Expected output: 10 rows

## 🎯 After Running Fix Script

1. **Refresh Supabase Dashboard** - Click reload icon
2. **Check Tables** - Verify all 10 tables appear in Table Editor
3. **Restart Backend** - Kill and restart: `npm start`
4. **Clear Browser Cache** - Hard refresh (Ctrl+Shift+R)
5. **Test Login** - Try logging in again

## 🧪 Test Queries

After fixing, test these in Supabase SQL Editor:

```sql
-- Test 1: Notifications table
SELECT COUNT(*) FROM notifications;

-- Test 2: Course assignments
SELECT COUNT(*) FROM course_assignments;

-- Test 3: Relationship test
SELECT c.course_name, ca.faculty_id 
FROM courses c
LEFT JOIN course_assignments ca ON c.id = ca.course_id
LIMIT 5;

-- Test 4: Results columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'results'
ORDER BY ordinal_position;
```

## 📝 What Each Error Means

### "Could not find the table"
- Table doesn't exist in database
- Solution: Run schema.sql or fix script

### "Could not find a relationship"
- Foreign key constraint missing
- Solution: Recreate table with proper foreign keys

### "404 on course_assignments"
- Table doesn't exist at all
- Solution: Run schema.sql

### "400 on results"
- Missing columns or wrong column names
- Solution: Run fix script to add missing columns

## ⚠️ Important Notes

1. **RLS Must Be Disabled** - All tables need `ALTER TABLE tablename DISABLE ROW LEVEL SECURITY;`
2. **Foreign Keys Required** - course_assignments needs FK to courses and users
3. **Schema Cache** - Supabase caches schema, may need refresh
4. **UUID Extension** - Must be enabled: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

## 🎉 Success Indicators

After fixing, you should see:
- ✅ No 404 errors in console
- ✅ No 400 errors in console
- ✅ No "table not found" errors
- ✅ Data loads in dashboard
- ✅ Courses show assigned faculty
- ✅ Notifications work

## 🆘 If Still Not Working

1. Check Supabase logs (Logs section in dashboard)
2. Verify environment variables in `.env`
3. Confirm Supabase URL and keys are correct
4. Try running seed.js to populate data
5. Check browser console for specific error messages

## 📁 Files Created

- `fix-all-database-issues.sql` - Complete fix script
- `create-notifications-table.sql` - Just notifications
- `schema.sql` - Full database schema

## 🔗 Quick Links

- Supabase Dashboard: https://supabase.com/dashboard
- Your Project: https://ojdxczneqaxbbvjdehro.supabase.co
- SQL Editor: Dashboard → SQL Editor
- Table Editor: Dashboard → Table Editor
