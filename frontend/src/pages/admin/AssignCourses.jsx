import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import {
  User,
  BookOpen,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AssignCourses = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCourses, setStudentCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          department,
          student_details (
            enrollment_number,
            current_semester
          )
        `)
        .eq('role', 'student')
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('semester', { ascending: true })
        .order('course_name', { ascending: true });

      if (coursesError) throw coursesError;

      setStudents(studentsData || []);
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentCourses = async (studentId) => {
    try {
      // First get enrollments
      const { data: enrollments, error: enrollError } = await supabase
        .from('student_enrollments')
        .select('id, course_id, enrollment_date, status')
        .eq('student_id', studentId);

      if (enrollError) throw enrollError;

      // Then get course details for each enrollment
      const enrollmentsWithCourses = [];
      if (enrollments && enrollments.length > 0) {
        for (const enrollment of enrollments) {
          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('id, course_code, course_name, department, semester, credits')
            .eq('id', enrollment.course_id)
            .single();

          if (!courseError && courseData) {
            enrollmentsWithCourses.push({
              ...enrollment,
              courses: courseData
            });
          }
        }
      }

      setStudentCourses(enrollmentsWithCourses);

      // Filter available courses (not already enrolled)
      const enrolledCourseIds = enrollmentsWithCourses.map(enrollment => enrollment.course_id);
      const available = courses.filter(course => !enrolledCourseIds.includes(course.id));
      setAvailableCourses(available);
    } catch (error) {
      console.error('Error fetching student courses:', error);
      toast.error('Failed to load student courses');
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    fetchStudentCourses(student.id);
  };

  const handleAssignCourse = async (courseId) => {
    if (!selectedStudent) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('student_enrollments')
        .insert({
          student_id: selectedStudent.id,
          course_id: courseId,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'active'
        });

      if (error) throw error;

      toast.success('Course assigned successfully!');
      fetchStudentCourses(selectedStudent.id);
    } catch (error) {
      console.error('Error assigning course:', error);
      toast.error('Failed to assign course');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCourse = async (enrollmentId) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('student_enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) throw error;

      toast.success('Course removed successfully!');
      fetchStudentCourses(selectedStudent.id);
    } catch (error) {
      console.error('Error removing course:', error);
      toast.error('Failed to remove course');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(student =>
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_details?.[0]?.enrollment_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assign Courses</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage course assignments for students
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Student</h2>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => handleStudentSelect(student)}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedStudent?.id === student.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {student.student_details?.[0]?.enrollment_number} • {student.department}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Semester {student.student_details?.[0]?.current_semester}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Assignment */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {selectedStudent ? (
            <>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Courses for {selectedStudent.first_name} {selectedStudent.last_name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedStudent.student_details?.[0]?.enrollment_number} • {selectedStudent.department}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Enrolled Courses */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Enrolled Courses</h3>
                  {studentCourses.length > 0 ? (
                    <div className="space-y-2">
                      {studentCourses.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {enrollment.courses.course_name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {enrollment.courses.course_code} • Semester {enrollment.courses.semester} • {enrollment.courses.credits} Credits
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveCourse(enrollment.id)}
                            disabled={saving}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No courses enrolled</p>
                  )}
                </div>

                {/* Available Courses */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Available Courses</h3>
                  {availableCourses.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availableCourses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {course.course_name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {course.course_code} • Semester {course.semester} • {course.credits} Credits
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAssignCourse(course.id)}
                            disabled={saving}
                            className="p-2 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/20 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No available courses</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Select a student to manage their courses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignCourses;