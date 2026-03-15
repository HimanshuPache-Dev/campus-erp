# 🚀 QUICK DATABASE SETUP

## ✅ SAFE & SIMPLE - 3 Steps Only

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select project: ojdxczneqaxbbvjdehro
3. Click: SQL Editor → New Query

### Step 2: Copy & Run SQL
Open file: **campus-erp/backend/COMPLETE_DATABASE_SETUP.sql**
- Copy ALL the code
- Paste into Supabase SQL Editor
- Click **RUN** (or Ctrl+Enter)

### Step 3: Verify Tables Created
Run this query:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

You should see 10 tables:
✅ attendance
✅ course_assignments  
✅ courses
✅ faculty_details
✅ fees
✅ notifications
✅ results
✅ student_details
✅ student_enrollments
✅ users

## 🎉 Done!

Your database is ready. All 27 frontend pages will now work with real data!

## 📝 Optional: Add Sample Data

Run seed script to add test users and courses:
```bash
cd campus-erp/backend
node src/seed.js
```

This creates:
- 1 Admin (admin@campus.com / admin123)
- 3 Faculty members
- 15 Students
- Sample courses and enrollments

## ⚠️ Note

The SQL script is SAFE:
- Uses CREATE TABLE IF NOT EXISTS (won't break existing tables)
- Uses ADD COLUMN IF NOT EXISTS (won't duplicate columns)
- No DROP statements
- No data deletion

You can run it multiple times safely!
