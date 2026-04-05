-- ============================================================
-- VERIFY AND FIX ALL DATA ISSUES
-- Run this in Supabase SQL Editor
-- ============================================================

-- Check if courses exist
SELECT '=== COURSES ===' as section;
SELECT id, course_code, course_name, semester FROM courses ORDER BY course_code;

-- Check if students exist
SELECT '' as blank;
SELECT '=== STUDENTS ===' as section;
SELECT id, email, first_name, last_name, role FROM users WHERE role = 'student';

-- Check if faculty exist
SELECT '' as blank2;
SELECT '=== FACULTY ===' as section;
SELECT id, email, first_name, last_name, role FROM users WHERE role = 'faculty';

-- Check student enrollments
SELECT '' as blank3;
SELECT '=== STUDENT ENROLLMENTS ===' as section;
SELECT 
  se.id,
  u.first_name || ' ' || u.last_name as student_name,
  c.course_code,
  c.course_name,
  se.academic_year,
  se.semester_type
FROM student_enrollments se
JOIN users u ON se.student_id = u.id
JOIN courses c ON se.course_id = c.id
ORDER BY u.first_name, c.course_code;

-- Check if enrollments are missing
SELECT '' as blank4;
SELECT '=== MISSING ENROLLMENTS CHECK ===' as section;
SELECT 
  'Total Students: ' || COUNT(*) as info
FROM users WHERE role = 'student';

SELECT 
  'Total Enrollments: ' || COUNT(*) as info
FROM student_enrollments;

-- If enrollments are missing, add them
DO $$
DECLARE
  v_rahul_id UUID;
  v_priya_id UUID;
  v_amit_id UUID;
  v_cs101_id UUID;
  v_cs102_id UUID;
  v_ma101_id UUID;
  v_enrollment_count INT;
BEGIN
  -- Get student IDs
  SELECT id INTO v_rahul_id FROM users WHERE email = 'rahul.sharma@campus.edu';
  SELECT id INTO v_priya_id FROM users WHERE email = 'priya.patel@campus.edu';
  SELECT id INTO v_amit_id FROM users WHERE email = 'amit.verma@campus.edu';
  
  -- Get course IDs
  SELECT id INTO v_cs101_id FROM courses WHERE course_code = 'CS101';
  SELECT id INTO v_cs102_id FROM courses WHERE course_code = 'CS102';
  SELECT id INTO v_ma101_id FROM courses WHERE course_code = 'MA101';
  
  -- Check if enrollments exist
  SELECT COUNT(*) INTO v_enrollment_count FROM student_enrollments;
  
  IF v_enrollment_count < 6 THEN
    -- Delete existing enrollments first
    DELETE FROM student_enrollments;
    
    -- Insert fresh enrollments
    INSERT INTO student_enrollments (student_id, course_id, academic_year, semester_type)
    VALUES 
    -- Rahul Sharma - 3 courses
    (v_rahul_id, v_cs101_id, '2025-26', 'Winter'),
    (v_rahul_id, v_cs102_id, '2025-26', 'Winter'),
    (v_rahul_id, v_ma101_id, '2025-26', 'Winter'),
    -- Priya Patel - 2 courses
    (v_priya_id, v_cs101_id, '2025-26', 'Winter'),
    (v_priya_id, v_cs102_id, '2025-26', 'Winter'),
    -- Amit Verma - 1 course
    (v_amit_id, v_cs101_id, '2025-26', 'Winter')
    ON CONFLICT (student_id, course_id, academic_year, semester_type) DO NOTHING;
    
    RAISE NOTICE '✅ Student enrollments added successfully!';
  ELSE
    RAISE NOTICE '✅ Student enrollments already exist!';
  END IF;
END $$;

-- Verify enrollments were added
SELECT '' as blank5;
SELECT '=== FINAL ENROLLMENT COUNT ===' as section;
SELECT 
  u.first_name || ' ' || u.last_name as student_name,
  COUNT(se.id) as enrolled_courses
FROM users u
LEFT JOIN student_enrollments se ON u.id = se.student_id
WHERE u.role = 'student'
GROUP BY u.id, u.first_name, u.last_name
ORDER BY u.first_name;

-- Show detailed enrollments
SELECT '' as blank6;
SELECT '=== DETAILED ENROLLMENTS ===' as section;
SELECT 
  u.first_name || ' ' || u.last_name as student,
  c.course_code,
  c.course_name
FROM student_enrollments se
JOIN users u ON se.student_id = u.id
JOIN courses c ON se.course_id = c.id
ORDER BY u.first_name, c.course_code;

SELECT '' as blank7;
SELECT '✅ Verification complete!' as message;
