-- ============================================================
-- COMPLETE FRESH DATABASE SETUP
-- Run this in Supabase SQL Editor to set up everything
-- ============================================================

-- Step 1: Add missing columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT false;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS temporary_password VARCHAR(255);

-- Step 2: Ensure admin doesn't require password reset
UPDATE users 
SET password_reset_required = false 
WHERE role = 'admin';

-- Step 3: Insert Computer Engineering Faculty (if not exists)
INSERT INTO users (
  email, password_hash, first_name, last_name, role, department, 
  phone, gender, is_active, password_reset_required
)
SELECT * FROM (VALUES
  ('rajesh.sharma@campus.com', 'faculty123', 'Rajesh', 'Sharma', 'faculty', 'Computer Engineering', '9876543210', 'male', true, false),
  ('priya.desai@campus.com', 'faculty123', 'Priya', 'Desai', 'faculty', 'Computer Engineering', '9876543211', 'female', true, false),
  ('amit.patel@campus.com', 'faculty123', 'Amit', 'Patel', 'faculty', 'Computer Engineering', '9876543212', 'male', true, false),
  ('sneha.kulkarni@campus.com', 'faculty123', 'Sneha', 'Kulkarni', 'faculty', 'Computer Engineering', '9876543213', 'female', true, false),
  ('vikram.singh@campus.com', 'faculty123', 'Vikram', 'Singh', 'faculty', 'Computer Engineering', '9876543214', 'male', true, false),
  ('anjali.mehta@campus.com', 'faculty123', 'Anjali', 'Mehta', 'faculty', 'Computer Engineering', '9876543215', 'female', true, false),
  ('karan.joshi@campus.com', 'faculty123', 'Karan', 'Joshi', 'faculty', 'Computer Engineering', '9876543216', 'male', true, false),
  ('neha.agarwal@campus.com', 'faculty123', 'Neha', 'Agarwal', 'faculty', 'Computer Engineering', '9876543217', 'female', true, false),
  ('rahul.verma@campus.com', 'faculty123', 'Rahul', 'Verma', 'faculty', 'Computer Engineering', '9876543218', 'male', true, false),
  ('pooja.reddy@campus.com', 'faculty123', 'Pooja', 'Reddy', 'faculty', 'Computer Engineering', '9876543219', 'female', true, false)
) AS v(email, password_hash, first_name, last_name, role, department, phone, gender, is_active, password_reset_required)
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE users.email = v.email
);

-- Step 4: Verify database structure
SELECT '✅ DATABASE SETUP COMPLETE!' as message;
SELECT '' as blank;

-- Check users table
SELECT '📊 USERS TABLE:' as info;
SELECT 
  role,
  COUNT(*) as count,
  STRING_AGG(DISTINCT department, ', ') as departments
FROM users
GROUP BY role
ORDER BY role;

SELECT '' as blank;

-- Check courses
SELECT '📚 COURSES:' as info;
SELECT 
  course_code,
  course_name,
  semester,
  department
FROM courses
ORDER BY semester, course_code
LIMIT 10;

SELECT '' as blank;

-- Check enrollments
SELECT '👥 ENROLLMENTS:' as info;
SELECT 
  COUNT(*) as total_enrollments,
  COUNT(DISTINCT student_id) as unique_students,
  COUNT(DISTINCT course_id) as unique_courses
FROM student_enrollments;

SELECT '' as blank;

-- Check timetable
SELECT '📅 TIMETABLE SLOTS:' as info;
SELECT 
  day_of_week,
  COUNT(*) as slots
FROM timetable
GROUP BY day_of_week
ORDER BY 
  CASE day_of_week
    WHEN 'Monday' THEN 1
    WHEN 'Tuesday' THEN 2
    WHEN 'Wednesday' THEN 3
    WHEN 'Thursday' THEN 4
    WHEN 'Friday' THEN 5
    WHEN 'Saturday' THEN 6
  END;

SELECT '' as blank;

-- Check fees
SELECT '💰 FEES RECORDS:' as info;
SELECT 
  status,
  COUNT(*) as count,
  SUM(total_amount) as total_amount,
  SUM(amount_paid) as total_paid
FROM fees
GROUP BY status;

SELECT '' as blank;

-- Check notifications
SELECT '🔔 NOTIFICATIONS:' as info;
SELECT 
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN is_read = false THEN 1 END) as unread
FROM notifications;

SELECT '' as blank;

-- Login credentials summary
SELECT '🔑 LOGIN CREDENTIALS:' as info;
SELECT '' as blank;
SELECT 'ADMIN:' as type, email, 'admin123' as password 
FROM users WHERE role = 'admin'
UNION ALL
SELECT 'FACULTY:', email, 'faculty123' 
FROM users WHERE role = 'faculty' LIMIT 3
UNION ALL
SELECT 'STUDENTS:', email, 'student123' 
FROM users WHERE role = 'student' LIMIT 3;

SELECT '' as blank;
SELECT '✅ All tables verified and ready!' as final_message;
