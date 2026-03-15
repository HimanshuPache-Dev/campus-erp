import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { supabase } from '../../config/supabase';
import {
  CalendarCheck,
  Calendar,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import toast from 'react-hot-toast';

const StudentAttendance = () => {
  const { user } = useAuth();
  const { semester, academicYear } = useSemester();
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  const [studentInfo, setStudentInfo] = useState({});
  const [attendanceSummary, setAttendanceSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0
  });
  const [subjectWiseAttendance, setSubjectWiseAttendance] = useState([]);
  const [detailedRecords, setDetailedRecords] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchAttendanceData();
    }
  }, [user?.id, semester, academicYear]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      // Fetch student details
      const { data: userData } = await supabase
        .from('users')
        .select('*, student_details(*)')
        .eq('id', user.id)
        .single();

      if (userData) {
        setStudentInfo({
          name: `${userData.first_name} ${userData.last_name}`,
          enrollment: userData.student_details?.[0]?.enrollment_number || 'N/A',
          department: userData.department || 'N/A',
          currentSemester: userData.student_details?.[0]?.current_semester || 1
        });
      }

      // Fetch attendance records
      const { data: attendanceRecords } = await supabase
        .from('attendance')
        .select(`
          *,
          courses (course_name, course_code)
        `)
        .eq('student_id', user.id)
        .order('date', { ascending: false });

      if (attendanceRecords) {
        // Calculate summary
        const total = attendanceRecords.length;
        const present = attendanceRecords.filter(r => r.status === 'present').length;
        const absent = attendanceRecords.filter(r => r.status === 'absent').length;
        const late = attendanceRecords.filter(r => r.status === 'late').length;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        setAttendanceSummary({ total, present, absent, late, percentage });

        // Calculate subject-wise attendance
        const subjectMap = {};
        attendanceRecords.forEach(record => {
          const courseCode = record.courses?.course_code || 'Unknown';
          const courseName = record.courses?.course_name || 'Unknown';
          
          if (!subjectMap[courseCode]) {
            subjectMap[courseCode] = {
              subject: courseName,
              code: courseCode,
              present: 0,
              total: 0
            };
          }
          
          subjectMap[courseCode].total++;
          if (record.status === 'present') subjectMap[courseCode].present++;
        });

        const subjectWise = Object.values(subjectMap).map(s => ({
          ...s,
          percentage: s.total > 0 ? ((s.present / s.total) * 100).toFixed(1) : 0,
          status: s.total > 0 && (s.present / s.total) >= 0.75 ? 'good' : 'average'
        }));

        setSubjectWiseAttendance(subjectWise);
        setDetailedRecords(attendanceRecords);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const subjects = ['all', ...subjectWiseAttendance.map(s => s.subject)];

  const filteredRecords = detailedRecords.filter(record => {
    const matchesSubject = selectedSubject === 'all' || record.courses?.course_name === selectedSubject;
    const recordMonth = new Date(record.date).toLocaleString('default', { month: 'long' });
    const matchesMonth = recordMonth === selectedMonth;
    return matchesSubject && matchesMonth;
  });

  const pieData = [
    { name: 'Present', value: attendanceSummary.present, color: '#22c55e' },
    { name: 'Absent', value: attendanceSummary.absent, color: '#ef4444' },
    { name: 'Late', value: attendanceSummary.late, color: '#eab308' },
  ];

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

  const handleExport = () => {
    const headers = ['Date', 'Subject', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(r => 
        `${r.date},${r.courses?.course_name || 'N/A'},${r.status}`
      )
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading attendance...</p>
        </div>
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
            {studentInfo.department} • Semester {studentInfo.currentSemester} • {semester} {academicYear}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-wise Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject-wise Attendance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectWiseAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="code" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="percentage" fill="#8b5cf6" name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Distribution</h3>
          <div className="h-64 flex items-center justify-center">
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
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
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
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
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

      {/* Detailed Records Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                    No attendance records found for selected filters
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {record.courses?.course_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {getStatusIcon(record.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
              Attendance Status: {attendanceSummary.percentage >= 75 ? 'Good' : 'Below Requirement'}
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
