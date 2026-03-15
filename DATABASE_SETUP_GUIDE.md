# 🗄️ Complete Database Setup Guide

## 📋 Overview

This guide will help you set up all necessary tables in Supabase for the Campus ERP system.

## 🎯 What Tables Will Be Created

### Core Tables (10):
1. **users** - All users (admin, faculty, students)
2. **student_details** - Student-specific information
3. **faculty_details** - Faculty-specific information
4. **courses** - Course catalog
5. **course_assignments** - Faculty-Course mapping
6. **student_enrollments** - Student-Course enrollment
7. **attendance** - Attendance records
8. **results** - Exam results and grades
9. **fees** - Fee management
10. **notifications** - System notifications

## 🚀 Setup Instructions

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project: `ojdxczneqaxbbvjdehro`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Complete Setup Script

1. Open the file: `campus-erp/backend/COMPLETE_DATABASE_SETUP.sql`
2. Copy ALL the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **Run** button (or press Ctrl+Enter)

### Step 3: Verify Tables Were Created

Run this query to check all tables:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see these 10 tables:
- attendance
- course_assignments
- courses
- faculty_details
- fees
- notifications
- results
- student_details
- student_enrollments
- users

## ✅ What the Script Does

### Creates Tables:
- All 10 core tables with proper relationships
- Foreign key constraints
- Check constraints for data validation
- Default values

### Creates Indexes:
- Performance indexes on frequently queried columns
- Unique indexes to prevent duplicates

### Sets Permissions:
- Disables Row Level Security (RLS) for backend access
- Grants permissions to service_role
- Grants permissions to authenticated users

### Updates Existing Tables:
- Adds missing columns if tables already exist
- Renames columns to match frontend expectations
- Migrates data from old column names

## 🔧 Key Table Structures

### Users Table
```sql
- id (UUID, Primary Key)
- email (Unique)
- first_name, last_name
- role (admin/faculty/student)
- department
- phone, address, date_of_birth, gender
- profile_picture_url
- is_active, last_login
- created_at, updated_at
```

### Attendance Table
```sql
- student_id (FK to users)
- course_id (FK to courses)
- faculty_id (FK to users)
- date
- status (present/absent/late)
- semester_type, academic_year
- marked_at
```

### Results Table
```sql
- student_id (FK to users)
- course_id (FK to courses)
- faculty_id (FK to users)
- marks_obtained, total_marks
- grade, grade_point
- exam_type (midterm/final/quiz)
- semester_type, academic_year
- is_approved
```

### Fees Table
```sql
- student_id (FK to users)
- fee_type (Tuition/Lab/Library/etc)
- amount, amount_paid
- due_date, paid_date
- payment_status (pending/paid/overdue/partial)
- payment_method, transaction_id
- academic_year, semester_type
```

### Notifications Table
```sql
- sender_id (FK to users)
- recipient_id (FK to users)
- recipient_type (individual/department/all)
- title, message
- notification_type (general/academic/exam/event)
- priority (low/medium/high)
- is_read
- created_at
```

## 🎨 Sample Data (Optional)

After creating tables, you can insert sample data using the seed script:

```bash
cd campus-erp/backend
node src/seed.js
```

This will create:
- 1 Admin user
- 3 Faculty users
- 15 Student users
- Sample courses
- Sample enrollments

## 🔍 Verify Setup

### Check Table Count:
```sql
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
```
Expected: 10 tables

### Check Users:
```sql
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
```

### Check Courses:
```sql
SELECT department, COUNT(*) as count 
FROM courses 
WHERE is_active = true 
GROUP BY department;
```

## 🐛 Troubleshooting

### Error: "relation already exists"
- This is normal if tables already exist
- The script uses `CREATE TABLE IF NOT EXISTS`
- It will skip existing tables and only create missing ones

### Error: "column already exists"
- This is normal if columns already exist
- The script uses `ADD COLUMN IF NOT EXISTS`
- It will skip existing columns

### Error: "permission denied"
- Make sure you're using the service_role key
- Check that RLS is disabled
- Verify grants were applied

## 📊 Database Relationships

```
users (1) ----< (many) student_details
users (1) ----< (many) faculty_details
users (1) ----< (many) attendance (as student)
users (1) ----< (many) attendance (as faculty)
users (1) ----< (many) results (as student)
users (1) ----< (many) results (as faculty)
users (1) ----< (many) fees
users (1) ----< (many) notifications (as sender)
users (1) ----< (many) notifications (as recipient)

courses (1) ----< (many) course_assignments
courses (1) ----< (many) student_enrollments
courses (1) ----< (many) attendance
courses (1) ----< (many) results

course_assignments: faculty <-> course mapping
student_enrollments: student <-> course mapping
```

## ✨ Next Steps

After database setup:

1. ✅ Verify all tables exist
2. ✅ Run seed script to add sample data
3. ✅ Test frontend pages
4. ✅ Verify data loads correctly
5. ✅ Test CRUD operations

## 🎉 You're Done!

Your database is now fully set up and ready to use with the Campus ERP application!

All 27 pages in the frontend are configured to work with these tables.
