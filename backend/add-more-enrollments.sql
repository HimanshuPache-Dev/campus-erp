-- Add more student course enrollments
-- Run this in Supabase SQL Editor if you want to add more courses to students

-- Add more courses to Amit Verma (currently only has CS101)
INSERT INTO student_enrollments (student_id, course_id, academic_year, semester_type)
VALUES 
('b56ed74b-3c6c-4c19-8865-a38b5cc373b9', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c2', '2025-26', 'Winter'),
('b56ed74b-3c6c-4c19-8865-a38b5cc373b9', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c3', '2025-26', 'Winter')
ON CONFLICT DO NOTHING;

-- Add more courses to Priya Patel (currently has CS101, CS102)
INSERT INTO student_enrollments (student_id, course_id, academic_year, semester_type)
VALUES 
('a56ed74b-3c6c-4c19-8865-a38b5cc373b8', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c3', '2025-26', 'Winter')
ON CONFLICT DO NOTHING;

-- Verify enrollments
SELECT 
  u.first_name || ' ' || u.last_name as student_name,
  c.course_code,
  c.course_name,
  se.academic_year,
  se.semester_type
FROM student_enrollments se
JOIN users u ON se.student_id = u.id
JOIN courses c ON se.course_id = c.id
ORDER BY u.first_name, c.course_code;

SELECT '✅ Student enrollments updated!' as message;
