export const ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
};

export const SEMESTERS = {
  WINTER: 'Winter',
  SUMMER: 'Summer',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
};

export const FEE_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
};

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Business Administration',
  'Commerce',
];

export const API_ENDPOINTS = {
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    STUDENTS: '/admin/students',
    FACULTY: '/admin/faculty',
    COURSES: '/admin/courses',
    ATTENDANCE: '/admin/attendance',
    RESULTS: '/admin/results',
    FEES: '/admin/fees',
    ANALYTICS: '/admin/analytics',
  },
  FACULTY: {
    DASHBOARD: '/faculty/dashboard',
    COURSES: '/faculty/courses',
    ATTENDANCE: '/faculty/attendance',
    RESULTS: '/faculty/results',
    STUDENTS: '/faculty/students',
  },
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    ATTENDANCE: '/student/attendance',
    RESULTS: '/student/results',
    TIMETABLE: '/student/timetable',
    FEES: '/student/fees',
  },
};