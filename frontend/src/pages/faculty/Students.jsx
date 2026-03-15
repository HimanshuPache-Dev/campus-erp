import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Eye,
  GraduationCap,
  Calendar,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronDown,
  MessageSquare,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const FacultyStudents = () => {
  const { user } = useAuth();
  const { semester, academicYear } = useSemester();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedCourseCode = queryParams.get('course') || '';

  const [selectedCourse, setSelectedCourse] = useState(selectedCourseCode);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [singleSemester, setSingleSemester] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [studentsData, setStudentsData] = useState([]);

  // Fetch courses assigned to faculty
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) return;

      // Temporarily show all courses since course_assignments doesn't exist
      const { data, error } = await supabase
        .from('courses')
        .select('id, course_code, course_name')
        .eq('is_active', true)
        .limit(10);

      if (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses');
      } else {
        const coursesData = data.map(item => ({
          id: item.id,
          code: item.course_code,
          name: item.course_name,
          students: 0
        }));
        setCourses(coursesData);
      }
    };

    fetchCourses();
  }, [user]);

  // Fetch students enrolled in faculty's courses
  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.id) return;
      setLoading(true);

      try {
        // Get all courses taught by this faculty (showing all for now)
        const { data: allCourses, error: courseError } = await supabase
          .from('courses')
          .select('id, course_code, course_name')
          .eq('is_active', true)
          .limit(10);

        if (courseError) throw courseError;

        // Show all students since course_assignments doesn't exist
        const { data: studentsData, error: studentsError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, department, student_details(enrollment_number, current_semester)')
          .eq('role', 'student')
          .eq('is_active', true)
          .limit(50);

        if (studentsError) throw studentsError;

        const formattedStudents = studentsData.map(student => ({
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          enrollment: student.student_details?.[0]?.enrollment_number || 'N/A',
          email: student.email,
          phone: 'N/A',
          course: 'N/A',
          courseName: 'Not Assigned',
          semester: student.student_details?.[0]?.current_semester || 1,
          attendance: 0,
          marks: 0,
          grade: 'N/A',
          status: 'active',
          lastActive: new Date().toISOString().split('T')[0],
          address: 'N/A',
          parentName: 'N/A',
          parentPhone: 'N/A'
        }));

        setStudentsData(formattedStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  // Filter students based on all criteria
  const filteredStudents = studentsData.filter(student => {
    const matchesCourse = !selectedCourse || student.course === selectedCourse;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.enrollment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemesterDropdown = selectedSemester === 'all' || student.semester.toString() === selectedSemester;
    
    let matchesFilter = true;
    if (semesterFilter === 'odd') {
      matchesFilter = student.semester % 2 === 1;
    } else if (semesterFilter === 'even') {
      matchesFilter = student.semester % 2 === 0;
    } else if (semesterFilter === 'single' && singleSemester) {
      matchesFilter = student.semester.toString() === singleSemester;
    }
    
    return matchesCourse && matchesSearch && matchesSemesterDropdown && matchesFilter;
  });

  // Get counts for odd/even
  const oddCount = studentsData.filter(s => s.semester % 2 === 1).length;
  const evenCount = studentsData.filter(s => s.semester % 2 === 0).length;
  
  // Get counts for individual semesters
  const semesterCounts = {
    1: studentsData.filter(s => s.semester === 1).length,
    2: studentsData.filter(s => s.semester === 2).length,
    3: studentsData.filter(s => s.semester === 3).length,
    4: studentsData.filter(s => s.semester === 4).length,
    5: studentsData.filter(s => s.semester === 5).length,
    6: studentsData.filter(s => s.semester === 6).length,
  };

  // Action Handlers
  const handleSendEmail = (student, e) => {
    e.stopPropagation();
    window.location.href = `mailto:${student.email}`;
    toast.success(`Opening email to ${student.name}`);
  };

  const handleCall = (student, e) => {
    e.stopPropagation();
    window.location.href = `tel:${student.phone}`;
    toast.success(`Calling ${student.name}`);
  };

  const handleViewDetails = (student, e) => {
    e.stopPropagation();
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleViewProfile = (student, e) => {
    e.stopPropagation();
    navigate(`/faculty/students/${student.id}`);
    toast.success(`Viewing ${student.name}'s profile`);
  };

  const handleSendMessage = (student, e) => {
    e.stopPropagation();
    toast.success(`Opening chat with ${student.name}`);
    // You can navigate to a chat page or open a modal
  };

  const handleMarkAttendance = (student, e) => {
    e.stopPropagation();
    navigate(`/faculty/attendance?student=${student.id}&course=${student.course}`);
    toast.success(`Mark attendance for ${student.name}`);
  };

  const handleViewResults = (student, e) => {
    e.stopPropagation();
    navigate(`/faculty/results?student=${student.id}`);
    toast.success(`Viewing ${student.name}'s results`);
  };

  const handleExportStudent = (student, e) => {
    e.stopPropagation();
    // Create a CSV with student data
    const csvContent = `Name,${student.name}\nEnrollment,${student.enrollment}\nEmail,${student.email}\nPhone,${student.phone}\nCourse,${student.courseName}\nSemester,${student.semester}\nAttendance,${student.attendance}%\nMarks,${student.marks}%\nGrade,${student.grade}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.name}_details.csv`;
    a.click();
    toast.success(`Exported ${student.name}'s data`);
  };

  const toggleActionMenu = (studentId, e) => {
    e.stopPropagation();
    setShowActionMenu(showActionMenu === studentId ? null : studentId);
  };

  const handleSingleSemesterSelect = (sem) => {
    setSingleSemester(sem);
    setSemesterFilter('single');
  };

  const clearFilters = () => {
    setSemesterFilter('all');
    setSingleSemester('');
    setSelectedSemester('all');
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 75) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (attendance >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Students</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {semester} {academicYear} • {user?.department}
          </p>
        </div>
        <button 
          onClick={() => {
            // Export all filtered students
            const csvContent = filteredStudents.map(s => 
              `${s.name},${s.enrollment},${s.email},${s.phone},${s.courseName},${s.semester},${s.attendance},${s.marks},${s.grade}`
            ).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `students_${semester}_${academicYear}.csv`;
            a.click();
            toast.success('Exporting student list');
          }}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Export List
        </button>
      </div>

      {/* Quick Filters - Odd/Even and Individual Semester Dropdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-4">
          {/* Odd/Even Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filter:</span>
              
              {/* Odd Semester Button */}
              <button
                onClick={() => {
                  setSemesterFilter('odd');
                  setSingleSemester('');
                }}
                className={`relative px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  semesterFilter === 'odd'
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📘</span>
                  <span>Odd Semesters (1,3,5)</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    semesterFilter === 'odd' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                  }`}>
                    {oddCount}
                  </span>
                </div>
              </button>

              {/* Even Semester Button */}
              <button
                onClick={() => {
                  setSemesterFilter('even');
                  setSingleSemester('');
                }}
                className={`relative px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  semesterFilter === 'even'
                    ? 'bg-green-600 text-white shadow-lg scale-105'
                    : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📗</span>
                  <span>Even Semesters (2,4,6)</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    semesterFilter === 'even' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                  }`}>
                    {evenCount}
                  </span>
                </div>
              </button>
            </div>

            {/* Individual Semester Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Or select:</span>
              <div className="relative">
                <select
                  value={singleSemester}
                  onChange={(e) => handleSingleSemesterSelect(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white cursor-pointer"
                >
                  <option value="">Individual Semester</option>
                  <option value="1">Semester 1 ({semesterCounts[1]} students)</option>
                  <option value="2">Semester 2 ({semesterCounts[2]} students)</option>
                  <option value="3">Semester 3 ({semesterCounts[3]} students)</option>
                  <option value="4">Semester 4 ({semesterCounts[4]} students)</option>
                  <option value="5">Semester 5 ({semesterCounts[5]} students)</option>
                  <option value="6">Semester 6 ({semesterCounts[6]} students)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(semesterFilter !== 'all' || singleSemester) && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Active Filters:</span>
                {semesterFilter === 'odd' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm font-medium">
                    Odd Semesters (1,3,5)
                  </span>
                )}
                {semesterFilter === 'even' && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
                    Even Semesters (2,4,6)
                  </span>
                )}
                {singleSemester && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm font-medium">
                    Semester {singleSemester}
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Course Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name, enrollment or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.code}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attendance</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marks</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 relative">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{student.enrollment}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">{student.courseName}</p>
                      <p className="text-xs text-gray-500">{student.course}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      student.semester % 2 === 1 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      Sem {student.semester}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAttendanceColor(student.attendance)}`}>
                      {student.attendance}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                    {student.marks}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(student.grade)}`}>
                      {student.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {student.status === 'active' ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Email Button */}
                      <button 
                        onClick={(e) => handleSendEmail(student, e)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors group"
                        title={`Email ${student.name}`}
                      >
                        <Mail className="h-4 w-4 text-gray-500 group-hover:text-blue-500" />
                      </button>
                      
                      {/* Phone Button */}
                      <button 
                        onClick={(e) => handleCall(student, e)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors group"
                        title={`Call ${student.name}`}
                      >
                        <Phone className="h-4 w-4 text-gray-500 group-hover:text-green-500" />
                      </button>
                      
                      {/* View Details Button */}
                      <button 
                        onClick={(e) => handleViewDetails(student, e)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors group"
                        title={`View ${student.name}'s details`}
                      >
                        <Eye className="h-4 w-4 text-gray-500 group-hover:text-purple-500" />
                      </button>
                      
                      {/* More Actions Button with Dropdown */}
                      <div className="relative">
                        <button 
                          onClick={(e) => toggleActionMenu(student.id, e)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors group"
                          title="More actions"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {showActionMenu === student.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProfile(student, e);
                                  setShowActionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                View Profile
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendMessage(student, e);
                                  setShowActionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Send Message
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAttendance(student, e);
                                  setShowActionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Mark Attendance
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewResults(student, e);
                                  setShowActionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                View Results
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportStudent(student, e);
                                  setShowActionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Export Data
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
              Showing {filteredStudents.length} of {studentsData.length} students
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredStudents.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Odd Sem (1,3,5)</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {filteredStudents.filter(s => s.semester % 2 === 1).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Even Sem (2,4,6)</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {filteredStudents.filter(s => s.semester % 2 === 0).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">A+ Students</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {filteredStudents.filter(s => s.grade === 'A+').length}
          </p>
        </div>
      </div>

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Student Details</h2>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-medium text-green-700 dark:text-green-300">
                    {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.enrollment}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{selectedStudent.email}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{selectedStudent.phone}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Course</p>
                  <p className="text-sm font-medium">{selectedStudent.courseName}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Semester</p>
                  <p className="text-sm font-medium">{selectedStudent.semester}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Attendance</p>
                  <p className="text-sm font-medium">{selectedStudent.attendance}%</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Marks</p>
                  <p className="text-sm font-medium">{selectedStudent.marks}%</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Grade</p>
                  <p className="text-sm font-medium">{selectedStudent.grade}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-medium">{selectedStudent.status}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleSendEmail(selectedStudent, new Event('click'))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </button>
                <button
                  onClick={() => handleCall(selectedStudent, new Event('click'))}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Phone className="h-4 w-4 inline mr-2" />
                  Call
                </button>
                <button
                  onClick={() => {
                    setShowStudentModal(false);
                    handleViewProfile(selectedStudent, new Event('click'));
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Eye className="h-4 w-4 inline mr-2" />
                  Full Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyStudents;