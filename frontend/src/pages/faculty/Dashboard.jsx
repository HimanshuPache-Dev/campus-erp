import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Bell,
  ChevronRight,
  GraduationCap,
  CalendarCheck,
  BarChart3
} from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const { semester, academicYear } = useSemester();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    todayClasses: 0,
    pendingTasks: 0
  });

  const [todaySchedule, setTodaySchedule] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [myCourses, setMyCourses] = useState([]);

  // Fetch faculty dashboard data
  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id, semester, academicYear]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all courses (since course_assignments table doesn't exist yet)
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .limit(5);

      if (coursesError) throw coursesError;

      const courses = coursesData || [];

      // Get student counts for each course
      const coursesWithStats = await Promise.all(
        courses.map(async (course) => {
          const { count } = await supabase
            .from('student_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);

          // Get attendance percentage (simplified)
          const { data: attendanceData } = await supabase
            .from('attendance')
            .select('status')
            .eq('course_id', course.id)
            .eq('faculty_id', user.id);

          const totalRecords = attendanceData?.length || 0;
          const presentRecords = attendanceData?.filter(a => a.status === 'present').length || 0;
          const attendancePercentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

          return {
            id: course.id,
            code: course.course_code,
            name: course.course_name,
            semester: course.semester,
            students: count || 0,
            schedule: 'Mon, Wed, Fri 10:00 AM', // Would come from schedule table
            attendance: attendancePercentage
          };
        })
      );

      setMyCourses(coursesWithStats);

      // Calculate stats
      const totalStudents = coursesWithStats.reduce((sum, c) => sum + c.students, 0);
      setStats({
        totalCourses: coursesWithStats.length,
        totalStudents,
        todayClasses: Math.min(3, coursesWithStats.length), // Simplified
        pendingTasks: 0 // Would be calculated from actual tasks
      });

      // Set today's schedule (simplified - would come from timetable)
      setTodaySchedule(coursesWithStats.slice(0, 3).map((course, idx) => ({
        id: course.id,
        courseCode: course.code,
        courseName: course.name,
        time: ['10:00 AM - 11:30 AM', '2:00 PM - 3:30 PM', '4:00 PM - 5:30 PM'][idx],
        room: `Room ${401 + idx}`,
        semester: `SEM ${course.semester}`,
        students: course.students
      })));

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notificationsData) {
        setRecentNotifications(notificationsData.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          time: new Date(n.created_at).toLocaleString(),
          type: n.type
        })));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (path) => {
    navigate(path);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'info': return <Bell className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Faculty'}!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {semester} {academicYear} Semester • {user?.department || 'Department'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            semester === 'Winter' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          }`}>
            <Calendar className="h-4 w-4 mr-2" />
            {semester} {academicYear}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">My Courses</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{stats.totalCourses}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{stats.totalStudents}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Classes</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{stats.todayClasses}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Tasks</p>
              <p className="text-2xl font-semibold mt-2 text-yellow-600 dark:text-yellow-400">{stats.pendingTasks}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Schedule</h3>
            <button 
              onClick={() => navigate('/faculty/schedule')}
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              View Full Schedule
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {todaySchedule.map((class_) => (
              <div key={class_.id} className="flex items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900 dark:text-white">{class_.courseName}</h4>
                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                      {class_.courseCode}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      {class_.time}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-2" />
                      {class_.students} Students
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      {class_.semester}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      {class_.room}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/faculty/attendance?course=${class_.courseCode}`)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark Attendance
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Pending Tasks & Notifications */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Tasks</h3>
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{task.task}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{task.course} • Due {task.due}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button 
                      onClick={() => navigate(task.action)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <button 
                onClick={() => navigate('/faculty/notifications')}
                className="text-sm text-green-600 hover:text-green-700"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentNotifications.map(notif => (
                <div key={notif.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  {getNotificationIcon(notif.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* My Courses Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Courses</h3>
          <button 
            onClick={() => navigate('/faculty/courses')}
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
          >
            View All Courses
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {myCourses.map(course => (
            <div key={course.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                  {course.code}
                </span>
                <span className="text-xs text-gray-500">Sem {course.semester}</span>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">{course.name}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Users className="h-3 w-3 mr-2" />
                  {course.students} Students
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-3 w-3 mr-2" />
                  {course.schedule}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <TrendingUp className="h-3 w-3 mr-2" />
                  Attendance: {course.attendance}%
                </div>
              </div>
              <div className="mt-3 flex space-x-2">
                <button 
                  onClick={() => navigate(`/faculty/attendance?course=${course.code}`)}
                  className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Attendance
                </button>
                <button 
                  onClick={() => navigate(`/faculty/results?course=${course.code}`)}
                  className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Results
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/faculty/attendance')}
          className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
        >
          <CalendarCheck className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Mark Attendance</p>
        </button>
        <button
          onClick={() => navigate('/faculty/results')}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
        >
          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Upload Results</p>
        </button>
        <button
          onClick={() => navigate('/faculty/students')}
          className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
        >
          <Users className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">View Students</p>
        </button>
        <button
          onClick={() => navigate('/faculty/schedule')}
          className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors group"
        >
          <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">My Schedule</p>
        </button>
      </div>
    </div>
  );
};

export default FacultyDashboard;