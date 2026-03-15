-- Add missing columns to make frontend work

-- Add is_active to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add status column to courses table (for exam scheduling)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS exam_date DATE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS exam_time TIME;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS exam_duration INTEGER;

-- Update existing courses to be active
UPDATE courses SET is_active = true WHERE is_active IS NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

SELECT '✅ Missing columns added successfully!' as message;
