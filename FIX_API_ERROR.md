# Fix API Connection Error

## Problem
You're seeing this error:
```
localhost:3000/api/students:1 Failed to load resource: net::ERR_CONNECTION_REFUSED
```

## Root Cause
The code is **already correct** and uses Supabase directly (no API calls). The error is caused by **browser cache** or **build cache** showing old code.

## Solution

### Step 1: Clear Browser Cache
1. Open your browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload" (or press Ctrl+Shift+R)

### Step 2: Clear Build Cache and Restart Dev Server
```bash
cd campus-erp/frontend
npm run dev -- --force
```

Or manually:
```bash
cd campus-erp/frontend
rm -rf node_modules/.vite
rm -rf dist
npm run dev
```

### Step 3: Verify the Fix
1. Open browser in Incognito/Private mode
2. Go to http://localhost:5173 (or your dev server URL)
3. Try adding a student
4. Should work without API errors

## What Was Fixed
The AddStudent.jsx file (lines 406-550) already contains the correct Supabase code:
- ✅ Imports `supabase` from config
- ✅ Uses `supabase.from('users').insert()` 
- ✅ No API service imports
- ✅ No fetch() calls to localhost:3000

## If Still Not Working
1. Check if dev server is running on correct port
2. Check browser console for the actual file being loaded
3. Try a different browser
4. Clear all browser data for localhost

## Next Steps After Fix
Once the student is added successfully:
1. Copy the temporary password shown (auto-copied to clipboard)
2. Student can login with their email and temporary password
3. They will be redirected to change password
4. After changing password, they can access their dashboard
