import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import {
  BarChart3,
  Download,
  Upload,
  Save,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Award,
  TrendingUp,
  Users,
  BookOpen,
  FileText,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

const FacultyResults = () => {
  const { user } = useAuth();
  const { semester, academicYear } = useSemester();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedCourseCode = queryParams.get('course') || '';

  const [selectedCourse, setSelectedCourse] = useState(selectedCourseCode);
  const [selectedExamType, setSelectedExamType] = useState('midterm');
  const [searchTerm, setSearchTerm] = useState('');
  const [resultsData, setResultsData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
    }
  }, [user?.id, semester, academicYear]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('course_code');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchResults();
    }
  }, [selectedCourse, selectedExamType]);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          users!student_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('course_id', selectedCourse)
        .eq('exam_type', selectedExamType)
        .eq('semester_type', semester)
        .eq('academic_year', academicYear);

      if (error) throw error;

      const formattedData = (data || []).map(r => ({
        id: r.student_id,
        name: `${r.users.first_name} ${r.users.last_name}`,
        enrollment: r.users.email,
        marks: r.marks_obtained,
        total: r.total_marks,
        percentage: ((r.marks_obtained / r.total_marks) * 100).toFixed(1),
        grade: r.grade,
        status: r.marks_obtained >= (r.total_marks * 0.4) ? 'passed' : 'failed'
      }));

      setResultsData(formattedData);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
    }
  };

  const handleMarkChange = (id, field, value) => {
    setResultsData(prev => prev.map(student => {
      if (student.id === id) {
        const updatedStudent = { ...student, [field]: value };
        if (field === 'marks') {
          const marks = parseFloat(value) || 0;
          const total = student.total;
          const percentage = ((marks / total) * 100).toFixed(1);
          updatedStudent.percentage = percentage;
          updatedStudent.grade = calculateGrade(percentage);
          updatedStudent.status = percentage >= 40 ? 'passed' : 'failed';
        }
        return updatedStudent;
      }
      return student;
    }));
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'D';
  };

  const handleSave = async () => {
    if (!selectedCourse || resultsData.length === 0) {
      toast.error('No results data to save');
      return;
    }

    try {
      setSaving(true);

      // Prepare results for upsert
      const resultsToSave = resultsData.map(student => ({
        student_id: student.id,
        course_id: selectedCourse,
        faculty_id: user.id,
        marks_obtained: parseFloat(student.marks),
        total_marks: parseFloat(student.total),
        grade: student.grade,
        grade_point: getGradePoint(student.grade),
        exam_type: selectedExamType,
        semester_type: semester,
        academic_year: academicYear,
        is_approved: false
      }));

      // Delete existing results for this exam
      await supabase
        .from('results')
        .delete()
        .eq('course_id', selectedCourse)
        .eq('exam_type', selectedExamType)
        .eq('semester_type', semester)
        .eq('academic_year', academicYear);

      // Insert new results
      const { error } = await supabase
        .from('results')
        .insert(resultsToSave);

      if (error) throw error;

      toast.success('Results saved successfully!');
    } catch (error) {
      console.error('Error saving results:', error);
      toast.error('Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  const getGradePoint = (grade) => {
    const gradePoints = {
      'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4
    };
    return gradePoints[grade] || 0;
  };

  const handlePublish = () => {
    toast.success('Results published to students!');
  };

  const handleDownloadTemplate = () => {
    toast.success('Template downloaded');
  };

  const filteredStudents = resultsData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStats = () => {
    const total = resultsData.length;
    const passed = resultsData.filter(s => s.status === 'passed').length;
    const failed = resultsData.filter(s => s.status === 'failed').length;
    const passPercentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    const avgMarks = resultsData.reduce((sum, s) => sum + (s.marks || 0), 0) / total || 0;

    return { total, passed, failed, passPercentage, avgMarks: avgMarks.toFixed(1) };
  };

  const stats = getStats();

  const examTypes = [
    { value: 'midterm', label: 'Mid Term Examination' },
    { value: 'final', label: 'Final Examination' },
    { value: 'quiz1', label: 'Quiz 1' },
    { value: 'quiz2', label: 'Quiz 2' },
    { value: 'assignment1', label: 'Assignment 1' },
    { value: 'assignment2', label: 'Assignment 2' },
    { value: 'practical', label: 'Practical Exam' },
    { value: 'oral', label: 'Oral Exam' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Results Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {semester} {academicYear} • {user?.department}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Template
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </button>
          <button
            onClick={handlePublish}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            <Award className="h-4 w-4 mr-2" />
            Publish Results
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Choose a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.code}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Exam Type
            </label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {examTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4 inline mr-2" />
              {saving ? 'Saving...' : 'Save Results'}
            </button>
          </div>
        </div>
      </div>

      {selectedCourse && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Passed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.passed}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pass %</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.passPercentage}%</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Average</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.avgMarks}%</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrollment</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marks</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Percentage</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-green-700 dark:text-green-300">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {student.enrollment}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          value={student.marks}
                          onChange={(e) => handleMarkChange(student.id, 'marks', e.target.value)}
                          className="w-20 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          min="0"
                          max={student.total}
                        />
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                        {student.total}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-medium ${
                          student.percentage >= 75 ? 'text-green-600' :
                          student.percentage >= 60 ? 'text-blue-600' :
                          student.percentage >= 40 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {student.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          student.grade === 'A+' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          student.grade === 'A' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          student.grade === 'B+' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                          student.grade === 'B' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' :
                          student.grade === 'C+' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {student.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {student.status === 'passed' ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredStudents.length} of {resultsData.length} students
                </p>
                <div className="flex items-center space-x-2">
                  <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="px-3 py-1 bg-green-600 text-white rounded-lg">1</button>
                  <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">2</button>
                  <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">3</button>
                  <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!selectedCourse && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Course</h3>
          <p className="text-gray-500 dark:text-gray-400">Choose a course and exam type to manage results</p>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Upload Results</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop your CSV file here, or click to browse
              </p>
              <p className="text-xs text-gray-500">Supported formats: .csv, .xlsx (Max 5MB)</p>
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Choose File
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Please use the template format. Download template from the button above.
              </p>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyResults;