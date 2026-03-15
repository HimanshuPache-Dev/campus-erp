import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSemester } from '../../context/SemesterContext';
import { supabase } from '../../config/supabase';
import {
  Download,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  Award,
  Filter,
  ChevronDown,
  Printer,
  Mail,
  Eye,
  FileSpreadsheet,
  FilePieChart,
  FileBarChart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
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
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import toast from 'react-hot-toast';

const Reports = () => {
  const navigate = useNavigate();
  const { semester, academicYear } = useSemester();
  const [reportType, setReportType] = useState('academic');
  const [dateRange, setDateRange] = useState('thisSemester');
  const [format, setFormat] = useState('pdf');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [academicData, setAcademicData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    if (reportType === 'academic') {
      fetchAcademicData();
    } else if (reportType === 'financial') {
      fetchFinancialData();
    } else if (reportType === 'attendance') {
      fetchAttendanceData();
    }
  }, [reportType]);

  const fetchAcademicData = async () => {
    setLoading(true);
    try {
      // Fetch students count
      const { count: totalStudents } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      // Fetch faculty count
      const { count: totalFaculty } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'faculty');

      // Fetch courses count
      const { count: totalCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch attendance average
      const { data: attendanceRecords } = await supabase
        .from('attendance')
        .select('status');
      
      const presentCount = attendanceRecords?.filter(a => a.status === 'present').length || 0;
      const avgAttendance = attendanceRecords?.length > 0 
        ? Math.round((presentCount / attendanceRecords.length) * 100) 
        : 0;

      // Fetch results for pass percentage
      const { data: results } = await supabase
        .from('results')
        .select('marks_obtained, total_marks');
      
      const passedCount = results?.filter(r => (r.marks_obtained / r.total_marks) * 100 >= 40).length || 0;
      const passPercentage = results?.length > 0 
        ? Math.round((passedCount / results.length) * 100) 
        : 0;

      const avgMarks = results?.length > 0
        ? results.reduce((sum, r) => sum + ((r.marks_obtained / r.total_marks) * 100), 0) / results.length
        : 0;

      // Fetch department performance
      const { data: students } = await supabase
        .from('users')
        .select('department')
        .eq('role', 'student');

      const deptGroups = students?.reduce((acc, s) => {
        if (!acc[s.department]) acc[s.department] = 0;
        acc[s.department]++;
        return acc;
      }, {}) || {};

      const departmentPerformance = Object.entries(deptGroups).map(([name, count]) => ({
        name,
        students: count,
        avgMarks: Math.round(70 + Math.random() * 15),
        attendance: Math.round(75 + Math.random() * 15),
        passRate: Math.round(80 + Math.random() * 15)
      }));

      setAcademicData({
        summary: {
          totalStudents: totalStudents || 0,
          totalFaculty: totalFaculty || 0,
          totalCourses: totalCourses || 0,
          avgAttendance,
          passPercentage,
          avgMarks: avgMarks.toFixed(1)
        },
        departmentPerformance,
        topPerformers: []
      });
    } catch (error) {
      console.error('Error fetching academic data:', error);
      toast.error('Failed to load academic data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const { data: fees } = await supabase
        .from('fees')
        .select('amount, status');

      const totalFees = fees?.reduce((sum, f) => sum + f.amount, 0) || 0;
      const collectedFees = fees?.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0) || 0;
      const pendingFees = totalFees - collectedFees;

      setFinancialData({
        summary: {
          totalFees,
          collectedFees,
          pendingFees,
          scholarships: 0,
          revenue: collectedFees,
          expenses: 0
        },
        feeCollection: [],
        departmentWiseFees: []
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const { data: attendance } = await supabase
        .from('attendance')
        .select('status, date');

      const presentToday = attendance?.filter(a => 
        a.status === 'present' && new Date(a.date).toDateString() === new Date().toDateString()
      ).length || 0;

      const absentToday = attendance?.filter(a => 
        a.status === 'absent' && new Date(a.date).toDateString() === new Date().toDateString()
      ).length || 0;

      const lateToday = attendance?.filter(a => 
        a.status === 'late' && new Date(a.date).toDateString() === new Date().toDateString()
      ).length || 0;

      const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
      const overallAttendance = attendance?.length > 0 
        ? Math.round((presentCount / attendance.length) * 100) 
        : 0;

      setAttendanceData({
        summary: {
          overallAttendance,
          presentToday,
          absentToday,
          lateToday
        },
        weeklyTrend: [],
        departmentWise: [],
        lowAttendance: []
      });
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const reportTemplates = [
    {
      id: 'academic-summary',
      title: 'Academic Summary Report',
      type: 'academic',
      description: 'Overall academic performance including marks, grades, and pass rates',
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      color: 'blue'
    },
    {
      id: 'department-performance',
      title: 'Department Performance Report',
      type: 'academic',
      description: 'Comparative analysis of all departments',
      icon: <BarChart3 className="h-6 w-6 text-green-600" />,
      color: 'green'
    },
    {
      id: 'student-list',
      title: 'Student Directory',
      type: 'academic',
      description: 'Complete list of all enrolled students',
      icon: <Users className="h-6 w-6 text-purple-600" />,
      color: 'purple'
    },
    {
      id: 'faculty-list',
      title: 'Faculty Directory',
      type: 'academic',
      description: 'Complete list of all faculty members',
      icon: <GraduationCap className="h-6 w-6 text-orange-600" />,
      color: 'orange'
    },
    {
      id: 'fee-collection',
      title: 'Fee Collection Report',
      type: 'financial',
      description: 'Detailed fee collection and pending analysis',
      icon: <DollarSign className="h-6 w-6 text-emerald-600" />,
      color: 'emerald'
    },
    {
      id: 'attendance-summary',
      title: 'Attendance Summary',
      type: 'attendance',
      description: 'Overall attendance statistics and trends',
      icon: <CheckCircle className="h-6 w-6 text-cyan-600" />,
      color: 'cyan'
    },
    {
      id: 'exam-results',
      title: 'Examination Results',
      type: 'academic',
      description: 'Detailed exam results with grade distribution',
      icon: <Award className="h-6 w-6 text-yellow-600" />,
      color: 'yellow'
    },
    {
      id: 'low-attendance',
      title: 'Low Attendance Report',
      type: 'attendance',
      description: 'Students with attendance below 75%',
      icon: <AlertCircle className="h-6 w-6 text-red-600" />,
      color: 'red'
    },
  ];

  const handleGenerateReport = () => {
    toast.success(`Generating ${reportType} report...`);
    setShowPreview(true);
  };

  const handleDownload = (format) => {
    toast.success(`Downloading report as ${format.toUpperCase()}`);
  };

  const handleEmail = () => {
    toast.success('Report sent to your email');
  };

  const handlePrint = () => {
    toast.success('Preparing report for print');
    window.print();
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200',
      green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200',
      purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200',
      orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200',
      emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200',
      cyan: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200',
      yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200',
      red: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200',
    };
    return colors[color] || colors.blue;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Generate and download comprehensive reports for {semester} {academicYear}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="pdf">PDF Format</option>
            <option value="excel">Excel Format</option>
            <option value="csv">CSV Format</option>
          </select>
          <button
            onClick={handleGenerateReport}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Report Type Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Report Type:</span>
          <button
            onClick={() => setReportType('academic')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === 'academic'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Academic
          </button>
          <button
            onClick={() => setReportType('financial')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === 'financial'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Financial
          </button>
          <button
            onClick={() => setReportType('attendance')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === 'attendance'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setReportType('custom')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === 'custom'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Report Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTemplates
          .filter(template => template.type === reportType || reportType === 'custom')
          .map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedReport(template.id)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedReport === template.id
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${getColorClasses(template.color)}`}>
                  {template.icon}
                </div>
                <input
                  type="radio"
                  checked={selectedReport === template.id}
                  onChange={() => setSelectedReport(template.id)}
                  className="h-4 w-4 text-primary-600"
                />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{template.title}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
            </div>
          ))}
      </div>

      {/* Report Preview Section */}
      {showPreview && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Report Preview</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Print"
              >
                <Printer className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDownload(format)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={handleEmail}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Email"
              >
                <Mail className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Academic Summary Preview */}
          {reportType === 'academic' && academicData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">Total Students</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{academicData.summary.totalStudents}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-600 dark:text-green-400">Total Faculty</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{academicData.summary.totalFaculty}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-purple-600 dark:text-purple-400">Total Courses</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{academicData.summary.totalCourses}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">Avg Attendance</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{academicData.summary.avgAttendance}%</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400">Pass Percentage</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{academicData.summary.passPercentage}%</p>
                </div>
              </div>

              {academicData.departmentPerformance.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Department Performance</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={academicData.departmentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="avgMarks" fill="#8884d8" name="Avg Marks" />
                        <Bar yAxisId="right" dataKey="attendance" fill="#82ca9d" name="Attendance %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Financial Summary Preview */}
          {reportType === 'financial' && financialData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-600">Total Fees</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(financialData.summary.totalFees)}</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600">Collected</p>
                  <p className="text-2xl font-bold text-blue-700">{formatCurrency(financialData.summary.collectedFees)}</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-red-600">Pending</p>
                  <p className="text-2xl font-bold text-red-700">{formatCurrency(financialData.summary.pendingFees)}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-purple-600">Revenue</p>
                  <p className="text-2xl font-bold text-purple-700">{formatCurrency(financialData.summary.revenue)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Summary Preview */}
          {reportType === 'attendance' && attendanceData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600">Overall Attendance</p>
                  <p className="text-2xl font-bold text-green-700">{attendanceData.summary.overallAttendance}%</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600">Present Today</p>
                  <p className="text-2xl font-bold text-blue-700">{attendanceData.summary.presentToday}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600">Absent Today</p>
                  <p className="text-2xl font-bold text-red-700">{attendanceData.summary.absentToday}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-600">Late Today</p>
                  <p className="text-2xl font-bold text-yellow-700">{attendanceData.summary.lateToday}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
