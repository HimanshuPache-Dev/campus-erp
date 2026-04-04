-- Fix Notifications Table Schema
-- Run this in Supabase SQL Editor

-- 1. Drop existing notifications table if it exists (to start fresh)
DROP TABLE IF EXISTS notifications CASCADE;

-- 2. Create notifications table with correct schema
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

-- 3. Add indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- 4. Disable RLS (Row Level Security)
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 5. Grant permissions
GRANT ALL ON notifications TO service_role;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notifications TO anon;

-- 6. Insert sample notifications for testing
INSERT INTO notifications (user_id, title, message, type, priority, is_read)
SELECT 
  u.id,
  'Welcome to Campus ERP',
  'Welcome to the Campus ERP system. You can view your notifications here.',
  'info',
  'normal',
  false
FROM users u
WHERE u.is_active = true
LIMIT 10;

SELECT '✅ Notifications table created successfully!' as message;
SELECT 'Sample notifications have been added for testing' as info;
