-- Fix All Database Tables - Run this in Supabase SQL Editor
-- This fixes notifications and fees tables to match the frontend code

-- ============================================
-- 1. FIX NOTIFICATIONS TABLE
-- ============================================

-- Drop existing notifications table if it exists
DROP TABLE IF EXISTS notifications CASCADE;

-- Create notifications table with correct schema
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

-- Add indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Disable RLS
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON notifications TO service_role;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO anon;

-- ============================================
-- 2. FIX FEES TABLE (if needed)
-- ============================================

-- Check if fees table exists and has correct columns
DO $$ 
BEGIN
  -- Add status column if it doesn't exist (rename from payment_status if needed)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fees' AND column_name = 'payment_status'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fees' AND column_name = 'status'
  ) THEN
    ALTER TABLE fees RENAME COLUMN payment_status TO status;
  END IF;

  -- Add status column if it doesn't exist at all
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fees' AND column_name = 'status'
  ) THEN
    ALTER TABLE fees ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
  END IF;

  -- Add amount_paid column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'fees' AND column_name = 'amount_paid'
  ) THEN
    ALTER TABLE fees ADD COLUMN amount_paid DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- 3. INSERT SAMPLE NOTIFICATIONS
-- ============================================

-- Insert welcome notifications for all active users
INSERT INTO notifications (user_id, title, message, type, priority, is_read)
SELECT 
  u.id,
  'Welcome to Campus ERP',
  CASE 
    WHEN u.role = 'admin' THEN 'Welcome to the admin dashboard. You can manage students, faculty, courses, and more from here.'
    WHEN u.role = 'faculty' THEN 'Welcome to the faculty portal. You can manage your courses, attendance, and results here.'
    WHEN u.role = 'student' THEN 'Welcome to the student portal. You can view your courses, attendance, results, and fees here.'
    ELSE 'Welcome to Campus ERP system.'
  END,
  'info',
  'normal',
  false
FROM users u
WHERE u.is_active = true
ON CONFLICT DO NOTHING;

-- Insert a few more sample notifications
INSERT INTO notifications (user_id, title, message, type, priority, is_read)
SELECT 
  u.id,
  'System Update',
  'The timetable system has been updated. Check your schedule for the latest changes.',
  'info',
  'normal',
  false
FROM users u
WHERE u.role IN ('student', 'faculty') AND u.is_active = true
LIMIT 20
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. VERIFICATION
-- ============================================

-- Show table structures
SELECT 
  '✅ Notifications table structure:' as message,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

SELECT 
  '✅ Fees table structure:' as message,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'fees'
ORDER BY ordinal_position;

-- Show counts
SELECT 
  '✅ Database Status:' as message,
  (SELECT COUNT(*) FROM notifications) as total_notifications,
  (SELECT COUNT(*) FROM fees) as total_fees,
  (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users;

SELECT '✅ All tables fixed successfully!' as final_message;
