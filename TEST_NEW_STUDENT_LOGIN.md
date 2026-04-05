# 🧪 Testing New Student Login with Temporary Password

## Issue
Student cannot login with temporary password after being added by admin.

## Root Cause Analysis

The issue could be one of these:

1. ❌ Database migration not run (columns don't exist)
2. ❌ Temporary password not saved to database
3. ❌ Password validation logic not checking temporary_password
4. ❌ Typo in temporary password

## Solution Applied

### 1. Improved Password Validation Logic ✅

Updated `AuthContext.jsx` to:
- Check `temporary_password` field first for new users
- Add detailed console logging
- Fallback to default passwords if needed

### 2. Better Debugging ✅

Added console logs to show:
- Whether user has `password_reset_required` flag
- Whether `temporary_password` exists
- Which password validation path is used

## Testing Steps

### Step 1: Run Database Migration

**IMPORTANT**: You must run this SQL in Supabase first!

```sql
-- In Supabase SQL Editor, run:
-- campus-erp/backend/add-password-reset-required.sql

-- Or copy this:
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT false;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS temporary_password VARCHAR(255);
```

### Step 2: Add a Test Student

1. Login as admin (admin@campus.com / admin123)
2. Go to Students → Add Student
3. Fill in ONLY required fields:
   - Enrollment Number: `TEST001`
   - Roll Number: `101`
   - First Name: `Test`
   - Last Name: `Student`
   - Date of Birth: Any date
   - Email: `test.student@campus.edu`
   - Phone: `9999999999`
   - Father Name: `Test Father`
   - Father Phone: `8888888888`
   - Mother Name: `Test Mother`
   - Mother Phone: `7777777777`
4. Click "Save Student"
5. **COPY THE TEMPORARY PASSWORD** from the toast (you have 15 seconds!)
   - Example: `Xy7$aB9#mK2p`

### Step 3: Test Login

1. Logout from admin
2. Go to login page
3. Enter:
   - Email: `test.student@campus.edu`
   - Password: [paste the temporary password you copied]
4. Click Login

### Step 4: Check Console Logs

Open browser console (F12) and look for:

```
📝 Login attempt for: test.student@campus.edu
✅ User authenticated: {email: "test.student@campus.edu", ...}
🔐 Password validation: {
  password_reset_required: true,
  has_password_hash: true,
  has_temporary_password: true,
  role: "student"
}
✓ Temporary password matched
🔒 Password reset required for user
```

### Expected Results

✅ **Success Path:**
1. Login accepted
2. Toast: "Please change your password to continue"
3. Redirected to `/change-password` page
4. Can create new password
5. After password change, redirected to `/login`
6. Login with new password → goes to `/student/dashboard`

❌ **If Login Fails:**

Check console for error messages:

**Error: "Invalid email or password"**
- Check if temporary password was copied correctly
- Check if database migration was run
- Check console logs for password validation details

**Error: "User not found"**
- Email might be wrong
- User might not be created in database
- Check Supabase users table

## Debugging Queries

Run these in Supabase SQL Editor to check:

### Check if columns exist:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('password_reset_required', 'temporary_password');
```

### Check the test student:
```sql
SELECT 
  email,
  first_name,
  last_name,
  role,
  password_reset_required,
  temporary_password,
  password_hash,
  is_active
FROM users
WHERE email = 'test.student@campus.edu';
```

### Check all students requiring password reset:
```sql
SELECT 
  email,
  first_name,
  last_name,
  password_reset_required,
  LENGTH(temporary_password) as temp_pwd_length,
  created_at
FROM users
WHERE role = 'student'
AND password_reset_required = true
ORDER BY created_at DESC;
```

## Common Issues & Solutions

### Issue 1: "Invalid email or password"

**Cause**: Temporary password doesn't match

**Solution**:
1. Check console logs for password validation details
2. Verify temporary password was saved in database
3. Try copying password again (no extra spaces)

### Issue 2: Columns don't exist

**Cause**: Database migration not run

**Solution**:
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT false;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS temporary_password VARCHAR(255);
```

### Issue 3: temporary_password is NULL

**Cause**: Student was created before the fix

**Solution**:
1. Delete the test student
2. Run database migration
3. Add student again

### Issue 4: Password not copied correctly

**Cause**: Clipboard issue or typo

**Solution**:
1. Check browser console for the password (it's logged there)
2. Look for: `🔑 Temporary Password: Xy7$aB9#mK2p`
3. Copy from console instead

## Manual Testing Checklist

- [ ] Database migration run in Supabase
- [ ] Columns exist (password_reset_required, temporary_password)
- [ ] Admin can add student
- [ ] Temporary password displayed in toast
- [ ] Temporary password logged in console
- [ ] Temporary password saved in database
- [ ] Student can login with temporary password
- [ ] Student redirected to change password page
- [ ] Student can create new password
- [ ] Student logged out after password change
- [ ] Student can login with new password
- [ ] Student goes to dashboard
- [ ] password_reset_required set to false
- [ ] temporary_password cleared

## Quick Fix Commands

If student still can't login, run this in Supabase to manually set a temporary password:

```sql
-- Set a known temporary password for testing
UPDATE users 
SET 
  password_reset_required = true,
  temporary_password = 'Test@123'
WHERE email = 'test.student@campus.edu';

-- Now try logging in with: Test@123
```

## Success Indicators

When everything works, you should see:

1. ✅ Toast: "Student added successfully!"
2. ✅ Temporary password displayed
3. ✅ Password copied to clipboard
4. ✅ Console shows password
5. ✅ Student can login
6. ✅ Redirected to change password
7. ✅ Can set new password
8. ✅ Can login with new password
9. ✅ Access to student dashboard

---

**Last Updated**: April 6, 2026
**Status**: Ready for Testing
