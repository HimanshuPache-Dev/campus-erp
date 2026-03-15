-- ============================================================
-- VERIFY DATABASE SETUP - Run After COMPLETE_DATABASE_SETUP.sql
-- ============================================================

-- This script checks if all tables and columns exist correctly

SELECT '========================================' as separator;
SELECT '🔍 VERIFYING DATABASE SETUP' as status;
SELECT '========================================' as separator;

-- ==================== CHECK ALL TABLES EXIST ====================
SELECT '1️⃣ Checking Tables...' as step;

SELECT 
  CASE 
    WHEN COUNT(*) = 10 THEN '✅ All 10 tables exist'
    ELSE '❌ Missing tables! Expected 10, found ' || COUNT(*)::text
  END as table_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 'student_details', 'faculty_details', 'courses',
    'course_assignments', 'student_enrollments', 'attendance',
    'results', 'fees', 'notifications'
  );

-- List all tables
SELECT 
  table_name,
  '✅' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 'student_details', 'faculty_details', 'courses',
    'course_assignments', 'student_enrollments', 'attendance',
    'results', 'fees', 'notifications'
  )
ORDER BY table_name;

-- ==================== CHECK CRITICAL COLUMNS ====================
SELECT '2️⃣ Checking Critical Columns...' as step;

-- Check users table
SELECT 
  'users table' as table_name,
  CASE 
    WHEN COUNT(*) >= 15 THEN '✅ Has ' || COUNT(*)::text || ' columns'
    ELSE '⚠️ Only ' || COUNT(*)::text || ' columns'
  END as column_status
FROM information_schema.columns 
WHERE table_name = 'users';

-- Check notifications table
SELECT 
  'notifications table' as table_name,
  CASE 
    WHEN COUNT(*) >= 9 THEN '✅ Has ' || COUNT(*)::text || ' columns'
    ELSE '⚠️ Only ' || COUNT(*)::text || ' columns'
  END as column_status
FROM information_schema.columns 
WHERE table_name = 'notifications';

-- Check fees table has amount_paid
SELECT 
  'fees.amount_paid' as column_check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'fees' AND column_name = 'amount_paid'
    ) THEN '✅ Exists'
    ELSE '❌ Missing'
  END as status;

-- Check fees table has transaction_id
SELECT 
  'fees.transaction_id' as column_check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'fees' AND column_name = 'transaction_id'
    ) THEN '✅ Exists'
    ELSE '❌ Missing'
  END as status;

-- ==================== CHECK FOREIGN KEYS ====================
SELECT '3️⃣ Checking Foreign Key Relationships...' as step;

SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  '✅' as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'student_details', 'faculty_details', 'course_assignments',
    'student_enrollments', 'attendance', 'results', 'fees', 'notifications'
  )
ORDER BY tc.table_name, kcu.column_name;

-- ==================== CHECK INDEXES ====================
SELECT '4️⃣ Checking Indexes...' as step;

SELECT 
  tablename,
  indexname,
  '✅' as status
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN (
    'users', 'student_details', 'faculty_details', 'courses',
    'course_assignments', 'student_enrollments', 'attendance',
    'results', 'fees', 'notifications'
  )
ORDER BY tablename, indexname;

-- ==================== CHECK RLS STATUS ====================
SELECT '5️⃣ Checking Row Level Security (should be disabled)...' as step;

SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = false THEN '✅ RLS Disabled (correct)'
    ELSE '⚠️ RLS Enabled (may cause issues)'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'users', 'student_details', 'faculty_details', 'courses',
    'course_assignments', 'student_enrollments', 'attendance',
    'results', 'fees', 'notifications'
  )
ORDER BY tablename;

-- ==================== CHECK DATA COUNTS ====================
SELECT '6️⃣ Checking Data Counts...' as step;

SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'student_details', COUNT(*) FROM student_details
UNION ALL
SELECT 'faculty_details', COUNT(*) FROM faculty_details
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'course_assignments', COUNT(*) FROM course_assignments
UNION ALL
SELECT 'student_enrollments', COUNT(*) FROM student_enrollments
UNION ALL
SELECT 'attendance', COUNT(*) FROM attendance
UNION ALL
SELECT 'results', COUNT(*) FROM results
UNION ALL
SELECT 'fees', COUNT(*) FROM fees
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
ORDER BY table_name;

-- ==================== FINAL STATUS ====================
SELECT '========================================' as separator;
SELECT 
  CASE 
    WHEN (
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN (
          'users', 'student_details', 'faculty_details', 'courses',
          'course_assignments', 'student_enrollments', 'attendance',
          'results', 'fees', 'notifications'
        )
    ) = 10 THEN '✅ DATABASE SETUP COMPLETE!'
    ELSE '❌ DATABASE SETUP INCOMPLETE - Check errors above'
  END as final_status;
SELECT '========================================' as separator;

-- ==================== NEXT STEPS ====================
SELECT '📝 NEXT STEPS:' as info;
SELECT '1. If all checks passed, your database is ready!' as step_1;
SELECT '2. Run seed script to add sample data: node src/seed.js' as step_2;
SELECT '3. Start backend: npm start' as step_3;
SELECT '4. Start frontend: npm run dev' as step_4;
SELECT '5. Login at http://localhost:5173' as step_5;

