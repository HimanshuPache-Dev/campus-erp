-- ============================================================
-- ADD PASSWORD RESET REQUIRED FIELD
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add password_reset_required column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT false;

-- Add temporary_password column to store the temp password (optional)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS temporary_password VARCHAR(255);

-- Set existing students and faculty to require password reset
UPDATE users 
SET password_reset_required = true 
WHERE role IN ('student', 'faculty');

-- Verify the change
SELECT '✅ password_reset_required column added successfully!' as message;
SELECT '' as blank;
SELECT 'Users requiring password reset:' as info;
SELECT 
  email,
  role,
  password_reset_required
FROM users
WHERE password_reset_required = true
ORDER BY role, email;
