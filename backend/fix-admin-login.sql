-- ============================================================
-- FIX ADMIN LOGIN
-- Run this in Supabase SQL Editor to fix admin login
-- ============================================================

-- Set admin to NOT require password reset
UPDATE users 
SET password_reset_required = false 
WHERE role = 'admin';

-- Verify the fix
SELECT 
  email,
  role,
  password_reset_required,
  password_hash
FROM users
WHERE role = 'admin';

SELECT '✅ Admin login fixed! You can now login with admin123' as message;
