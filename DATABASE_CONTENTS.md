# Database Contents Summary

## 👥 Users (7 total)

### Admin (1)
- Admin User - admin@campus.com

### Faculty (3)
1. Dr. Rajesh Patil - dr.patil@campus.com (Computer Science - AI)
2. Dr. Amit Kumar - dr.kumar@campus.com (Computer Science - Data Structures)
3. Dr. Priya Shah - dr.shah@campus.com (Mathematics)

### Students (3)
1. Rahul Sharma - rahul.sharma@campus.edu (CS2024001)
2. Priya Patel - priya.patel@campus.edu (CS2024002)
3. Amit Verma - amit.verma@campus.edu (CS2024003)

---

## 📚 Courses (5 total)

1. **CS101** - Introduction to Programming (Semester 1)
   - Faculty: Dr. Rajesh Patil
   - Students: Rahul, Priya, Amit (3 students)

2. **CS102** - Data Structures (Semester 1)
   - Faculty: Dr. Amit Kumar
   - Students: Rahul, Priya (2 students)

3. **MA101** - Calculus I (Semester 1)
   - Faculty: Dr. Priya Shah
   - Students: Rahul (1 student)

4. **CS201** - Algorithms (Semester 2)
   - Faculty: Not assigned
   - Students: None

5. **CS202** - Database Systems (Semester 2)
   - Faculty: Not assigned
   - Students: None

---

## 🎓 Student Enrollments

### Rahul Sharma (CS2024001)
- CS101 - Introduction to Programming
- CS102 - Data Structures
- MA101 - Calculus I
**Total: 3 courses**

### Priya Patel (CS2024002)
- CS101 - Introduction to Programming
- CS102 - Data Structures
**Total: 2 courses**

### Amit Verma (CS2024003)
- CS101 - Introduction to Programming
**Total: 1 course**

---

## 💰 Fees Assigned

### Rahul Sharma
- Tuition Fee: ₹48,000 (Pending)
- Library Fee: ₹2,000 (Paid)
- Lab Fee: ₹5,000 (Pending)

### Priya Patel
- Tuition Fee: ₹48,000 (Paid)
- Library Fee: ₹2,000 (Paid)
- Lab Fee: ₹5,000 (Paid)

### Amit Verma
- Tuition Fee: ₹48,000 (Overdue)
- Library Fee: ₹2,000 (Overdue)

---

## 📅 Timetable Slots (8 total)

### Monday
- 09:00-10:00 - CS101 (Room 101) - Dr. Rajesh Patil
- 11:00-12:00 - MA101 (Room 103) - Dr. Priya Shah

### Tuesday
- 10:00-11:00 - CS102 (Room 102) - Dr. Amit Kumar

### Wednesday
- 09:00-10:00 - CS101 (Room 101) - Dr. Rajesh Patil
- 11:00-12:00 - MA101 (Room 103) - Dr. Priya Shah

### Thursday
- 10:00-11:00 - CS102 (Room 102) - Dr. Amit Kumar

### Friday
- 09:00-10:00 - CS101 (Room 101) - Dr. Rajesh Patil
- 11:00-12:00 - MA101 (Room 103) - Dr. Priya Shah

---

## 🔑 Login Credentials

**Admin:**
- Email: admin@campus.com
- Password: admin123

**Faculty:**
- Email: dr.patil@campus.com / dr.kumar@campus.com / dr.shah@campus.com
- Password: faculty123

**Students:**
- Email: rahul.sharma@campus.edu / priya.patel@campus.edu / amit.verma@campus.edu
- Password: student123

---

## 📝 To Add More Data

### Add More Student Enrollments
Run the SQL file: `backend/add-more-enrollments.sql`

### Add More Students
Use the "Add Student" page in Admin dashboard

### Add More Courses
Use the "Create Course" page in Admin dashboard

### Assign More Fees
Use the "Assign Fees" page in Admin dashboard

---

## ✅ Verification

To verify all data is loaded, run this in Supabase SQL Editor:

```sql
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Courses', COUNT(*) FROM courses
UNION ALL
SELECT 'Student Enrollments', COUNT(*) FROM student_enrollments
UNION ALL
SELECT 'Fees', COUNT(*) FROM fees
UNION ALL
SELECT 'Timetable Slots', COUNT(*) FROM timetable_slots;
```

Expected results:
- Users: 7
- Courses: 5
- Student Enrollments: 6
- Fees: 8
- Timetable Slots: 8
