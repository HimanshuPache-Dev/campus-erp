# Migration Instructions for Remaining 10 Pages

## Overview
These 10 pages need to be migrated from hardcoded data to Supabase queries.

## Files to Migrate

### Student Pages (6):
1. `frontend/src/pages/student/Attendance.jsx`
2. `frontend/src/pages/student/Fees.jsx`
3. `frontend/src/pages/student/Results.jsx`
4. `frontend/src/pages/student/Profile.jsx`
5. `frontend/src/pages/student/Notifications.jsx`
6. `frontend/src/pages/student/Timetable.jsx`

### Faculty Pages (4):
7. `frontend/src/pages/faculty/Schedule.jsx`
8. `frontend/src/pages/faculty/Results.jsx`
9. `frontend/src/pages/faculty/Notifications.jsx`
10. `frontend/src/pages/faculty/Analytics.jsx`

## Migration Pattern

For each file, follow this pattern:

### Step 1: Add imports
```javascript
import { supabase } from '../../config/supabase';
import { useEffect } from 'react'; // if not already imported
```

### Step 2: Replace hardcoded data with state
```javascript
// BEFORE
const attendanceData = [/* hardcoded array */];

// AFTER
const [attendanceData, setAttendanceData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### Step 3: Add useEffect to fetch data
```javascript
useEffect(() => {
  const fetchData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('table_name')
        .select('*')
        .eq('student_id', user.id); // or faculty_id
      
      if (error) throw error;
      setAttendanceData(data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [user?.id, semester, academicYear]);
```

### Step 4: Add loading state
```javascript
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );
}
```

### Step 5: Add empty state
```javascript
if (attendanceData.length === 0) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">No attendance records found</p>
    </div>
  );
}
```

## Specific Migrations

### 1. Student Attendance.jsx
**Tables:** `attendance`, `courses`
**Query:**
```javascript
const { data: attendanceRecords } = await supabase
  .from('attendance')
  .select(`
    *,
    courses (course_name, course_code)
  `)
  .eq('student_id', user.id)
  .order('date', { ascending: false });

// Calculate summary
const total = attendanceRecords.length;
const present = attendanceRecords.filter(r => r.status === 'present').length;
const absent = attendanceRecords.filter(r => r.status === 'absent').length;
const late = attendanceRecords.filter(r => r.status === 'late').length;
const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

setAttendanceSummary({ total, present, absent, late, percentage });
setDetailedRecords(attendanceRecords);
```

### 2. Student Fees.jsx
**Tables:** `fees`
**Query:**
```javascript
const { data: feeRecords } = await supabase
  .from('fees')
  .select('*')
  .eq('student_id', user.id)
  .order('due_date', { ascending: true });

const totalFees = feeRecords.reduce((sum, f) => sum + f.amount, 0);
const paidFees = feeRecords.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
const pendingFees = totalFees - paidFees;

setFeeSummary({ totalFees, paidFees, pendingFees });
setFeeStructure(feeRecords);
```

### 3. Student Results.jsx
**Tables:** `results`, `courses`
**Query:**
```javascript
const { data: resultsData } = await supabase
  .from('results')
  .select(`
    *,
    courses (course_name, course_code, credits)
  `)
  .eq('student_id', user.id)
  .order('semester_type', { ascending: false });

// Group by semester
const bySemester = {};
resultsData.forEach(result => {
  const sem = result.semester_type;
  if (!bySemester[sem]) bySemester[sem] = [];
  bySemester[sem].push(result);
});

setSemesterResults(bySemester);
```

### 4. Student Profile.jsx
**Tables:** `users`, `student_details`
**Query:**
```javascript
const { data: userData } = await supabase
  .from('users')
  .select('*, student_details(*)')
  .eq('id', user.id)
  .single();

setProfileData({
  firstName: userData.first_name,
  lastName: userData.last_name,
  email: userData.email,
  phone: userData.phone,
  department: userData.department,
  enrollment: userData.student_details?.[0]?.enrollment_number,
  currentSemester: userData.student_details?.[0]?.current_semester,
  // ... map all fields
});
```

### 5. Student Notifications.jsx
**Tables:** `notifications`
**Query:**
```javascript
const { data: notificationsData } = await supabase
  .from('notifications')
  .select('*')
  .or(`user_id.eq.${user.id},is_global.eq.true`)
  .order('created_at', { ascending: false });

setNotifications(notificationsData || []);
```

### 6. Student Timetable.jsx
**Tables:** `courses`, `course_assignments` (or create schedule table)
**Note:** This needs a schedule/timetable table which doesn't exist yet.
**Temporary Solution:** Show enrolled courses
```javascript
const { data: enrolledCourses } = await supabase
  .from('student_enrollments')
  .select(`
    *,
    courses (course_name, course_code)
  `)
  .eq('student_id', user.id)
  .eq('is_completed', false);

// Format as timetable (simplified)
setTimetableData(enrolledCourses);
```

### 7. Faculty Schedule.jsx
**Tables:** `course_assignments`, `courses`
**Query:**
```javascript
const { data: assignedCourses } = await supabase
  .from('course_assignments')
  .select(`
    *,
    courses (course_name, course_code, semester)
  `)
  .eq('faculty_id', user.id)
  .eq('is_active', true);

// Format as schedule
setScheduleData(assignedCourses);
```

### 8. Faculty Results.jsx
**Tables:** `course_assignments`, `results`, `users`
**Query:**
```javascript
// Get faculty courses
const { data: courses } = await supabase
  .from('course_assignments')
  .select('course_id, courses(course_name, course_code)')
  .eq('faculty_id', user.id);

// Get results for selected course
const { data: resultsData } = await supabase
  .from('results')
  .select(`
    *,
    users (first_name, last_name, email)
  `)
  .eq('course_id', selectedCourseId)
  .eq('faculty_id', user.id);

setResults(resultsData);
```

### 9. Faculty Notifications.jsx
**Tables:** `notifications`
**Query:**
```javascript
// Received notifications
const { data: received } = await supabase
  .from('notifications')
  .select('*')
  .or(`user_id.eq.${user.id},is_global.eq.true`)
  .order('created_at', { ascending: false });

setReceivedNotifications(received || []);
```

### 10. Faculty Analytics.jsx
**Tables:** `results`, `attendance`, `courses`
**Query:**
```javascript
// Get faculty courses
const { data: courses } = await supabase
  .from('course_assignments')
  .select('course_id, courses(*)')
  .eq('faculty_id', user.id);

// Get results for analytics
const { data: resultsData } = await supabase
  .from('results')
  .select('*')
  .in('course_id', courses.map(c => c.course_id));

// Calculate analytics
const coursePerformance = courses.map(c => {
  const courseResults = resultsData.filter(r => r.course_id === c.course_id);
  const avgMarks = courseResults.reduce((sum, r) => sum + r.marks_obtained, 0) / courseResults.length;
  return {
    name: c.courses.course_code,
    avgMarks: avgMarks.toFixed(1),
    students: courseResults.length
  };
});

setCoursePerformance(coursePerformance);
```

## Testing After Migration

For each migrated page:
1. ✅ Check loading state appears
2. ✅ Check data loads from Supabase
3. ✅ Check empty state when no data
4. ✅ Check error handling
5. ✅ Check filters still work
6. ✅ Check charts render correctly

## Database Requirements

Make sure these tables exist in Supabase:
- ✅ users
- ✅ student_details
- ✅ faculty_details
- ✅ courses
- ⚠️ course_assignments (needs creation)
- ⚠️ student_enrollments (needs creation)
- ✅ attendance
- ✅ results
- ✅ fees
- ⚠️ notifications (needs creation)

## Priority Order

1. **Student Attendance** - Most used
2. **Student Fees** - Important financial data
3. **Student Results** - Academic performance
4. **Faculty Results** - Grade entry
5. **Student Profile** - User info
6. **Student Notifications** - Communication
7. **Faculty Analytics** - Performance tracking
8. **Faculty Notifications** - Communication
9. **Faculty Schedule** - Timetable
10. **Student Timetable** - Schedule view

## Estimated Time

- Each page: 10-15 minutes
- Total: 2-3 hours for all 10 pages

## Note

Since these files are large and complex, I recommend:
1. First ensure database tables exist (run schema.sql)
2. Run seed.js to populate test data
3. Then migrate pages one by one
4. Test each page after migration

Would you like me to create the actual migrated files or would you prefer to do it manually following these instructions?
