import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { supabase } from '../../config/supabase';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  ChevronRight
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

const FacultyAnalytics = () => {
  const { user } = useAuth();
  const { semester, academicYear } = useSemester();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalStudents: 0,
    avgMarks: 0,
    passRate: 0,
    topPerformers: []
  });

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id, semester, academicYear]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch results data for analytics
      const { data: results, error } = await supabase
        .from('results')
        .select(`
          *,
          users!student_id (
            first_name,
            last_name
          ),
          courses (
            course_code,
            course_name
          )
        `)
        .eq('faculty_id', user.id)
        .eq('semester_type', semester)
        .eq('academic_year', academicYear);

      if (error) throw error;

      // Calculate analytics
      const totalStudents = new Set(results?.map(r => r.student_id)).size;
      const avgMarks = results?.length > 0 
        ? (results.reduce((sum, r) => sum + ((r.marks_obtained / r.total_marks) * 100), 0) / results.length).toFixed(1)
        : 0;
      const passedStudents = results?.filter(r => (r.marks_obtained / r.total_marks) >= 0.4).length || 0;
      const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(0) : 0;

      // Get top performers
      const topPerformers = results
        ?.sort((a, b) => (b.marks_obtained / b.total_marks) - (a.marks_obtained / a.total_marks))
        .slice(0, 4)
        .map(r => ({
          name: `${r.users.first_name} ${r.users.last_name}`,
          course: r.courses?.course_code || 'N/A',
          marks: ((r.marks_obtained / r.total_marks) * 100).toFixed(1),
          grade: r.grade
        })) || [];

      setAnalyticsData({
        totalStudents,
        avgMarks,
        passRate,
        topPerformers
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Analytics</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {semester} {academicYear} • {user?.department}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Marks</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{analyticsData.avgMarks}%</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pass Rate</p>
              <p className="text-2xl font-semibold mt-2 text-green-600 dark:text-green-400">{analyticsData.passRate}%</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{analyticsData.totalStudents}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Top Performers</p>
              <p className="text-2xl font-semibold mt-2 text-yellow-600 dark:text-yellow-400">{analyticsData.topPerformers.length}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {analyticsData.topPerformers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performers</h3>
          <div className="space-y-3">
            {analyticsData.topPerformers.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.course}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">{student.marks}%</p>
                  <p className="text-xs text-gray-500">{student.grade}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analyticsData.totalStudents === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Analytics Data</h3>
          <p className="text-gray-500 dark:text-gray-400">Analytics will appear once results are published</p>
        </div>
      )}
    </div>
  );
};

export default FacultyAnalytics;
