-- ============================================================
-- ADD COMPUTER ENGINEERING FACULTY
-- Run this in Supabase SQL Editor
-- ============================================================

-- Insert Computer Engineering Faculty Members
INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  role,
  department,
  phone,
  gender,
  is_active
) VALUES
-- Faculty 1: Dr. Rajesh Sharma (Data Structures & Algorithms)
(
  'rajesh.sharma@campus.com',
  'faculty123',
  'Rajesh',
  'Sharma',
  'faculty',
  'Computer Engineering',
  '9876543210',
  'male',
  true
),

-- Faculty 2: Dr. Priya Desai (Database Management Systems)
(
  'priya.desai@campus.com',
  'faculty123',
  'Priya',
  'Desai',
  'faculty',
  'Computer Engineering',
  '9876543211',
  'female',
  true
),

-- Faculty 3: Prof. Amit Patel (Web Development)
(
  'amit.patel@campus.com',
  'faculty123',
  'Amit',
  'Patel',
  'faculty',
  'Computer Engineering',
  '9876543212',
  'male',
  true
),

-- Faculty 4: Dr. Sneha Kulkarni (Machine Learning)
(
  'sneha.kulkarni@campus.com',
  'faculty123',
  'Sneha',
  'Kulkarni',
  'faculty',
  'Computer Engineering',
  '9876543213',
  'female',
  true
),

-- Faculty 5: Prof. Vikram Singh (Computer Networks)
(
  'vikram.singh@campus.com',
  'faculty123',
  'Vikram',
  'Singh',
  'faculty',
  'Computer Engineering',
  '9876543214',
  'male',
  true
),

-- Faculty 6: Dr. Anjali Mehta (Operating Systems)
(
  'anjali.mehta@campus.com',
  'faculty123',
  'Anjali',
  'Mehta',
  'faculty',
  'Computer Engineering',
  '9876543215',
  'female',
  true
),

-- Faculty 7: Prof. Karan Joshi (Software Engineering)
(
  'karan.joshi@campus.com',
  'faculty123',
  'Karan',
  'Joshi',
  'faculty',
  'Computer Engineering',
  '9876543216',
  'male',
  true
),

-- Faculty 8: Dr. Neha Agarwal (Artificial Intelligence)
(
  'neha.agarwal@campus.com',
  'faculty123',
  'Neha',
  'Agarwal',
  'faculty',
  'Computer Engineering',
  '9876543217',
  'female',
  true
),

-- Faculty 9: Prof. Rahul Verma (Cloud Computing)
(
  'rahul.verma@campus.com',
  'faculty123',
  'Rahul',
  'Verma',
  'faculty',
  'Computer Engineering',
  '9876543218',
  'male',
  true
),

-- Faculty 10: Dr. Pooja Reddy (Cyber Security)
(
  'pooja.reddy@campus.com',
  'faculty123',
  'Pooja',
  'Reddy',
  'faculty',
  'Computer Engineering',
  '9876543219',
  'female',
  true
);

-- Verify the insertion
SELECT '✅ Computer Engineering Faculty Added Successfully!' as message;
SELECT '' as blank;
SELECT 'Total Faculty Count:' as info;
SELECT COUNT(*) as total_faculty 
FROM users 
WHERE role = 'faculty' AND department = 'Computer Engineering';

SELECT '' as blank;
SELECT 'Faculty List:' as info;
SELECT 
  first_name || ' ' || last_name as name,
  email,
  phone,
  gender
FROM users
WHERE role = 'faculty' 
AND department = 'Computer Engineering'
ORDER BY first_name;

-- Show login credentials
SELECT '' as blank;
SELECT '🔑 Login Credentials for All Faculty:' as info;
SELECT 
  email as "Email",
  'faculty123' as "Password",
  first_name || ' ' || last_name as "Name"
FROM users
WHERE role = 'faculty' 
AND department = 'Computer Engineering'
ORDER BY first_name;
