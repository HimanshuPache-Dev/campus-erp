import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SemesterProvider } from './context/SemesterContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import FacultyLayout from './layouts/FacultyLayout';
import StudentLayout from './layouts/StudentLayout';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import AddStudent from './pages/admin/AddStudent';
import ViewStudent from './pages/admin/ViewStudent';
import EditStudent from './pages/admin/EditStudent';
import Alerts from './pages/admin/Alerts';
import Faculty from './pages/admin/Faculty';
import AddFaculty from './pages/admin/AddFaculty';
import Courses from './pages/admin/Courses';
import CreateCourse from './pages/admin/CreateCourse';
import Attendance from './pages/admin/Attendance';
import Reports from './pages/admin/Reports';
import Results from './pages/admin/Results';
import Fees from './pages/admin/Fees';
import AssignFees from './pages/admin/AssignFees';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import Notifications from './pages/admin/Notifications';
import Profile from './pages/admin/Profile';
import SendNotification from './pages/admin/SendNotification';
import ScheduleExam from './pages/admin/ScheduleExam';
import ManageTimetable from './pages/admin/ManageTimetable';

// Faculty Pages
import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyCourses from './pages/faculty/Courses';
import FacultyAttendance from './pages/faculty/Attendance';
import FacultyResults from './pages/faculty/Results';
import FacultyStudents from './pages/faculty/Students';
import FacultyAnalytics from './pages/faculty/Analytics';
import FacultySchedule from './pages/faculty/Schedule';
import FacultyProfile from './pages/faculty/Profile';
import FacultyNotifications from './pages/faculty/Notifications';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentAttendance from './pages/student/Attendance';
import StudentResults from './pages/student/Results';
import StudentTimetable from './pages/student/Timetable';
import StudentFees from './pages/student/Fees';
import StudentProfile from './pages/student/Profile';
import StudentNotifications from './pages/student/Notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  console.log('🛡️ ProtectedRoute - Auth State:', { 
    user: user?.email, 
    role: user?.role,
    isAuthenticated, 
    loading,
    path: window.location.pathname 
  });
  
  // Show loading while checking authentication
  if (loading) {
    console.log('⏳ ProtectedRoute - Loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('🔒 Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If user doesn't have required role, redirect to their appropriate dashboard
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.log('🚫 Insufficient permissions, redirecting to role dashboard');
    return <Navigate to={`/${user?.role}/dashboard`} replace />;
  }
  
  // If authenticated and authorized, render children
  console.log('✅ Access granted to protected route');
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/add" element={<AddStudent />} />
        <Route path="students/:id" element={<ViewStudent />} />
        <Route path="students/:id/edit" element={<EditStudent />} />
        <Route path="faculty" element={<Faculty />} />
        <Route path="faculty/add" element={<AddFaculty />} />
        <Route path="faculty/:id" element={<div>Faculty Details</div>} />
        <Route path="faculty/:id/edit" element={<div>Edit Faculty</div>} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/create" element={<CreateCourse />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="courses/:id" element={<div>Course Details</div>} />
        <Route path="courses/:id/edit" element={<CreateCourse />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="reports" element={<Reports />} />
        <Route path="results" element={<Results />} />
        <Route path="results/:id" element={<div>Result Details</div>} />
        <Route path="results/add" element={<div>Add Result</div>} />
        <Route path="results/:id/edit" element={<div>Edit Result</div>} />
        <Route path="fees" element={<Fees />} />
        <Route path="fees/assign" element={<AssignFees />} />
        <Route path="fees/:id" element={<div>Fee Details</div>} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications/send" element={<SendNotification />} />
        <Route path="exams/schedule" element={<ScheduleExam />} />
        <Route path="manage-timetable" element={<ManageTimetable />} />
      </Route>

      {/* Faculty Routes */}
      <Route path="/faculty" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <FacultyLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="courses" element={<FacultyCourses />} />
        <Route path="attendance" element={<FacultyAttendance />} />
        <Route path="results" element={<FacultyResults />} />
        <Route path="students" element={<FacultyStudents />} />
        <Route path="analytics" element={<FacultyAnalytics />} />
        <Route path="schedule" element={<FacultySchedule />} />
        <Route path="profile" element={<FacultyProfile />} />
        <Route path="notifications" element={<FacultyNotifications />} />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="fees" element={<StudentFees />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="notifications" element={<StudentNotifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  console.log('🚀 App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <SemesterProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#18181b',
                  color: '#f4f4f5',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                },
                success: {
                  iconTheme: { primary: '#22c55e', secondary: '#18181b' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#18181b' },
                },
              }}
            />
          </SemesterProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;