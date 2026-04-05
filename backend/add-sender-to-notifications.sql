-- ============================================================
-- ADD SENDER_ID TO NOTIFICATIONS TABLE
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add sender_id column to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);

-- Update existing notifications to have sender_id
-- (Set admin as sender for existing notifications)
UPDATE notifications 
SET sender_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
WHERE sender_id IS NULL;

-- Verify the change
SELECT '✅ sender_id column added successfully!' as message;
SELECT '' as blank;
SELECT 'Sample notifications with sender:' as info;
SELECT 
  n.id,
  n.title,
  sender.first_name || ' ' || sender.last_name as sender_name,
  recipient.first_name || ' ' || recipient.last_name as recipient_name,
  n.created_at
FROM notifications n
LEFT JOIN users sender ON n.sender_id = sender.id
LEFT JOIN users recipient ON n.user_id = recipient.id
ORDER BY n.created_at DESC
LIMIT 5;
