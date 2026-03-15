# 📅 Timetable Management System - Implementation Guide

## Overview

This guide explains how to implement a complete timetable management system where:
1. Admin creates teacher schedules (day, time, room)
2. Students see their timetable based on enrolled courses
3. Semester filtering (only show current semester students)
4. Admin can promote students to next semester

---

## Step 1: Create Database Table

Run this SQL in Supabase SQL Editor:

```sql
-- Create timetable_slots table
CREATE TABLE IF NOT EXISTS timetable_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number VARCHAR(50),
  semester INTEGER NOT NULL,
  academic_year VARCHAR(10) NOT NULL,
  semester_type VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_timetable_course ON timetable_slots(course_id);
CREATE INDEX idx_timetable_faculty ON timetable_slots(faculty_id);
CREATE INDEX idx_timetable_day ON timetable_slots(day_of_week);
CREATE INDEX idx_timetable_semester ON timetable_slots(semester);

-- Disable RLS
ALTER TABLE timetable_slots DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON timetable_slots TO service_role;
GRANT ALL ON timetable_slots TO authenticated;
```

---

## Step 2: Admin Features Needed

### A. Manage Timetable Page (`/admin/manage-timetable`)

**Features:**
- Select course, faculty, day, time, room
- Add/Edit/Delete timetable slots
- View weekly schedule grid
- Filter by semester, department

**Key Functions:**
```javascript
// Add timetable slot
const addSlot = async (slotData) => {
  const { data, error } = await supabase
    .from('timetable_slots')
    .insert([{
      course_id: slotData.courseId,
      faculty_id: slotData.facultyId,
      day_of_week: slotData.day,
      start_time: slotData.startTime,
      end_time: slotData.endTime,
      room_number: slotData.room,
      semester: slotData.semester,
      academic_year: '2025-26',
      semester_type: 'Winter'
    }]);
};
```

### B. Promote Students Page (`/admin/promote-students`)

**Features:**
- List students by current semester
- Bulk select students
- Promote to next semester
- Update semester in student_details table

**Key Functions:**
```javascript
// Promote students
const promoteStudents = async (studentIds) => {
  const { data, error } = await supabase
    .from('student_details')
    .update({ 
      current_semester: supabase.raw('current_semester + 1')
    })
    .in('user_id', studentIds);
};
```

### C. Filter Students by Semester

**In Students List Page:**
```javascript
// Filter by semester type (even/odd)
const filterBySemesterType = (type) => {
  if (type === 'even') {
    // Show only semester 2, 4, 6, 8
    return students.filter(s => s.current_semester % 2 === 0);
  } else {
    // Show only semester 1, 3, 5, 7
    return students.filter(s => s.current_semester % 2 === 1);
  }
};
```

---

## Step 3: Student Timetable View

### Update Student Timetable Page

**Features:**
- Fetch enrolled courses
- Get timetable slots for those courses
- Display in weekly grid format
- Show day, time, room, faculty name

**Key Query:**
```javascript
const fetchStudentTimetable = async (studentId, semester) => {
  // Get enrolled courses
  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select('course_id')
    .eq('student_id', studentId);

  const courseIds = enrollments.map(e => e.course_id);

  // Get timetable slots for those courses
  const { data: slots } = await supabase
    .from('timetable_slots')
    .select(`
      *,
      courses (course_code, course_name),
      users:faculty_id (first_name, last_name)
    `)
    .in('course_id', courseIds)
    .eq('semester', semester)
    .eq('is_active', true)
    .order('day_of_week')
    .order('start_time');

  return slots;
};
```

---

## Step 4: Faculty Schedule View

### Update Faculty Schedule Page

**Features:**
- Show all classes faculty teaches
- Weekly grid view
- Day, time, course, room

**Key Query:**
```javascript
const fetchFacultySchedule = async (facultyId) => {
  const { data: slots } = await supabase
    .from('timetable_slots')
    .select(`
      *,
      courses (course_code, course_name, semester)
    `)
    .eq('faculty_id', facultyId)
    .eq('is_active', true)
    .order('day_of_week')
    .order('start_time');

  return slots;
};
```

---

## Step 5: UI Components Needed

### A. Weekly Timetable Grid Component

```javascript
const TimetableGrid = ({ slots }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  return (
    <table>
      <thead>
        <tr>
          <th>Time</th>
          {days.map(day => <th key={day}>{day}</th>)}
        </tr>
      </thead>
      <tbody>
        {timeSlots.map(time => (
          <tr key={time}>
            <td>{time}</td>
            {days.map(day => (
              <td key={day}>
                {/* Find and display slot for this day/time */}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### B. Add Timetable Slot Form

```javascript
const AddSlotForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    courseId: '',
    facultyId: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    semester: 1
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }}>
      {/* Form fields */}
    </form>
  );
};
```

---

## Step 6: Semester Management

### A. Add Semester Filter to Student List

```javascript
// In admin/Students.jsx
const [semesterFilter, setSemesterFilter] = useState('all');

const filteredStudents = students.filter(student => {
  if (semesterFilter === 'even') {
    return student.student_details?.current_semester % 2 === 0;
  } else if (semesterFilter === 'odd') {
    return student.student_details?.current_semester % 2 === 1;
  }
  return true; // 'all'
});
```

### B. Bulk Promote Students

```javascript
const promoteSelectedStudents = async () => {
  const updates = selectedStudents.map(studentId => 
    supabase
      .from('student_details')
      .update({ 
        current_semester: supabase.raw('current_semester + 1')
      })
      .eq('user_id', studentId)
  );

  await Promise.all(updates);
  toast.success('Students promoted successfully!');
};
```

---

## Step 7: Navigation Updates

### Add New Routes

In `frontend/src/routes/index.jsx`:

```javascript
// Admin routes
{
  path: '/admin/manage-timetable',
  element: <ManageTimetable />
},
{
  path: '/admin/promote-students',
  element: <PromoteStudents />
}
```

### Add Sidebar Links

In admin sidebar:
- "Manage Timetable" → `/admin/manage-timetable`
- "Promote Students" → `/admin/promote-students`

---

## Step 8: Sample Data

### Insert Sample Timetable Slots

```sql
INSERT INTO timetable_slots (course_id, faculty_id, day_of_week, start_time, end_time, room_number, semester, academic_year, semester_type)
SELECT 
  c.id,
  ca.faculty_id,
  'Monday',
  '09:00:00',
  '10:00:00',
  'Room 101',
  c.semester,
  '2025-26',
  'Winter'
FROM courses c
JOIN course_assignments ca ON c.id = ca.course_id
WHERE c.is_active = true
LIMIT 5;
```

---

## Implementation Priority

1. ✅ **First**: Run database SQL (create timetable_slots table)
2. ✅ **Second**: Create admin manage timetable page
3. ✅ **Third**: Update student timetable to show slots
4. ✅ **Fourth**: Update faculty schedule to show slots
5. ✅ **Fifth**: Add semester filtering to student list
6. ✅ **Sixth**: Create promote students feature

---

## Quick Start Commands

```bash
# 1. Run SQL in Supabase
# Copy from: backend/create-timetable-system.sql

# 2. The pages already exist, they just need to be updated to use timetable_slots table

# 3. Test the system
# - Login as admin
# - Go to manage timetable
# - Add some slots
# - Login as student
# - View timetable
```

---

## Current Status

✅ Database table SQL created: `backend/create-timetable-system.sql`
⏳ Admin pages need to be created/updated
⏳ Student/Faculty timetable pages need to be updated
⏳ Semester filtering needs to be added

---

## Next Steps

1. Run the SQL script in Supabase
2. I can create the admin timetable management page
3. Update student/faculty timetable pages
4. Add semester promotion feature

Would you like me to create these pages now? 🚀
