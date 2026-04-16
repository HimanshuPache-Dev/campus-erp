-- Fix notifications table - remove sender_id column references

-- Check current notifications table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications';

-- If sender_id doesn't exist and you need it, add it:
-- ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES users(id);

-- If sender_id exists but shouldn't be used, the frontend code needs to be updated
-- to not include sender_id in inserts

-- For now, the notifications table should have these columns:
-- - id (uuid, primary key)
-- - user_id (uuid, references users)
-- - title (text)
-- - message (text)
-- - type (text)
-- - priority (text)
-- - is_read (boolean)
-- - created_at (timestamp)

-- If you want to add sender_id for tracking who sent the notification:
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES users(id);

-- Update existing notifications to have a default sender (admin)
UPDATE notifications 
SET sender_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
WHERE sender_id IS NULL;
