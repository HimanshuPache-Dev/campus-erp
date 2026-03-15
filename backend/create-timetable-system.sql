-- Create Timetable System for Campus ERP

-- 1. Create timetable_slots table
CREATE TABLE IF NOT EXISTS timetable_slots (
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

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_timetable_course ON timetable_slots(course_id);
CREATE INDEX IF NOT EXISTS idx_timetable_faculty ON timetable_slots(faculty_id);
CREATE INDEX IF NOT EXISTS idx_timetable_day ON timetable_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_timetable_semester ON timetable_slots(semester);
CREATE INDEX IF NOT EXISTS idx_timetable_active ON timetable_slots(is_active);

-- 3. Add semester_type to student_details if not exists
ALTER TABLE student_details ADD COLUMN IF NOT EXISTS semester_type VARCHAR(20) DEFAULT 'Winter';

-- 4. Disable RLS
ALTER TABLE timetable_slots DISABLE ROW LEVEL SECURITY;

-- 5. Grant permissions
GRANT ALL ON timetable_slots TO service_role;
GRANT ALL ON timetable_slots TO authenticated;

-- 6. Sample data (optional)
-- INSERT INTO timetable_slots (course_id, faculty_id, day_of_week, start_time, end_time, room_number, semester, academic_year, semester_type)
-- SELECT 
--   c.id,
--   ca.faculty_id,
--   'Monday',
--   '09:00:00',
--   '10:00:00',
--   'Room 101',
--   c.semester,
--   '2025-26',
--   'Winter'
-- FROM courses c
-- JOIN course_assignments ca ON c.id = ca.course_id
-- WHERE c.is_active = true
-- LIMIT 5;

SELECT '✅ Timetable system created successfully!' as message;
SELECT 'Run this SQL in Supabase to create the timetable system' as instruction;
