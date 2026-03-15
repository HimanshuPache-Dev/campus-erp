# Campus ERP - Testing Guide

## 🚀 Servers Running

### Frontend Dev Server
- **URL:** http://localhost:5173
- **Status:** ✅ Running
- **Command:** `npm run dev` (in `campus-erp/frontend`)

### Backend Server
- **URL:** http://localhost:3000
- **Status:** ✅ Running
- **Command:** `npm start` (in `campus-erp/backend`)

---

## 🧪 Testing the Migration

### 1. Login to the System
Navigate to: http://localhost:5173

**Test Accounts:**
- Admin: Check your database for admin users
- Faculty: Check your database for faculty users
- Student: Check your database for student users

### 2. Test Admin Pages

#### Dashboard
- URL: `/admin/dashboard`
- **What to test:**
  - Stats cards show real counts from database
  - Charts display actual data
  - Recent activity shows database records

#### Analytics
- URL: `/admin/analytics`
- **What to test:**
  - 6 charts load with real data
  - Department distribution is accurate
  - Attendance trends show actual records

#### Students
- URL: `/admin/students`
- **What to test:**
  - Student list loads from database
  - Search and filters work
  - Add student form saves to database

#### Faculty
- URL: `/admin/faculty`
- **What to test:**
  - Faculty list loads from database
  - Department filter works
  - Add faculty form saves to database

#### Courses
- URL: `/admin/courses`
- **What to test:**
  - Course list loads from database
  - Faculty assignments display correctly
  - Create course form saves to database

#### Attendance
- URL: `/admin/attendance`
- **What to test:**
  - Attendance records load from database
  - Filters by date, course, student work
  - Statistics calculate correctly

#### Results
- URL: `/admin/results`
- **What to test:**
  - Results load from database
  - Grade distribution is accurate
  - Export functionality works

#### Notifications
- URL: `/admin/notifications`
- **What to test:**
  - Notifications load from database
  - Send notification saves to database
  - Target role filtering works

### 3. Test Faculty Pages

#### Dashboard
- URL: `/faculty/dashboard`
- **What to test:**
  - Assigned courses load from database
  - Stats show real data
  - Schedule displays correctly
  - Notifications load from database

#### Students
- URL: `/faculty/students`
- **What to test:**
  - Students enrolled in faculty's courses load
  - Attendance percentages calculate correctly
  - Semester filters work (odd/even/individual)
  - Search functionality works

#### Attendance
- URL: `/faculty/attendance`
- **What to test:**
  - Student list loads for selected course
  - Mark attendance saves to database
  - Attendance history displays correctly

#### Results
- URL: `/faculty/results`
- **What to test:**
  - Student list loads for selected course
  - Enter marks saves to database
  - Grade calculation works

#### Profile
- URL: `/faculty/profile`
- **What to test:**
  - Profile data loads from database
  - Personal info displays correctly
  - Professional info displays correctly
  - Edit and save updates database

### 4. Test Student Pages

#### Dashboard
- URL: `/student/dashboard`
- **What to test:**
  - Student info loads from database
  - CGPA/SGPA calculate correctly
  - Attendance percentage is accurate
  - Pending fees display correctly
  - Charts show real data
  - Notifications load from database

#### Attendance (Partial)
- URL: `/student/attendance`
- **Status:** ⚠️ Still has hardcoded data
- **Note:** UI structure is good, can be updated later

#### Fees (Partial)
- URL: `/student/fees`
- **Status:** ⚠️ Still has hardcoded data
- **Note:** UI structure is good, can be updated later

#### Profile (Partial)
- URL: `/student/profile`
- **Status:** ⚠️ Still has hardcoded data (VIEW-ONLY)
- **Note:** Can be updated later

---

## 🔍 What to Look For

### ✅ Success Indicators
- Loading spinners appear while fetching data
- Data displays correctly after loading
- Empty states show when no data exists
- Toast notifications appear for actions
- Filters and search work correctly
- Forms save data to database
- Charts render with real data

### ❌ Error Indicators
- Console errors in browser DevTools
- "Failed to fetch" error messages
- Infinite loading spinners
- Empty pages with no data or empty state
- Toast error notifications

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch data"
**Cause:** Supabase connection issue
**Solution:**
1. Check `.env` file has correct Supabase URL and key
2. Verify Supabase project is running
3. Check browser console for specific error

### Issue 2: Empty data everywhere
**Cause:** Database has no data
**Solution:**
1. Run seed script: `node campus-erp/backend/src/seed.js`
2. Or manually add data through admin pages

### Issue 3: Login not working
**Cause:** No users in database
**Solution:**
1. Check `users` table in Supabase
2. Create test users with proper roles
3. Ensure passwords are hashed correctly

### Issue 4: Charts not displaying
**Cause:** No data or data format issue
**Solution:**
1. Check if data exists in database
2. Verify data structure matches chart expectations
3. Check browser console for errors

---

## 📊 Database Verification

### Check Data in Supabase Dashboard

1. **Users Table**
   - Should have admin, faculty, and student users
   - Check `role` column is set correctly

2. **Student Details Table**
   - Should have records for each student
   - Check `enrollment_number`, `current_semester`, `batch`

3. **Faculty Details Table**
   - Should have records for each faculty
   - Check `employee_id`, `designation`, `department`

4. **Courses Table**
   - Should have course records
   - Check `code`, `name`, `semester`, `credits`

5. **Course Assignments Table**
   - Should link faculty to courses
   - Check `faculty_id` and `course_id` foreign keys

6. **Student Enrollments Table**
   - Should link students to courses
   - Check `student_id` and `course_id` foreign keys

7. **Attendance Table**
   - Should have attendance records
   - Check `student_id`, `course_id`, `date`, `status`

8. **Results Table**
   - Should have result records
   - Check `student_id`, `course_id`, `semester`, `marks`, `grade`

9. **Fees Table**
   - Should have fee records
   - Check `student_id`, `amount`, `paid_amount`, `due_date`

10. **Notifications Table**
    - Should have notification records
    - Check `title`, `message`, `target_role`, `created_at`

---

## 🎯 Test Scenarios

### Scenario 1: Admin adds a new student
1. Login as admin
2. Go to Students page
3. Click "Add Student"
4. Fill in all required fields
5. Submit form
6. Verify student appears in list
7. Check Supabase `users` and `student_details` tables

### Scenario 2: Faculty marks attendance
1. Login as faculty
2. Go to Attendance page
3. Select a course
4. Mark students present/absent
5. Submit attendance
6. Verify attendance saved in database
7. Check student can see attendance on their dashboard

### Scenario 3: Student views dashboard
1. Login as student
2. Dashboard should load with:
   - Personal info from database
   - CGPA/SGPA calculated from results
   - Attendance percentage from attendance records
   - Pending fees from fees table
   - Recent notifications
3. Charts should display real data

### Scenario 4: Admin generates reports
1. Login as admin
2. Go to Reports page
3. Select report type and filters
4. Generate report
5. Verify data is accurate
6. Export report (if available)

---

## 📝 Testing Checklist

### Admin Pages
- [ ] Dashboard loads with real data
- [ ] Analytics charts display correctly
- [ ] Students page shows database records
- [ ] Faculty page shows database records
- [ ] Courses page shows database records
- [ ] Attendance page shows database records
- [ ] Results page shows database records
- [ ] Notifications page shows database records
- [ ] Add student form saves to database
- [ ] Add faculty form saves to database
- [ ] Create course form saves to database
- [ ] Send notification saves to database

### Faculty Pages
- [ ] Dashboard loads with assigned courses
- [ ] Students page shows enrolled students
- [ ] Attendance page loads student list
- [ ] Mark attendance saves to database
- [ ] Results page loads student list
- [ ] Enter marks saves to database
- [ ] Profile page loads faculty data
- [ ] Edit profile saves to database

### Student Pages
- [ ] Dashboard loads with student data
- [ ] CGPA/SGPA calculate correctly
- [ ] Attendance percentage is accurate
- [ ] Charts display real data
- [ ] Notifications load from database

---

## 🎉 Success Criteria

The migration is successful if:

1. ✅ All pages load without errors
2. ✅ Data displays from Supabase database
3. ✅ Loading states appear during fetch
4. ✅ Empty states show when no data
5. ✅ Forms save data to database
6. ✅ Filters and search work correctly
7. ✅ Charts render with real data
8. ✅ No hardcoded data in migrated pages
9. ✅ Toast notifications work
10. ✅ Navigation between pages works

---

## 🔗 Quick Links

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Database Schema:** `campus-erp/backend/src/schema.sql`
- **Migration Status:** `campus-erp/MIGRATION_STATUS.md`

---

## 📞 Need Help?

If you encounter issues:

1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify environment variables in `.env`
4. Check database has data
5. Review migration status document

---

**Happy Testing! 🚀**
