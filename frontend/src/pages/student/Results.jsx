import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { supabase } from '../../config/supabase';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Award,
  BookOpen,
  ChevronRight,
  Star
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
import toast from 'react-hot-toast';

const StudentResults = () => {
  const { user } = useAuth();
  const { semester, academicYear } = useSemester();
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [loading, setLoading] = useState(true);
  const [resultsData, setResultsData] = useState([]);
  const [semesterHistory, setSemesterHistory] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchResults();
    }
  }, [user?.id, selectedSemester, semester, academicYear]);

  const fetchResults = async () => {
    try {
      setLoading(true);

      // Build query
      let query = supabase
        .from('results')
        .select(`
          *,
          courses (
            course_code,
            course_name,
            credits
          )
        `)
        .eq('student_id', user.id);

      // Filter by semester_type based on selection
      if (selectedSemester === 'current') {
        query = query.eq('semester_type', semester);
      }
      // 'all' shows all semesters, no filter needed

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      setResultsData(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const semesterOptions = [
    { value: 'current', label: 'Current Semester' },
    { value: 'all', label: 'All Semesters' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">Semester {label}</p>
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

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A+': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'A': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'B+': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      case 'B': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const handleDownload = () => {
    toast.success('Downloading result sheet');
  };

  const calculateTotalCredits = () => {
    return resultsData.reduce((sum, r) => sum + (r.courses?.credits || 0), 0);
  };

  const calculateTotalMarks = () => {
    return resultsData.reduce((sum, r) => sum + (r.marks_obtained || 0), 0);
  };

  const calculateTotalMaxMarks = () => {
    return resultsData.reduce((sum, r) => sum + (r.total_marks || 0), 0);
  };

  const calculateSGPA = () => {
    const totalPoints = resultsData.reduce((sum, r) => {
      return sum + ((r.grade_point || 0) * (r.courses?.credits || 0));
    }, 0);
    const totalCredits = calculateTotalCredits();
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (resultsData.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Results Available</h3>
        <p className="text-gray-500 dark:text-gray-400">Results have not been published yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Results</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {user?.department} • {semester} {academicYear}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            {semesterOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Current SGPA</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{calculateSGPA()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Marks</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {calculateTotalMarks()}/{calculateTotalMaxMarks()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Percentage</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {calculateTotalMaxMarks() > 0 ? ((calculateTotalMarks() / calculateTotalMaxMarks()) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Credits</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{calculateTotalCredits()}</p>
        </div>
      </div>

      {/* Current Semester Results */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedSemester === 'current' ? 'Current Semester' : `Semester ${selectedSemester}`} Results
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Marks</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Percentage</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {resultsData.map((result, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{result.courses?.course_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{result.courses?.course_code || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-purple-600">{result.marks_obtained}</td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{result.total_marks}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-semibold ${
                      ((result.marks_obtained / result.total_marks) * 100) >= 90 ? 'text-green-600' :
                      ((result.marks_obtained / result.total_marks) * 100) >= 75 ? 'text-blue-600' :
                      ((result.marks_obtained / result.total_marks) * 100) >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {((result.marks_obtained / result.total_marks) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(result.grade)}`}>
                      {result.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{result.courses?.credits || 0}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-medium">
              <tr>
                <td className="px-6 py-4 text-gray-900 dark:text-white">Total</td>
                <td className="px-6 py-4 text-center text-purple-600">{calculateTotalMarks()}</td>
                <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{calculateTotalMaxMarks()}</td>
                <td className="px-6 py-4 text-center text-purple-600">
                  {calculateTotalMaxMarks() > 0 ? ((calculateTotalMarks() / calculateTotalMaxMarks()) * 100).toFixed(1) : 0}%
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    SGPA: {calculateSGPA()}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{calculateTotalCredits()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">Overall Performance</h4>
          <p className="text-3xl font-bold mb-2">{calculateSGPA()} SGPA</p>
          <p className="text-sm opacity-90">Current Semester</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">Best Subject</h4>
          <p className="text-xl font-bold mb-1">
            {resultsData.length > 0 ? resultsData.reduce((best, curr) => 
              (curr.marks_obtained / curr.total_marks) > (best.marks_obtained / best.total_marks) ? curr : best
            ).courses?.course_name : 'N/A'}
          </p>
          <p className="text-sm opacity-90">
            {resultsData.length > 0 ? 
              ((resultsData.reduce((best, curr) => 
                (curr.marks_obtained / curr.total_marks) > (best.marks_obtained / best.total_marks) ? curr : best
              ).marks_obtained / resultsData.reduce((best, curr) => 
                (curr.marks_obtained / curr.total_marks) > (best.marks_obtained / best.total_marks) ? curr : best
              ).total_marks) * 100).toFixed(1) + '%' : '0%'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <h4 className="text-lg font-semibold mb-2">Credits Earned</h4>
          <p className="text-3xl font-bold mb-2">{calculateTotalCredits()}</p>
          <p className="text-sm opacity-90">This Semester</p>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;
