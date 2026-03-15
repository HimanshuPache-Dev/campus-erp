import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import {
  CalendarCheck,
  Calendar,
  Clock,
  Filter,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  BarChart3
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
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import toast from 'react-hot-toast';

const StudentAttendance = () => {
  const { user } = useAuth();
  const { semester, academicYear } = useSemester();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchAttendanceData();
    }
  }, [user?.id, semester, academicYear]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      // Fetch attendance records
      const { data: attendance, error } = await supabase
        .from('attendance')
        .select(`
          *,
          courses (
            course_code,
            course_name
          )
        `)
        .eq('student_id', user.id)
        .eq('semester_type', semester)
        .eq('academic_year', academicYear)
        .order('date', { ascending: false });

      if (error) throw error;

      setAttendanceData(attendance || []);

      // Get unique courses
      const uniqueCourses = [...new Set(attendance?.map(a => a.course_id))];
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .in('id', uniqueCourses);

      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    const total = attendanceData.length;
    const present = attendanceData.filter(a => a.status === 'present').length;
    const absent = attendanceData.filter(a => a.status === 'absent').length;
    const late = attendanceData.filter(a => a.status === 'late').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { total, present, absent, late, percentage };
  };

  const calculateSubjectWise = () => {
    const subjectMap = {};
    
    attendanceData.forEach(record => {
      const courseId = record.course_id;
      if (!subjectMap[courseId]) {
        const course = courses.find(c => c.id === courseId);
        subjectMap[courseId] = {
          subject: course?.course_name || 'Unknown',
          code: course?.course_code || 'N/A',
          present: 0,
          total: 0,
          percentage: 0,
          status: 'average'
        };
      }
      
      subjectMap[courseId].total++;
      if (record.status === 'present') {
        subjectMap[courseId].present++;
      }
    });

    return Object.values(subjectMap).map(item => {
      item.percentage = item.total > 0 ? ((item.present / item.total) * 100).toFixed(1) : 0;
      if (item.percentage >= 90) item.status = 'excellent';
      else if (item.percentage >= 75) item.status = 'good';
      else item.status = 'average';
      return item;
    });
  };

  const getFilteredRecords = () => {
    return attendanceData.filter(record => {
      const course = courses.find(c => c.id === record.course_id);
      const matchesSubject = selectedSubject === 'all' || course?.course_name === selectedSubject;
      const recordDate = new Date(record.date);
      const matchesMonth = recordDate.toLocaleString('default', { month: 'long' }) === selectedMonth;
      return matchesSubject && matchesMonth;
    });
  };

  const attendanceSummary = calculateSummary();
  const subjectWiseAttendance = calculateSubjectWise();
  const filteredRecords = getFilteredRecords();

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const subjects = ['all', ...courses.map(c => c.course_name)];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return { text: 'Excellent', color: 'text-green-600 bg-green-100' };
    if (percentage >= 75) return { text: 'Good', color: 'text-blue-600 bg-blue-100' };
    if (percentage >= 60) return { text: 'Average', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'Poor', color: 'text-red-600 bg-red-100' };
  };

  const pieData = [
    { name: 'Present', value: attendanceSummary.present, color: '#22c55e' },
    { name: 'Absent', value: attendanceSummary.absent, color: '#ef4444' },
    { name: 'Late', value: attendanceSummary.late, color: '#eab308' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((p, index) => (
            <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
              {p.name}: {p.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExport = () => {
    const headers = ['Date', 'Subject', 'Status', 'Time'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(r => {
        const course = courses.find(c => c.id === r.course_id);
        return `${r.date},${course?.course_name || 'Unknown'},${r.status},${r.marked_at || '-'}`;
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedMonth}_${semester}.csv`;
    a.click();
    toast.success('Attendance record exported');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (attendanceData.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Attendance Records</h3>
        <p className="text-gray-500 dark:text-gray-400">No attendance data available for this semester</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Attendance</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {user?.department} • {semester} {academicYear}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Classes</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendanceSummary.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Present</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{attendanceSummary.present}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Absent</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceSummary.absent}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Late</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{attendanceSummary.late}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Percentage</p>
          <p className={`text-2xl font-bold ${
            attendanceSummary.percentage >= 75 ? 'text-green-600' : 'text-red-600'
          }`}>
            {attendanceSummary.percentage}%
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-wise Attendance Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject-wise Attendance</h3>
          <div className="h-64">
            {subjectWiseAttendance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectWiseAttendance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="code" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="percentage" fill="#8b5cf6" name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
            )}
          </div>
        </div>

        {/* Attendance Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {pieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Subject-wise Details Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subject-wise Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Present/Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Percentage</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {subjectWiseAttendance.map((item, index) => {
                const status = getAttendanceStatus(item.percentage);
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.subject}</p>
                        <p className="text-xs text-gray-500">{item.code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-medium">{item.present}</span>/{item.total}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-semibold ${
                        item.percentage >= 75 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters for Detailed Records */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Showing {filteredRecords.length} records
          </p>
        </div>
      </div>

      {/* Detailed Attendance Records */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.map((record, index) => {
                const course = courses.find(c => c.id === record.course_id);
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{course?.course_name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {record.marked_at ? new Date(record.marked_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
              Attendance Status: {getAttendanceStatus(attendanceSummary.percentage).text}
            </span>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-400">
            {attendanceSummary.percentage >= 75 
              ? '✓ You are meeting the minimum attendance requirement' 
              : '⚠ Your attendance is below 75%. Please attend more classes.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
