# Remaining Files with Hardcoded Data

## Summary

The following files still contain hardcoded/mock data and need to be migrated to use Supabase:

### Student Pages (7 files):
1. **`frontend/src/pages/student/Attendance.jsx`** - Has mock attendance data
2. **`frontend/src/pages/student/Fees.jsx`** - Has mock fee data
3. **`frontend/src/pages/student/Results.jsx`** - Has mock results data
4. **`frontend/src/pages/student/Profile.jsx`** - Has mock profile data
5. **`frontend/src/pages/student/Notifications.jsx`** - Has mock notifications
6. **`frontend/src/pages/student/Timetable.jsx`** - Has mock timetable data
7. **`frontend/src/pages/student/Dashboard.jsx`** - ✅ Already migrated

### Faculty Pages (1 file):
8. **`frontend/src/pages/faculty/Analytics.jsx`** - Has mock analytics data

### Admin Pages:
✅ All admin pages already migrated to Supabase

### Faculty Pages (except Analytics):
✅ All other faculty pages already migrated to Supabase

## Status: 7 files remaining (out of 27 total pages)

## Why These Weren't Migrated Yet

These student pages have complex UI with charts and detailed data structures. They were left with mock data to:
1. Show the UI design and functionality
2. Allow the app to work without database
3. Demonstrate the expected data structure

## What Needs to Be Done

Each file needs:
1. Remove hardcoded arrays/objects
2. Add `useState` for data
3. Add `useEffect` to fetch from Supabase
4. Add loading states
5. Add error handling
6. Show empty states when no data

## Quick Migration Pattern

```javascript
// BEFORE (Hardcoded)
const attendanceData = [
  { subject: 'Math', present: 40, total: 45 },
  // ... more hardcoded data
];

// AFTER (Supabase)
const [attendanceData, setAttendanceData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance')
        .select('*, courses(course_name)')
        .eq('student_id', user.id);
      
      if (error) throw error;
      setAttendanceData(data || []);
    } catch (err) {
      console.error('Error:', err);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };
  
  if (user?.id) fetchAttendance();
}, [user]);
```

## Database Tables Needed

These pages query these tables:
- `attendance` - For Attendance.jsx
- `fees` - For Fees.jsx
- `results` - For Results.jsx
- `users` + `student_details` - For Profile.jsx
- `notifications` - For Notifications.jsx
- `courses` + `course_assignments` - For Timetable.jsx (needs schedule data)
- Multiple tables - For Analytics.jsx

## Priority Order

1. **Attendance.jsx** - Most important for students
2. **Fees.jsx** - Financial data
3. **Results.jsx** - Academic performance
4. **Profile.jsx** - User information
5. **Notifications.jsx** - Communication
6. **Timetable.jsx** - Schedule (needs new table structure)
7. **Analytics.jsx** - Faculty analytics

## Note

These files currently work with mock data and display properly. They can be migrated after:
1. Database tables are created in Supabase
2. Seed data is populated
3. Testing confirms data structure matches

The app is functional with these mock data files - they just show static data instead of real database data.

## Decision

You can either:
- **Option A**: Keep mock data for now (app works, just shows static data)
- **Option B**: Migrate all 7 files to Supabase (requires database setup first)
- **Option C**: Migrate gradually as needed

**Recommendation**: First set up the database (run schema.sql and seed.js), then migrate these files one by one.
