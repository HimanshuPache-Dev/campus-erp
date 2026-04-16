# 🔔 Notification Error Fix

## Error
```
Could not find the 'sender_id' column of 'notifications' in the schema cache
```

## Quick Fix

### Option 1: Add sender_id Column (Recommended)
Run this in Supabase SQL Editor:

```sql
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES users(id);
```

### Option 2: Ignore Notification Errors
The notifications are not critical. The app will work fine, you'll just see these errors in console. You can ignore them for now.

## What's Happening?
The code is trying to send notifications with a `sender_id` field, but your notifications table doesn't have that column yet.

## After Adding Column
1. Run the SQL above in Supabase
2. Refresh your browser (Ctrl + R)
3. Notifications will work! ✅

## If You Don't Want to Fix Now
The app works fine without notifications. Just ignore the console errors. Everything else (students, faculty, courses, timetable) works perfectly! 🚀
