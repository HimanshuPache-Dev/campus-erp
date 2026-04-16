-- Create student_enrollments table for course assignments

-- Drop table if exists (optional - remove this line if you want to keep existing data)
-- DROP TABLE IF EXISTS student_enrollments;

-- Create student_enrollments table
CREATE TABLE IF NOT EXISTS student_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'dropped')),
    grade TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a student can't be enrolled in the same course twice
    UNIQUE(student_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_enrollments_student_id ON student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_course_id ON student_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_student_enrollments_status ON student_enrollments(status);

-- Enable Row Level Security (RLS)
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own enrollments" ON student_enrollments
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all enrollments" ON student_enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert enrollments" ON student_enrollments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update enrollments" ON student_enrollments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete enrollments" ON student_enrollments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Insert some sample enrollments (optional)
-- This will enroll students in courses based on their semester and department
INSERT INTO student_enrollments (student_id, course_id, enrollment_date, status)
SELECT 
    u.id as student_id,
    c.id as course_id,
    CURRENT_DATE as enrollment_date,
    'active' as status
FROM users u
CROSS JOIN courses c
JOIN student_details sd ON sd.user_id = u.id
WHERE u.role = 'student' 
    AND u.is_active = true
    AND c.semester = sd.current_semester
    AND c.department = u.department
ON CONFLICT (student_id, course_id) DO NOTHING;

-- Verify the table was created
SELECT 
    'student_enrollments table created successfully' as message,
    COUNT(*) as total_enrollments
FROM student_enrollments;