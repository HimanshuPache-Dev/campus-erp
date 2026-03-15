-- ============================================================
-- Fix All Database Issues - Run in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== 1. CREATE NOTIFICATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- ==================== 2. VERIFY COURSE_ASSIGNMENTS TABLE ====================
-- Check if table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_assignments') THEN
    -- Create the table if it doesn't exist
    CREATE TABLE course_assignments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
      faculty_id UUID REFERENCES users(id) ON DELETE CASCADE,
      academic_year VARCHAR(10),
      semester_type VARCHAR(10) CHECK (semester_type IN ('Winter', 'Summer')),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(course_id, faculty_id, academic_year, semester_type)
    );
    
    CREATE INDEX IF NOT EXISTS idx_course_assignments_course ON course_assignments(course_id);
    CREATE INDEX IF NOT EXISTS idx_course_assignments_faculty ON course_assignments(faculty_id);
    ALTER TABLE course_assignments DISABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'course_assignments table created';
  ELSE
    RAISE NOTICE 'course_assignments table already exists';
  END IF;
END $$;

-- ==================== 3. VERIFY STUDENT_ENROLLMENTS TABLE ====================
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_enrollments') THEN
    CREATE TABLE student_enrollments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES users(id) ON DELETE CASCADE,
      course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
      academic_year VARCHAR(10),
      semester_type VARCHAR(10),
      enrolled_at TIMESTAMPTZ DEFAULT NOW(),
      is_completed BOOLEAN DEFAULT false,
      UNIQUE(student_id, course_id, academic_year, semester_type)
    );
    
    CREATE INDEX IF NOT EXISTS idx_student_enrollments_student ON student_enrollments(student_id);
    CREATE INDEX IF NOT EXISTS idx_student_enrollments_course ON student_enrollments(course_id);
    ALTER TABLE student_enrollments DISABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'student_enrollments table created';
  ELSE
    RAISE NOTICE 'student_enrollments table already exists';
  END IF;
END $$;

-- ==================== 4. FIX RESULTS TABLE COLUMNS ====================
-- Check if results table has correct columns
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'results' AND column_name = 'faculty_id') THEN
    ALTER TABLE results ADD COLUMN faculty_id UUID REFERENCES users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'results' AND column_name = 'exam_type') THEN
    ALTER TABLE results ADD COLUMN exam_type VARCHAR(20) DEFAULT 'final';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'results' AND column_name = 'semester_type') THEN
    ALTER TABLE results ADD COLUMN semester_type VARCHAR(10);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'results' AND column_name = 'academic_year') THEN
    ALTER TABLE results ADD COLUMN academic_year VARCHAR(10);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'results' AND column_name = 'is_approved') THEN
    ALTER TABLE results ADD COLUMN is_approved BOOLEAN DEFAULT false;
  END IF;
  
  RAISE NOTICE 'Results table columns verified';
END $$;

-- ==================== 5. VERIFY ALL TABLES EXIST ====================
DO $$
DECLARE
  missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check each required table
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    missing_tables := array_append(missing_tables, 'users');
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'student_details') THEN
    missing_tables := array_append(missing_tables, 'student_details');
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'faculty_details') THEN
    missing_tables := array_append(missing_tables, 'faculty_details');
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courses') THEN
    missing_tables := array_append(missing_tables, 'courses');
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'attendance') THEN
    missing_tables := array_append(missing_tables, 'attendance');
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'results') THEN
    missing_tables := array_append(missing_tables, 'results');
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fees') THEN
    missing_tables := array_append(missing_tables, 'fees');
  END IF;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'Missing tables: %. Please run the full schema.sql first.', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'All required tables exist!';
  END IF;
END $$;

-- ==================== 6. REFRESH SCHEMA CACHE ====================
-- Force Supabase to refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- ==================== 7. VERIFICATION QUERIES ====================
-- Run these to verify everything is working

SELECT 'Tables Status:' as info;
SELECT 
  tablename,
  CASE 
    WHEN tablename IN (
      'users', 'student_details', 'faculty_details', 'courses',
      'course_assignments', 'student_enrollments', 'attendance',
      'results', 'fees', 'notifications'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'users', 'student_details', 'faculty_details', 'courses',
    'course_assignments', 'student_enrollments', 'attendance',
    'results', 'fees', 'notifications'
  )
ORDER BY tablename;

SELECT 'Row Counts:' as info;
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'course_assignments', COUNT(*) FROM course_assignments
UNION ALL
SELECT 'student_enrollments', COUNT(*) FROM student_enrollments
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- ==================== SUCCESS MESSAGE ====================
SELECT '🎉 Database fix complete! All tables verified.' as message;
