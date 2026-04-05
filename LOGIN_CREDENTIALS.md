# 🔐 Campus ERP - Login Credentials

## Admin Account
- **Email:** `admin@campus.com`
- **Password:** `admin123`
- **Role:** Administrator
- **Access:** Full system access

---

## Faculty Accounts

### Dr. Rajesh Patil (Computer Science)
- **Email:** `dr.patil@campus.com`
- **Password:** `faculty123`
- **Employee ID:** FAC001
- **Department:** Computer Science
- **Specialization:** Artificial Intelligence
- **Courses:** CS101 - Introduction to Programming

### Dr. Amit Kumar (Computer Science)
- **Email:** `dr.kumar@campus.com`
- **Password:** `faculty123`
- **Employee ID:** FAC002
- **Department:** Computer Science
- **Specialization:** Data Structures
- **Courses:** CS102 - Data Structures

### Dr. Priya Shah (Mathematics)
- **Email:** `dr.shah@campus.com`
- **Password:** `faculty123`
- **Employee ID:** FAC003
- **Department:** Mathematics
- **Specialization:** Applied Mathematics
- **Courses:** MA101 - Calculus I

---

## Student Accounts

### Rahul Sharma
- **Email:** `rahul.sharma@campus.edu`
- **Password:** `student123`
- **Enrollment:** CS2024001
- **Department:** Computer Science
- **Semester:** 1
- **CGPA:** 8.5
- **Enrolled Courses:**
  - CS101 - Introduction to Programming
  - CS102 - Data Structures
  - MA101 - Calculus I

### Priya Patel
- **Email:** `priya.patel@campus.edu`
- **Password:** `student123`
- **Enrollment:** CS2024002
- **Department:** Computer Science
- **Semester:** 1
- **CGPA:** 9.0
- **Enrolled Courses:**
  - CS101 - Introduction to Programming
  - CS102 - Data Structures

### Amit Verma
- **Email:** `amit.verma@campus.edu`
- **Password:** `student123`
- **Enrollment:** CS2024003
- **Department:** Computer Science
- **Semester:** 1
- **CGPA:** 7.8
- **Enrolled Courses:**
  - CS101 - Introduction to Programming

---

## Database Information

### Supabase Project
- **URL:** `https://xwlglapzycdseitkwqlr.supabase.co`
- **Anon Key:** `sb_publishable_RtV3uo_NTL5HqtDI1i85Cw_tEnwulUM`

### SQL Scripts to Run (in order)
1. `backend/COMPLETE_DATABASE_WITH_TIMETABLE.sql` - Complete database setup
2. `backend/VERIFY_AND_FIX_DATA.sql` - Verify all data is correct

---

## Quick Test Guide

### Test Admin Login
1. Go to login page
2. Enter: `admin@campus.com` / `admin123`
3. Should see admin dashboard with all stats

### Test Faculty Login
1. Go to login page
2. Enter: `dr.patil@campus.com` / `faculty123`
3. Should see faculty dashboard
4. Go to Attendance page
5. Select CS101 course - should see 3 students (Rahul, Priya, Amit)

### Test Student Login
1. Go to login page
2. Enter: `rahul.sharma@campus.edu` / `student123`
3. Should see student dashboard
4. Go to Timetable - should see 3 courses scheduled
5. Go to Fees - should see tuition, library, and lab fees

---

## Common Issues & Solutions

### Issue: "No students found" in Faculty Attendance
**Solution:** Run `backend/VERIFY_AND_FIX_DATA.sql` to add student enrollments

### Issue: "Failed to load courses" 
**Solution:** Verify courses exist in database using SQL script

### Issue: Login fails with "User not found"
**Solution:** Check if users table has data, run complete setup SQL script

### Issue: Timetable shows empty
**Solution:** Verify timetable_slots table has data for semester 1

---

## Notes
- All passwords are for development only
- Change passwords in production
- Backend server is NOT needed - frontend connects directly to Supabase
- App is 100% serverless
