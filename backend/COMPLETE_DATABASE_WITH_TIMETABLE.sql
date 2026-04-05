-- ============================================================
-- COMPLETE DATABASE SETUP - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop all existing tables
DROP TABLE IF EXISTS timetable_slots CASCADE;
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

-- ==================== CREATE TABLES ====================

-- Users table
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

-- Student details
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

-- Faculty details
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

-- Courses
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

-- Course assignments
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

-- Student enrollments
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

-- Attendance
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

-- Results
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

-- Fees
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

-- Notifications
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

-- Timetable slots
CREATE TABLE timetable_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number VARCHAR(50),
  semester INTEGER NOT NULL,
  academic_year VARCHAR(10) NOT NULL,
  semester_type VARCHAR(20) NOT NULL CHECK (semester_type IN ('Winter', 'Summer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(day_of_week, start_time, room_number, academic_year, semester_type)
);

-- ==================== CREATE INDEXES ====================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_student_details_user ON student_details(user_id);
CREATE INDEX idx_faculty_details_user ON faculty_details(user_id);
CREATE INDEX idx_courses_department ON courses(department);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_results_student ON results(student_id);
CREATE INDEX idx_fees_student ON fees(student_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_timetable_course ON timetable_slots(course_id);
CREATE INDEX idx_timetable_faculty ON timetable_slots(faculty_id);
CREATE INDEX idx_timetable_day ON timetable_slots(day_of_week);

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
ALTER TABLE timetable_slots DISABLE ROW LEVEL SECURITY;

-- ==================== GRANT PERMISSIONS ====================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;

-- ==================== INSERT SAMPLE DATA ====================

-- Insert users
INSERT INTO users (id, email, first_name, last_name, role, department, phone, is_active)
VALUES 
('b84221c5-894d-4b3a-b5bf-c680ce994218', 'admin@campus.com', 'Admin', 'User', 'admin', 'Administration', '9876543210', true),
('656ed74b-3c6c-4c19-8865-a38b5cc373b4', 'dr.patil@campus.com', 'Rajesh', 'Patil', 'faculty', 'Computer Science', '9876543211', true),
('756ed74b-3c6c-4c19-8865-a38b5cc373b5', 'dr.kumar@campus.com', 'Amit', 'Kumar', 'faculty', 'Computer Science', '9876543212', true),
('856ed74b-3c6c-4c19-8865-a38b5cc373b6', 'dr.shah@campus.com', 'Priya', 'Shah', 'faculty', 'Mathematics', '9876543213', true),
('956ed74b-3c6c-4c19-8865-a38b5cc373b7', 'rahul.sharma@campus.edu', 'Rahul', 'Sharma', 'student', 'Computer Science', '9876543214', true),
('a56ed74b-3c6c-4c19-8865-a38b5cc373b8', 'priya.patel@campus.edu', 'Priya', 'Patel', 'student', 'Computer Science', '9876543215', true),
('b56ed74b-3c6c-4c19-8865-a38b5cc373b9', 'amit.verma@campus.edu', 'Amit', 'Verma', 'student', 'Computer Science', '9876543216', true);

-- Insert faculty details
INSERT INTO faculty_details (user_id, employee_id, qualification, specialization, experience_years)
VALUES 
('656ed74b-3c6c-4c19-8865-a38b5cc373b4', 'FAC001', 'Ph.D. Computer Science', 'Artificial Intelligence', 10),
('756ed74b-3c6c-4c19-8865-a38b5cc373b5', 'FAC002', 'M.Tech Computer Science', 'Data Structures', 8),
('856ed74b-3c6c-4c19-8865-a38b5cc373b6', 'FAC003', 'Ph.D. Mathematics', 'Applied Mathematics', 12);

-- Insert student details
INSERT INTO student_details (user_id, enrollment_number, current_semester, batch_year, cgpa)
VALUES 
('956ed74b-3c6c-4c19-8865-a38b5cc373b7', 'CS2024001', 1, 2024, 8.5),
('a56ed74b-3c6c-4c19-8865-a38b5cc373b8', 'CS2024002', 1, 2024, 9.0),
('b56ed74b-3c6c-4c19-8865-a38b5cc373b9', 'CS2024003', 1, 2024, 7.8);

-- Insert courses
INSERT INTO courses (id, course_code, course_name, department, semester, credits, is_active)
VALUES 
('c56ed74b-3c6c-4c19-8865-a38b5cc373c1', 'CS101', 'Introduction to Programming', 'Computer Science', 1, 4, true),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c2', 'CS102', 'Data Structures', 'Computer Science', 1, 4, true),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c3', 'MA101', 'Calculus I', 'Mathematics', 1, 4, true),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c4', 'CS201', 'Algorithms', 'Computer Science', 2, 4, true),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c5', 'CS202', 'Database Systems', 'Computer Science', 2, 4, true);

-- Insert course assignments
INSERT INTO course_assignments (course_id, faculty_id, academic_year, semester_type)
VALUES 
('c56ed74b-3c6c-4c19-8865-a38b5cc373c1', '656ed74b-3c6c-4c19-8865-a38b5cc373b4', '2025-26', 'Winter'),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c2', '756ed74b-3c6c-4c19-8865-a38b5cc373b5', '2025-26', 'Winter'),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c3', '856ed74b-3c6c-4c19-8865-a38b5cc373b6', '2025-26', 'Winter');

-- Insert student enrollments
INSERT INTO student_enrollments (student_id, course_id, academic_year, semester_type)
VALUES 
('956ed74b-3c6c-4c19-8865-a38b5cc373b7', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c1', '2025-26', 'Winter'),
('956ed74b-3c6c-4c19-8865-a38b5cc373b7', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c2', '2025-26', 'Winter'),
('956ed74b-3c6c-4c19-8865-a38b5cc373b7', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c3', '2025-26', 'Winter'),
('a56ed74b-3c6c-4c19-8865-a38b5cc373b8', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c1', '2025-26', 'Winter'),
('a56ed74b-3c6c-4c19-8865-a38b5cc373b8', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c2', '2025-26', 'Winter'),
('b56ed74b-3c6c-4c19-8865-a38b5cc373b9', 'c56ed74b-3c6c-4c19-8865-a38b5cc373c1', '2025-26', 'Winter');

-- Insert sample fees
INSERT INTO fees (student_id, fee_type, amount, due_date, status, academic_year, semester_type)
VALUES 
-- Rahul Sharma fees
('956ed74b-3c6c-4c19-8865-a38b5cc373b7', 'Tuition Fee', 48000, '2026-05-01', 'pending', '2025-26', 'Winter'),
('956ed74b-3c6c-4c19-8865-a38b5cc373b7', 'Library Fee', 2000, '2026-05-01', 'paid', '2025-26', 'Winter'),
('956ed74b-3c6c-4c19-8865-a38b5cc373b7', 'Lab Fee', 5000, '2026-05-01', 'pending', '2025-26', 'Winter'),
-- Priya Patel fees
('a56ed74b-3c6c-4c19-8865-a38b5cc373b8', 'Tuition Fee', 48000, '2026-05-01', 'paid', '2025-26', 'Winter'),
('a56ed74b-3c6c-4c19-8865-a38b5cc373b8', 'Library Fee', 2000, '2026-05-01', 'paid', '2025-26', 'Winter'),
('a56ed74b-3c6c-4c19-8865-a38b5cc373b8', 'Lab Fee', 5000, '2026-05-01', 'paid', '2025-26', 'Winter'),
-- Amit Verma fees
('b56ed74b-3c6c-4c19-8865-a38b5cc373b9', 'Tuition Fee', 48000, '2026-04-15', 'overdue', '2025-26', 'Winter'),
('b56ed74b-3c6c-4c19-8865-a38b5cc373b9', 'Library Fee', 2000, '2026-04-15', 'overdue', '2025-26', 'Winter');

-- Insert timetable slots
INSERT INTO timetable_slots (course_id, faculty_id, day_of_week, start_time, end_time, room_number, semester, academic_year, semester_type)
VALUES 
('c56ed74b-3c6c-4c19-8865-a38b5cc373c1', '656ed74b-3c6c-4c19-8865-a38b5cc373b4', 'Monday', '09:00:00', '10:00:00', 'Room 101', 1, '2025-26', 'Winter'),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c1', '656ed74b-3c6c-4c19-8865-a38b5cc373b4', 'Wednesday', '09:00:00', '10:00:00', 'Room 101', 1, '2025-26', 'Winter'),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c1', '656ed74b-3c6c-4c19-8865-a38b5cc373b4', 'Friday', '09:00:00', '10:00:00', 'Room 101', 1, '2025-26', 'Winter'),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c2', '756ed74b-3c6c-4c19-8865-a38b5cc373b5', 'Tuesday', '10:00:00', '11:00:00', 'Room 102', 1, '2025-26', 'Winter'),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c2', '756ed74b-3c6c-4c19-8865-a38b5cc373b5', 'Thursday', '10:00:00', '11:00:00', 'Room 102', 1, '2025-26', 'Winter'),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c3', '856ed74b-3c6c-4c19-8865-a38b5cc373b6', 'Monday', '11:00:00', '12:00:00', 'Room 103', 1, '2025-26', 'Winter'),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c3', '856ed74b-3c6c-4c19-8865-a38b5cc373b6', 'Wednesday', '11:00:00', '12:00:00', 'Room 103', 1, '2025-26', 'Winter'),
('c56ed74b-3c6c-4c19-8865-a38b5cc373c3', '856ed74b-3c6c-4c19-8865-a38b5cc373b6', 'Friday', '11:00:00', '12:00:00', 'Room 103', 1, '2025-26', 'Winter');

-- ==================== VERIFICATION ====================
SELECT '✅ Database setup complete!' as message;
SELECT '' as blank;
SELECT 'LOGIN CREDENTIALS:' as info;
SELECT 'Admin: admin@campus.com / admin123' as credentials;
SELECT 'Faculty: dr.patil@campus.com / faculty123' as credentials;
SELECT 'Student: rahul.sharma@campus.edu / student123' as credentials;
SELECT '' as blank2;
SELECT 'STATISTICS:' as stats;
SELECT 'Users: ' || COUNT(*) as count FROM users;
SELECT 'Courses: ' || COUNT(*) as count FROM courses;
SELECT 'Fees: ' || COUNT(*) as count FROM fees;
SELECT 'Timetable Slots: ' || COUNT(*) as count FROM timetable_slots;
