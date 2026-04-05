# Update Supabase Credentials

After creating your new Supabase project, update these files:

## 1. Frontend Environment File
**File**: `campus-erp/frontend/.env`

Replace with your new credentials:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
VITE_API_URL=http://localhost:3000/api
```

## 2. Vercel Environment Variables
Go to your Vercel project → Settings → Environment Variables

Add/Update:
- `VITE_SUPABASE_URL` = `https://YOUR_PROJECT_ID.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `YOUR_ANON_KEY_HERE`

## 3. Run SQL Scripts in Supabase

### Step A: Setup Database Tables and Users
1. Go to your Supabase dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy the entire content from `campus-erp/backend/COMPLETE_SETUP_WITH_USERS.sql`
5. Paste and click "Run"
6. Wait for success message

### Step B: Setup Timetable System
1. In SQL Editor, click "New query" again
2. Copy the entire content from `campus-erp/backend/create-timetable-system.sql`
3. Paste and click "Run"
4. Wait for success message

## 4. Test Login

After running the SQL scripts, you can login with:

**Admin:**
- Email: `admin@campus.com`
- Password: `admin123`

**Faculty:**
- Email: `dr.patil@campus.com`
- Password: `faculty123`

**Student:**
- Email: `rahul.sharma@campus.edu`
- Password: `student123`

## 5. Deploy

After updating credentials:

```bash
cd campus-erp
git add frontend/.env
git commit -m "Update Supabase credentials"
git push origin master
```

Vercel will auto-deploy with the new settings!

## Quick Checklist

- [ ] Created new Supabase project
- [ ] Copied Project URL and anon key
- [ ] Updated `frontend/.env` file
- [ ] Updated Vercel environment variables
- [ ] Ran COMPLETE_SETUP_WITH_USERS.sql in Supabase
- [ ] Ran create-timetable-system.sql in Supabase
- [ ] Tested login with admin@campus.com
- [ ] Pushed changes to GitHub
- [ ] Verified Vercel deployment

## Need Help?

If you get stuck:
1. Check Supabase SQL Editor for error messages
2. Verify environment variables are correct
3. Check browser console for connection errors
4. Make sure you're using the correct login credentials
