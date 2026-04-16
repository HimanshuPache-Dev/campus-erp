# 📚 Course Assignment Guide

## How to Assign Courses to Students

### Method 1: Automatic Assignment (Default)
When you **add a new student**, courses are automatically assigned based on:
- Student's **semester** (e.g., Semester 1)
- Student's **department** (e.g., Computer Engineering)

All courses matching these criteria are automatically enrolled.

### Method 2: Manual Assignment (New Feature)

#### Access the Feature:
1. **Admin Dashboard** → **Courses** → **Assign Courses** button
2. Or **Quick Actions** → **Assign Courses**
3. Or direct URL: `/admin/courses/assign`

#### How to Use:

**Step 1: Select Student**
- Search by name, email, or enrollment number
- Click on a student to select them

**Step 2: View Current Enrollments**
- See all courses the student is currently enrolled in
- Green checkmark indicates enrolled courses

**Step 3: Assign New Courses**
- View available courses (not yet enrolled)
- Click the **+** button to assign a course
- Course moves to "Enrolled" section

**Step 4: Remove Courses (if needed)**
- Click the **trash** button next to enrolled courses
- Course moves back to "Available" section

### Features:
✅ **Search Students** - Find by name, email, enrollment number
✅ **Real-time Updates** - Changes reflect immediately
✅ **Visual Feedback** - Green for enrolled, gray for available
✅ **Bulk Management** - Assign multiple courses quickly
✅ **Safe Removal** - Easy to undo assignments

### Database Tables Used:
- `users` - Student information
- `courses` - Available courses
- `student_enrollments` - Course assignments

### Example Workflow:
1. Student "John Doe" needs additional courses
2. Go to **Assign Courses**
3. Search for "John Doe"
4. See he's enrolled in 4 courses
5. Assign 2 more courses from available list
6. Student now has 6 courses total

### Benefits:
- **Flexible** - Assign courses beyond automatic rules
- **Individual Control** - Customize per student
- **Easy Management** - Visual interface
- **Instant Updates** - No page refresh needed

### Access:
- **Admin only** - Students cannot self-enroll
- **Real-time** - Changes are immediate
- **Audit Trail** - All changes logged in database

Try it now: Login as admin → Courses → Assign Courses! 🚀