-- ============================================================
-- CHECK TIMETABLE AND ENROLLMENT DATA
-- Run this in Supabase SQL Editor to see what's in the database
-- ============================================================

-- Check if students exist
SELECT '=== STUDENTS ===' as section;
SELECT id, email, first_name, last_name FROM users WHERE role = 'student';

-- Check student enrollments
SELECT '' as blank;
SELECT '=== STUDENT ENROLLMENTS ===' as section;
SELECT 
  se.id,
  u.email as student_email,
  c.course_code,
  c.course_name,
  se.academic_year,
  se.semester_type
FROM student_enrollments se
JOIN users u ON se.student_id = u.id
JOIN courses c ON se.course_id = c.id
ORDER BY u.email, c.course_code;

-- Check timetable slots
SELECT '' as blank2;
SELECT '=== TIMETABLE SLOTS ===' as section;
SELECT 
  ts.id,
  c.course_code,
  c.course_name,
  ts.day_of_week,
  ts.start_time,
  ts.end_time,
  ts.room_number,
  ts.semester,
  ts.academic_year,
  ts.is_active
FROM timetable_slots ts
JOIN courses c ON ts.course_id = c.id
ORDER BY ts.day_of_week, ts.start_time;

-- Check if Rahul Sharma has enrollments and timetable
SELECT '' as blank3;
SELECT '=== RAHUL SHARMA TIMETABLE ===' as section;
SELECT 
  c.course_code,
  c.course_name,
  ts.day_of_week,
  ts.start_time,
  ts.end_time,
  ts.room_number
FROM users u
JOIN student_enrollments se ON u.id = se.student_id
JOIN courses c ON se.course_id = c.id
LEFT JOIN timetable_slots ts ON c.id = ts.course_id AND ts.is_active = true
WHERE u.email = 'rahul.sharma@campus.edu'
ORDER BY ts.day_of_week, ts.start_time;

-- Summary
SELECT '' as blank4;
SELECT '=== SUMMARY ===' as section;
SELECT 'Total Students: ' || COUNT(*) as info FROM users WHERE role = 'student';
SELECT 'Total Enrollments: ' || COUNT(*) as info FROM student_enrollments;
SELECT 'Total Timetable Slots: ' || COUNT(*) as info FROM timetable_slots WHERE is_active = true;
SELECT 'Rahul Enrollments: ' || COUNT(*) as info 
FROM student_enrollments se 
JOIN users u ON se.student_id = u.id 
WHERE u.email = 'rahul.sharma@campus.edu';
