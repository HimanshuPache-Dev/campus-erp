import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import {
  CalendarCheck,
  BarChart3,
  Calendar,
  CreditCard,
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  Award,
  Bell,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { semester, academicYear } = useSemester();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [studentInfo, setStudentInfo] = useState({
    name: '',
    enrollment: '',
    department: '',
    currentSemester: 0,
    batch: '',
    cgpa: 0,
    sgpa: 0,
    attendance: 0,
    pendingFees: 0,
    totalFees: 0
  });

  const [attendanceData, setAttendanceData] = useState([]);
  const [semesterResults, setSemesterResults] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      setLoading(true);

      try {
        // Fetch student info
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            *,
            student_details (*)
          `)
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        const studentDetail = userData.student_details?.[0];
        
        // Fetch attendance data
        const { data: attendanceRecords } = await supabase
          .from('attendance')
          .select('status, course_id, courses(course_name)')
          .eq('student_id', user.id);

        // Calculate overall attendance
        const totalClasses = attendanceRecords?.length || 0;
        const presentClasses = attendanceRecords?.filter(a => a.status === 'present').length || 0;
        const overallAttendance = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

        // Group attendance by course
        const courseAttendance = {};
        attendanceRecords?.forEach(record => {
          const courseName = record.courses?.course_name || 'Unknown';
          if (!courseAttendance[courseName]) {
            courseAttendance[courseName] = { present: 0, total: 0 };
          }
          courseAttendance[courseName].total++;
          if (record.status === 'present') {
            courseAttendance[courseName].present++;
          }
        });

        const attendanceChartData = Object.entries(courseAttendance).map(([subject, data]) => ({
          subject,
          present: data.present,
          total: data.total,
          percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
        }));

        // Fetch results
        const { data: resultsData } = await supabase
          .from('results')
          .select('semester, marks, grade')
          .eq('student_id', user.id)
          .order('semester', { ascending: true });

        // Calculate CGPA and SGPA
        const semesterResultsData = resultsData?.map((result, index) => {
          const sgpa = result.marks ? (result.marks / 10).toFixed(2) : 0;
          const cgpa = resultsData.slice(0, index + 1)
            .reduce((sum, r) => sum + (r.marks / 10), 0) / (index + 1);
          return {
            semester: result.semester,
            sgpa: parseFloat(sgpa),
            cgpa: parseFloat(cgpa.toFixed(2))
          };
        }) || [];

        const latestResult = semesterResultsData[semesterResultsData.length - 1];

        // Fetch fees
        const { data: feesData } = await supabase
          .from('fees')
          .select('amount, amount_paid')
          .eq('student_id', user.id);

        const totalFees = feesData?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
        const paidFees = feesData?.reduce((sum, f) => sum + (f.amount_paid || 0), 0) || 0;

        // Fetch today's schedule
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = daysOfWeek[new Date().getDay()];

        // Get student's enrolled courses
        const { data: enrolledCourses } = await supabase
          .from('student_enrollments')
          .select('course_id')
          .eq('student_id', user.id);

        const courseIds = enrolledCourses?.map(e => e.course_id) || [];

        // Fetch today's timetable for enrolled courses
        const { data: todayClasses } = await supabase
          .from('timetable_slots')
          .select(`
            *,
            courses (course_code, course_name),
            users:faculty_id (first_name, last_name)
          `)
          .in('course_id', courseIds)
          .eq('day_of_week', today)
          .eq('is_active', true)
          .order('start_time');

        const scheduleData = todayClasses?.map(slot => ({
          subject: slot.courses?.course_name || 'Unknown',
          code: slot.courses?.course_code || 'N/A',
          time: `${slot.start_time?.substring(0, 5)} - ${slot.end_time?.substring(0, 5)}`,
          room: slot.room_number || 'TBA',
          faculty: slot.users ? `${slot.users.first_name} ${slot.users.last_name}` : 'TBA'
        })) || [];

        // Fetch notifications
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        const notifications = notificationsData?.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          time: new Date(n.created_at).toLocaleString()
        })) || [];

        // Set all state
        setStudentInfo({
          name: `${userData.first_name} ${userData.last_name}`,
          enrollment: studentDetail?.enrollment_number || 'N/A',
          department: userData.department || 'N/A',
          currentSemester: studentDetail?.current_semester || 0,
          batch: studentDetail?.batch || 'N/A',
          cgpa: latestResult?.cgpa || 0,
          sgpa: latestResult?.sgpa || 0,
          attendance: overallAttendance,
          pendingFees: totalFees - paidFees,
          totalFees: totalFees
        });

        setAttendanceData(attendanceChartData);
        setSemesterResults(semesterResultsData);
        setRecentNotifications(notifications);
        setTodaySchedule(scheduleData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCgpaColor = (cgpa) => {
    if (cgpa >= 9.0) return 'text-green-600';
    if (cgpa >= 8.0) return 'text-blue-600';
    if (cgpa >= 7.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((p, index) => (
            <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {studentInfo.name.split(' ')[0]}!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {studentInfo.department} • Semester {studentInfo.currentSemester} • {semester} {academicYear}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            <GraduationCap className="h-4 w-4 mr-2" />
            Enrollment: {studentInfo.enrollment}
          </span>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current CGPA</p>
              <p className={`text-2xl font-bold mt-2 ${getCgpaColor(studentInfo.cgpa)}`}>
                {studentInfo.cgpa.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall Attendance</p>
              <p className={`text-2xl font-bold mt-2 ${getAttendanceColor(studentInfo.attendance)}`}>
                {studentInfo.attendance}%
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CalendarCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Fees</p>
              <p className="text-2xl font-bold mt-2 text-red-600 dark:text-red-400">
                ₹{studentInfo.pendingFees.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current SGPA</p>
              <p className="text-2xl font-bold mt-2 text-blue-600 dark:text-blue-400">
                {studentInfo.sgpa.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Schedule</h3>
            <button
              onClick={() => navigate('/student/timetable')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center"
            >
              View Full Timetable
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No classes scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaySchedule.map((item, index) => (
                <div key={index} className="flex items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.subject}</h4>
                      <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                        {item.code}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        {item.time}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-2" />
                        {item.room}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {item.faculty}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <button
              onClick={() => navigate('/student/notifications')}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentNotifications.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No notifications</p>
            ) : (
              recentNotifications.map(notif => (
                <div key={notif.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <Bell className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-wise Attendance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject-wise Attendance</h3>
          {attendanceData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No attendance data available
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="percentage" fill="#8b5cf6" name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* CGPA Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">CGPA Progress</h3>
          {semesterResults.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No results data available
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={semesterResults} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semester" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="sgpa" stroke="#8b5cf6" name="SGPA" strokeWidth={2} />
                  <Line type="monotone" dataKey="cgpa" stroke="#10b981" name="CGPA" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/student/attendance')}
          className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
        >
          <CalendarCheck className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">View Attendance</p>
        </button>
        <button
          onClick={() => navigate('/student/results')}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
        >
          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Check Results</p>
        </button>
        <button
          onClick={() => navigate('/student/timetable')}
          className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
        >
          <Calendar className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">View Timetable</p>
        </button>
        <button
          onClick={() => navigate('/student/fees')}
          className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
        >
          <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Fee Details</p>
        </button>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <p>Last updated: {new Date().toLocaleString()} • {semester} {academicYear} Semester</p>
        <p className="mt-1">Batch: {studentInfo.batch} • Current Semester: {studentInfo.currentSemester}</p>
      </div>
    </div>
  );
};

export default StudentDashboard;
