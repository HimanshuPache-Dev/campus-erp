import { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, DollarSign, Download, Loader } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../../services/supabase';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2', '#ca8a04', '#be185d'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="font-medium text-gray-900 dark:text-white text-sm">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs text-gray-600 dark:text-gray-400">
          {p.name}: <span className="font-medium" style={{ color: p.color }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalStudents: 0, totalFaculty: 0, totalCourses: 0, avgAttendance: 0 });
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [genderData, setGenderData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchStats(),
        fetchEnrollmentTrend(),
        fetchAttendanceTrend(),
        fetchDepartmentDistribution(),
        fetchPerformanceTrend(),
        fetchFeeCollection(),
        fetchGenderDistribution(),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const [studentsRes, facultyRes, coursesRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'faculty'),
      supabase.from('courses').select('id', { count: 'exact', head: true }),
    ]);
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('status')
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const totalRecords = attendanceData?.length || 0;
    const presentRecords = attendanceData?.filter(a => a.status === 'present').length || 0;
    const avgAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
    setStats({
      totalStudents: studentsRes.count || 0,
      totalFaculty: facultyRes.count || 0,
      totalCourses: coursesRes.count || 0,
      avgAttendance,
    });
  };

  const fetchEnrollmentTrend = async () => {
    const { data } = await supabase
      .from('users')
      .select('created_at, department')
      .eq('role', 'student')
      .order('created_at');
    if (!data) return;
    const monthCounts = {};
    data.forEach(student => {
      const month = new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    const chartData = Object.entries(monthCounts).slice(-6).map(([month, count]) => ({ month, students: count }));
    setEnrollmentData(chartData);
  };

  const fetchAttendanceTrend = async () => {
    const { data } = await supabase
      .from('attendance')
      .select('date, status')
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date');
    if (!data) return;
    const dailyStats = {};
    data.forEach(record => {
      const date = new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyStats[date]) dailyStats[date] = { date, present: 0, absent: 0, total: 0 };
      dailyStats[date].total++;
      if (record.status === 'present') dailyStats[date].present++;
      else dailyStats[date].absent++;
    });
    const chartData = Object.values(dailyStats).slice(-7).map(d => ({
      date: d.date,
      rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
    }));
    setAttendanceData(chartData);
  };

  const fetchDepartmentDistribution = async () => {
    const { data } = await supabase
      .from('users')
      .select('department')
      .eq('role', 'student')
      .not('department', 'is', null);
    if (!data) return;
    const deptCounts = {};
    data.forEach(s => {
      deptCounts[s.department] = (deptCounts[s.department] || 0) + 1;
    });
    const chartData = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));
    setDepartmentData(chartData);
  };

  const fetchPerformanceTrend = async () => {
    const { data } = await supabase
      .from('results')
      .select('semester, percentage')
      .not('percentage', 'is', null)
      .order('semester');
    if (!data) return;
    const semesterAvg = {};
    const semesterCount = {};
    data.forEach(r => {
      const sem = r.semester || 'Unknown';
      semesterAvg[sem] = (semesterAvg[sem] || 0) + r.percentage;
      semesterCount[sem] = (semesterCount[sem] || 0) + 1;
    });
    const chartData = Object.entries(semesterAvg).map(([semester, total]) => ({
      semester,
      avgMarks: Math.round(total / semesterCount[semester]),
    }));
    setPerformanceData(chartData);
  };

  const fetchFeeCollection = async () => {
    const { data } = await supabase
      .from('fees')
      .select('due_date, amount_paid, total_amount')
      .not('due_date', 'is', null)
      .order('due_date');
    if (!data) return;
    const monthlyFees = {};
    data.forEach(fee => {
      const month = new Date(fee.due_date).toLocaleDateString('en-US', { month: 'short' });
      if (!monthlyFees[month]) monthlyFees[month] = { month, collected: 0, pending: 0 };
      monthlyFees[month].collected += fee.amount_paid || 0;
      monthlyFees[month].pending += (fee.total_amount - (fee.amount_paid || 0));
    });
    const chartData = Object.values(monthlyFees).slice(-6);
    setFeeData(chartData);
  };

  const fetchGenderDistribution = async () => {
    const { data } = await supabase
      .from('student_details')
      .select('gender')
      .not('gender', 'is', null);
    if (!data) return;
    const genderCounts = {};
    data.forEach(s => {
      genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1;
    });
    const chartData = Object.entries(genderCounts).map(([name, value]) => ({ name, value }));
    setGenderData(chartData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center text-red-500">
        <p>Error loading analytics: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Comprehensive insights and statistics</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'blue' },
          { label: 'Total Faculty', value: stats.totalFaculty, icon: GraduationCap, color: 'green' },
          { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'purple' },
          { label: 'Avg Attendance', value: `${stats.avgAttendance}%`, icon: DollarSign, color: 'yellow' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{value}</p>
              </div>
              <div className={`p-3 bg-${color}-50 dark:bg-${color}-900/30 rounded-xl`}>
                <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Enrollment Trend</h3>
          {enrollmentData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No enrollment data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="students" stroke="#2563eb" name="Students" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Trend</h3>
          {attendanceData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No attendance data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#16a34a" name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Department Distribution</h3>
          {departmentData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No department data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={departmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Trend</h3>
          {performanceData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No performance data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="avgMarks" fill="#9333ea" name="Avg Marks" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fee Collection</h3>
          {feeData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No fee data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="collected" fill="#16a34a" name="Collected" />
                <Bar dataKey="pending" fill="#dc2626" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gender Distribution</h3>
          {genderData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No gender data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
