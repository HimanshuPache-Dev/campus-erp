-- ============================================================
-- CREATE ALL TABLES - SIMPLE VERSION
-- Run this FIRST in Supabase SQL Editor
-- ============================================================

-- This script creates all necessary tables if they don't exist

-- 1. USERS TABLE (already exists, just add columns)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS temporary_password VARCHAR(255);

-- 2. STUDENT DETAILS TABLE
CREATE TABLE IF NOT EXISTS student_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  enrollment_number VARCHAR(50) UNIQUE,
  current_semester INTEGER,
  batch_year INTEGER,
  guardian_name VARCHAR(255),
  guardian_phone VARCHAR(20),
  guardian_email VARCHAR(255),
  admission_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  semester INTEGER,
  credits INTEGER DEFAULT 3,
  faculty_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. STUDENT ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- 5. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'present',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, course_id, date)
);

-- 6. RESULTS TABLE
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  exam_type VARCHAR(50),
  marks_obtained DECIMAL(5,2),
  total_marks DECIMAL(5,2),
  grade VARCHAR(5),
  semester_type VARCHAR(20),
  academic_year VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. FEES TABLE
CREATE TABLE IF NOT EXISTS fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  academic_year VARCHAR(10),
  semester INTEGER,
  total_amount DECIMAL(10,2),
  amount_paid DECIMAL(10,2) DEFAULT 0,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending',
  payment_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. TIMETABLE TABLE
CREATE TABLE IF NOT EXISTS timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Disable RLS on all tables for now
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE results DISABLE ROW LEVEL SECURITY;
ALTER TABLE fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE timetable DISABLE ROW LEVEL SECURITY;

-- Fix admin
UPDATE users SET password_reset_required = false WHERE role = 'admin';

-- Verify tables created
SELECT '✅ ALL TABLES CREATED!' as message;
SELECT '' as blank;
SELECT 'Tables in database:' as info;
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
  'users', 'student_details', 'courses', 'student_enrollments',
  'attendance', 'results', 'fees', 'notifications', 'timetable'
)
ORDER BY tablename;
