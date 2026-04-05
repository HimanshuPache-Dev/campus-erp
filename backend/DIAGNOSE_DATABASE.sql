-- ============================================================
-- DIAGNOSE DATABASE ISSUES
-- Run this to see what data exists and what's missing
-- ============================================================

-- Check if tables exist
SELECT '📋 CHECKING TABLES...' as message;
SELECT '' as blank;

SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (VALUES 
  ('users'),
  ('student_details'),
  ('courses'),
  ('student_enrollments'),
  ('attendance'),
  ('results'),
  ('fees'),
  ('notifications'),
  ('timetable')
) AS t(table_name);

SELECT '' as blank;

-- Check users table structure
SELECT '👤 USERS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

SELECT '' as blank;

-- Check users data
SELECT '👥 USERS DATA:' as info;
SELECT 
  role,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as sample_emails
FROM users
GROUP BY role;

SELECT '' as blank;

-- Check if password_reset_required column exists
SELECT '🔐 PASSWORD RESET COLUMN:' as info;
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'password_reset_required'
    ) THEN '✅ password_reset_required EXISTS'
    ELSE '❌ password_reset_required MISSING - Run migration!'
  END as status;

SELECT '' as blank;

-- Check courses
SELECT '📚 COURSES DATA:' as info;
SELECT 
  COUNT(*) as total_courses,
  COUNT(DISTINCT department) as departments,
  COUNT(DISTINCT semester) as semesters
FROM courses;

SELECT 'Sample courses:' as info;
SELECT course_code, course_name, semester, department
FROM courses
LIMIT 5;

SELECT '' as blank;

-- Check student enrollments
SELECT '📝 ENROLLMENTS DATA:' as info;
SELECT 
  COUNT(*) as total_enrollments,
  COUNT(DISTINCT student_id) as students_enrolled,
  COUNT(DISTINCT course_id) as courses_with_students
FROM student_enrollments;

SELECT '' as blank;

-- Check timetable
SELECT '📅 TIMETABLE DATA:' as info;
SELECT 
  COUNT(*) as total_slots,
  COUNT(DISTINCT course_id) as courses_scheduled,
  COUNT(DISTINCT day_of_week) as days_used
FROM timetable;

SELECT 'Sample timetable:' as info;
SELECT 
  t.day_of_week,
  t.start_time,
  t.end_time,
  c.course_code,
  c.course_name
FROM timetable t
LEFT JOIN courses c ON t.course_id = c.id
LIMIT 5;

SELECT '' as blank;

-- Check fees
SELECT '💰 FEES DATA:' as info;
SELECT 
  COUNT(*) as total_fee_records,
  COUNT(DISTINCT student_id) as students_with_fees,
  SUM(total_amount) as total_fees,
  SUM(amount_paid) as total_paid
FROM fees;

SELECT '' as blank;

-- Check notifications
SELECT '🔔 NOTIFICATIONS DATA:' as info;
SELECT 
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN is_read = false THEN 1 END) as unread,
  COUNT(DISTINCT user_id) as users_with_notifications
FROM notifications;

SELECT '' as blank;

-- Check for common issues
SELECT '⚠️ POTENTIAL ISSUES:' as info;

-- Issue 1: Students without enrollments
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '⚠️ ' || COUNT(*) || ' students have NO enrollments'
    ELSE '✅ All students have enrollments'
  END as issue
FROM users u
WHERE u.role = 'student'
AND NOT EXISTS (
  SELECT 1 FROM student_enrollments se WHERE se.student_id = u.id
);

-- Issue 2: Courses without timetable
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '⚠️ ' || COUNT(*) || ' courses have NO timetable'
    ELSE '✅ All courses have timetable'
  END as issue
FROM courses c
WHERE NOT EXISTS (
  SELECT 1 FROM timetable t WHERE t.course_id = c.id
);

-- Issue 3: Students without fees
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '⚠️ ' || COUNT(*) || ' students have NO fees assigned'
    ELSE '✅ All students have fees'
  END as issue
FROM users u
WHERE u.role = 'student'
AND NOT EXISTS (
  SELECT 1 FROM fees f WHERE f.student_id = u.id
);

SELECT '' as blank;

-- Show sample student with all data
SELECT '🎓 SAMPLE STUDENT DATA:' as info;
WITH sample_student AS (
  SELECT id, email, first_name, last_name
  FROM users
  WHERE role = 'student'
  LIMIT 1
)
SELECT 
  'Student: ' || s.first_name || ' ' || s.last_name as info,
  'Email: ' || s.email as email,
  'Enrollments: ' || COALESCE((SELECT COUNT(*)::text FROM student_enrollments WHERE student_id = s.id), '0') as enrollments,
  'Fees: ' || COALESCE((SELECT COUNT(*)::text FROM fees WHERE student_id = s.id), '0') as fees,
  'Notifications: ' || COALESCE((SELECT COUNT(*)::text FROM notifications WHERE user_id = s.id), '0') as notifications
FROM sample_student s;

SELECT '' as blank;
SELECT '✅ DIAGNOSIS COMPLETE!' as final_message;
SELECT 'Review the output above to identify missing data or structure issues.' as note;
