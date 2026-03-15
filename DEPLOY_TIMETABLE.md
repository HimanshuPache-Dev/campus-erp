# 🚀 Deploy Timetable Feature - Quick Guide

## Step 1: Run SQL in Supabase (REQUIRED)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire content from: `campus-erp/backend/create-timetable-system.sql`
5. Paste it into the SQL editor
6. Click "Run" button
7. You should see: "✅ Timetable system created successfully!"

## Step 2: Deploy Frontend to Netlify

### Option A: Auto Deploy (Recommended)
If you have Netlify connected to your GitHub repo:
1. Commit and push your changes:
```bash
cd campus-erp
git add .
git commit -m "Add timetable management system"
git push origin main
```
2. Netlify will automatically deploy (takes 2-3 minutes)
3. Check deployment status at: https://app.netlify.com

### Option B: Manual Deploy
If auto-deploy is not set up:
1. Build the frontend:
```bash
cd campus-erp/frontend
npm run build
```
2. Go to Netlify dashboard
3. Drag and drop the `dist` folder to deploy

## Step 3: Test the Features

### Test as Admin:
1. Login: `admin@campus.com` / `admin123`
2. Click "Timetable" in sidebar (new link!)
3. Select Semester 1
4. Click "Add Slot" button
5. Fill the form:
   - Course: Select any course
   - Faculty: Select any faculty
   - Day: Monday
   - Start Time: 09:00
   - End Time: 10:00
   - Room: Room 101
6. Click "Add Slot"
7. Verify it appears in the weekly grid

### Test as Student:
1. Login: `rahul.sharma@campus.edu` / `student123`
2. Go to "Timetable"
3. You should see the timetable in a weekly grid
4. If empty, admin needs to create slots first

### Test as Faculty:
1. Login: `dr.patil@campus.com` / `faculty123`
2. Go to "Schedule"
3. You should see your teaching schedule
4. If empty, admin needs to assign classes to you

## Step 4: Add Sample Data (Optional)

If you want to quickly populate the timetable:

```sql
-- Run this in Supabase SQL Editor
-- This will create 5 sample timetable slots

INSERT INTO timetable_slots (course_id, faculty_id, day_of_week, start_time, end_time, room_number, semester, academic_year, semester_type)
SELECT 
  c.id,
  ca.faculty_id,
  CASE (ROW_NUMBER() OVER ()) % 5
    WHEN 0 THEN 'Monday'
    WHEN 1 THEN 'Tuesday'
    WHEN 2 THEN 'Wednesday'
    WHEN 3 THEN 'Thursday'
    ELSE 'Friday'
  END,
  '09:00:00',
  '10:00:00',
  'Room ' || (100 + (ROW_NUMBER() OVER ()) % 10),
  c.semester,
  '2025-26',
  'Winter'
FROM courses c
JOIN course_assignments ca ON c.id = ca.course_id
WHERE c.is_active = true
LIMIT 5;
```

## Troubleshooting

### Issue: "Table timetable_slots does not exist"
**Solution:** Run the SQL script from Step 1

### Issue: "No timetable available" for students
**Solution:** 
1. Make sure student is enrolled in courses
2. Make sure admin has created timetable slots for those courses
3. Check that semester matches

### Issue: "No schedule available" for faculty
**Solution:**
1. Make sure faculty is assigned to courses (course_assignments table)
2. Make sure admin has created timetable slots with this faculty

### Issue: Timetable link not showing in admin sidebar
**Solution:** Clear browser cache and refresh

## What's New

✅ Admin can create/edit/delete timetable slots
✅ Students see personalized weekly timetable
✅ Faculty see their teaching schedule
✅ New "Timetable" link in admin sidebar
✅ Weekly grid view with time slots
✅ Room numbers and faculty names displayed
✅ Semester filtering

## Files Changed

- `campus-erp/frontend/src/pages/admin/ManageTimetable.jsx` (NEW)
- `campus-erp/frontend/src/pages/student/Timetable.jsx` (UPDATED)
- `campus-erp/frontend/src/pages/faculty/Schedule.jsx` (UPDATED)
- `campus-erp/frontend/src/App.jsx` (UPDATED - added route)
- `campus-erp/frontend/src/components/admin/Sidebar.jsx` (UPDATED - added link)
- `campus-erp/backend/create-timetable-system.sql` (NEW)

## Current Deployment

- Frontend: https://69b6a7c5bdba1f8fdbbbd076--campus-erp1.netlify.app
- Database: Supabase (https://ojdxczneqaxbbvjdehro.supabase.co)

## Next Steps After Deployment

1. ✅ Run SQL script
2. ✅ Deploy frontend
3. ✅ Test all three roles
4. ✅ Create sample timetable data
5. Share the link with users!

---

**Estimated Time:** 5-10 minutes
**Difficulty:** Easy
**Status:** Ready to deploy! 🚀
