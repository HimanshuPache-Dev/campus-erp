-- ============================================================
-- COMPLETE DATABASE SETUP WITH SAMPLE USERS
-- Run this ENTIRE script in Supabase SQL Editor
-- This will create all tables AND add users you can login with
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== DROP EXISTING TABLES (FRESH START) ====================
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS fees CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS student_enrollments CASCADE;
DROP TABLE IF EXISTS course_assignments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS faculty_details CASCADE;
DROP TABLE IF EXISTS student_details CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==================== USERS TABLE ====================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
  department VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  gender VARCHAR(10),
  profile_picture_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== STUDENT DETAILS ====================
CREATE TABLE student_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  enrollment_number VARCHAR(50) UNIQUE NOT NULL,
  current_semester INTEGER DEFAULT 1,
  batch_year INTEGER,
  guardian_name VARCHAR(100),
  guardian_phone VARCHAR(20),
  guardian_email VARCHAR(255),
  admission_date DATE DEFAULT CURRENT_DATE,
  cgpa NUMERIC(3,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== FACULTY DETAILS ====================
CREATE TABLE faculty_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  qualification VARCHAR(200),
  specialization VARCHAR(200),
  joining_date DATE DEFAULT CURRENT_DATE,
  experience_years INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== COURSES ====================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_name VARCHAR(200) NOT NULL,
  department VARCHAR(100) NOT NULL,
  semester INTEGER NOT NULL,
  credits INTEGER DEFAULT 4,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'active',
  exam_date DATE,
  exam_time TIME,
  exam_duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== COURSE ASSIGNMENTS ====================
CREATE TABLE course_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES users(id) ON DELETE CASCADE,
  academic_year VARCHAR(10) NOT NULL,
  semester_type VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, faculty_id, academic_year, semester_type)
);

-- ==================== STUDENT ENROLLMENTS ====================
CREATE TABLE student_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  academic_year VARCHAR(10) NOT NULL,
  semester_type VARCHAR(20) NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT false,
  UNIQUE(student_id, course_id, academic_year, semester_type)
);

-- ==================== ATTENDANCE ====================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES users(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  semester_type VARCHAR(20),
  academic_year VARCHAR(10),
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id, date)
);

-- ==================== RESULTS ====================
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES users(id),
  marks_obtained NUMERIC(5,2) NOT NULL,
  total_marks NUMERIC(5,2) DEFAULT 100,
  grade VARCHAR(5),
  grade_point NUMERIC(3,1),
  exam_type VARCHAR(20) DEFAULT 'final',
  semester_type VARCHAR(20),
  academic_year VARCHAR(10),
  is_approved BOOLEAN DEFAULT false,
  declared_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id, exam_type, semester_type, academic_year)
);

-- ==================== FEES ====================
CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fee_type VARCHAR(100) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
  paid_date DATE,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  academic_year VARCHAR(10),
  semester_type VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== NOTIFICATIONS ====================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  priority VARCHAR(50) DEFAULT 'normal',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== INDEXES ====================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_student_details_user ON student_details(user_id);
CREATE INDEX idx_faculty_details_user ON faculty_details(user_id);
CREATE INDEX idx_courses_department ON courses(department);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_results_student ON results(student_id);
CREATE INDEX idx_fees_student ON fees(student_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- ==================== DISABLE RLS ====================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE results DISABLE ROW LEVEL SECURITY;
ALTER TABLE fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- ==================== GRANT PERMISSIONS ====================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;

-- ============================================================
-- INSERT SAMPLE USERS (YOU CAN LOGIN WITH THESE)
-- ============================================================

-- 1. ADMIN USER
INSERT INTO users (id, email, first_name, last_name, role, department, phone, is_active)
VALUES 
('b84221c5-894d-4b3a-b5bf-c680ce994218', 'admin@campus.com', 'Admin', 'User', 'admin', 'Administration', '9876543210', true);

-- 2. FACULTY USERS
INSERT INTO users (id, email, first_name, last_name, role, department, phone, is_active)
VALUES 
('656ed74b-3c6c-4c19-8865-a38b5cc373b4', 'dr.patil@campus.com', 'Rajesh', 'Patil', 'faculty', 'Computer Science', '9876543211', true),
('756ed74b-3c6c-4c19-8865-a38b5cc373b5', 'dr.kumar@campus.com', 'Amit', 'Kumar', 'faculty', 'Computer Science', '9876543212', true),
('856ed74b-3c6c-4c19-8865-a38b5cc373b6', 'dr.shah@campus.com', 'Priya', 'Shah', 'faculty', 'Mathematics', '9876543213', true);

-- 3. STUDENT USERS
INSERT INTO users (id, email, first_name, last_name, role, department, phone, is_active)
VALUES 
('956ed74b-3c6c-4c19-8865-a38b5cc373b7', 'rahul.sharma@campus.edu', 'Rahul', 'Sharma', 'student', 'Computer Science', '9876543214', true),
('a56ed74b-3c6c-4c19-8865-a38b5cc373b8', 'priya.patel@campus.edu', 'Priya', 'Patel', 'student', 'Computer Science', '9876543215', true),
('b56ed74b-3c6c-4c19-8865-a38b5cc373b9', 'amit.verma@campus.edu', 'Amit', 'Verma', 'student', 'Computer Science', '9876543216', true);

-- Faculty Details
INSERT INTO faculty_details (user_id, employee_id, qualification, specialization, experience_years)
VALUES 
('656ed74b-3c6c-4c19-8865-a38b5cc373b4', 'FAC001', 'Ph.D. Computer Science', 'Artificial Intelligence', 10),
('756ed74b-3c6c-4c19-8865-a38b5cc373b5', 'FAC002', 'M.Tech Computer Science', 'Data Structures', 8),
('856ed74b-3c6c-4c19-8865-a38b5cc373b6', 'FAC003', 'Ph.D. Mathematics', 'Applied Mathematics', 12);

-- Student Details
INSERT INTO student_details (user_id, enrollment_number, current_semester, batch_year, cgpa)
VALUES 
('956ed74b-3c6c-4c19-8865-a38b5cc373b7', 'CS2024001', 1, 2024, 8.5),
('a56ed74b-3c6c-4c19-8865-a38b5cc373b8', 'CS2024002', 1, 2024, 9.0),
('b56ed74b-3c6c-4c19-8865-a38b5cc373b9', 'CS2024003', 1, 2024, 7.8);

-- ============================================================
-- INSERT SAMPLE COURSES
-- ============================================================

INSERT INTO courses (id, course_code, course_name, department, semester, credits, is_active)
VALUES 
('c56ed74b-3c6c-4c19-8865-a38b5cc373c1', 'CS101', 'Introduction to Programming', 'Computer Science', 1, 4, true),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c2', 'CS102', 'Data Structures', 'Computer Science', 1, 4, true),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c3', 'MA101', 'Calculus I', 'Mathematics', 1, 4, true),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c4', 'CS201', 'Algorithms', 'Computer Science', 2, 4, true),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c5', 'CS202', 'Database Systems', 'Computer Science', 2, 4, true);

-- Course Assignments (Faculty to Courses)
INSERT INTO course_assignments (course_id, faculty_id, academic_year, semester_type)
VALUES 
('c56ed74b-3c6c-4c19-8865-a38b5cc373c1', '656ed74b-3c6c-4c19-8865-a38b5cc373b4', '2025-26', 'Winter'),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c2', '756ed74b-3c6c-4c19-8865-a38b5cc373b5', '2025-26', 'Winter'),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c3', '856ed74b-3c6c-4c19-8865-a38b5cc373b6', '2025-26', 'Winter');

-- Student Enrollments
INSERT INTO student_enrollments (student_id, course_id, academic_year, semester_type)
VALUES 
('956ed74b-3c6c-4c19-8865-a38b5cc373b7', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c1', '2025-26', 'Winter'),
('956ed74b-3c6c-4c19-8865-a38b5cc373b7', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c2', '2025-26', 'Winter'),
('956ed74b-3c6c-4c19-8865-a38b5cc373b7', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c3', '2025-26', 'Winter'),
('a56ed74b-3c6c-4c19-8865-a38b5cc373b8', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c1', '2025-26', 'Winter'),
('a56ed74b-3c6c-4c19-8865-a38b5cc373b8', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c2', '2025-26', 'Winter'),
('b56ed74b-3c6c-4c19-8865-a38b5cc373b9', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c1', '2025-26', 'Winter');

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT '✅ Database setup complete!' as message;
SELECT '✅ You can now login with these credentials:' as info;
SELECT '' as blank;
SELECT 'ADMIN:' as role, 'admin@campus.com' as email, 'admin123' as password;
SELECT 'FACULTY:' as role, 'dr.patil@campus.com' as email, 'faculty123' as password;
SELECT 'STUDENT:' as role, 'rahul.sharma@campus.edu' as email, 'student123' as password;
SELECT '' as blank2;
SELECT 'Total Users:' as stat, COUNT(*) as count FROM users;
SELECT 'Total Courses:' as stat, COUNT(*) as count FROM courses;
SELECT 'Total Enrollments:' as stat, COUNT(*) as count FROM student_enrollments;
