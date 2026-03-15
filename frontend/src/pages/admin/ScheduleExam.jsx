import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSemester } from '../../context/SemesterContext';
import { supabase } from '../../config/supabase';
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  GraduationCap,
  MapPin,
  DollarSign,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ScheduleExam = () => {
  const navigate = useNavigate();
  const { semester, academicYear } = useSemester();
  const [activeTab, setActiveTab] = useState('schedule');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    courseId: '',
    examDate: '',
    examTime: '',
    duration: '3',
    examType: 'theory',
    examRoom: '',
    totalMarks: '100',
    passingMarks: '40',
    description: '',
    specialInstructions: '',
    reexamDate: '',
    reexamFee: '',
    reexamAvailable: false,
  });

  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);

  // Fetch courses from Supabase
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          course_code,
          course_name,
          department,
          semester,
          course_assignments(
            faculty_id,
            users(first_name, last_name)
          )
        `)
        .eq('is_active', true)
        .order('course_code');

      if (error) throw error;

      const formattedCourses = data.map(course => ({
        id: course.id,
        code: course.course_code,
        name: course.course_name,
        department: course.department,
        semester: course.semester,
        faculty: course.course_assignments?.[0]?.users 
          ? `${course.course_assignments[0].users.first_name} ${course.course_assignments[0].users.last_name}`
          : 'Not Assigned'
      }));

      setCourses(formattedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'all',
    'Computer Engineering',
    'Information Technology',
    'Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering'
  ];

  const examTypes = ['theory', 'practical', 'oral', 'termwork'];
  const rooms = ['Hall A', 'Hall B', 'Hall C', 'Lab 1', 'Lab 2', 'Lab 3', 'Room 401', 'Room 402'];

  const handleScheduleExam = async () => {
    if (!formData.courseId || !formData.examDate || !formData.examTime || !formData.examRoom) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const selectedCourse = courses.find(c => c.id === formData.courseId);
      
      // In a real implementation, you would save this to a separate exams table
      // For now, we'll just add it to local state
      const newExam = {
        id: Date.now(),
        courseCode: selectedCourse.code,
        courseName: selectedCourse.name,
        department: selectedCourse.department,
        semester: selectedCourse.semester,
        examDate: formData.examDate,
        examTime: formData.examTime,
        duration: formData.duration + ' hours',
        examType: formData.examType,
        examRoom: formData.examRoom,
        totalMarks: parseInt(formData.totalMarks),
        passingMarks: parseInt(formData.passingMarks),
        faculty: selectedCourse.faculty,
        status: 'scheduled',
        studentsEnrolled: 0, // Would be fetched from enrollments
        reexamDate: formData.reexamAvailable ? formData.reexamDate : null,
        reexamFee: formData.reexamAvailable ? formData.reexamFee : null,
        description: formData.description,
        specialInstructions: formData.specialInstructions
      };

      setExams([newExam, ...exams]);
      toast.success('Exam scheduled successfully!');
      setShowForm(false);
      setFormData({
        courseId: '',
        examDate: '',
        examTime: '',
        duration: '3',
        examType: 'theory',
        examRoom: '',
        totalMarks: '100',
        passingMarks: '40',
        description: '',
        specialInstructions: '',
        reexamDate: '',
        reexamFee: '',
        reexamAvailable: false,
      });
    } catch (error) {
      console.error('Error scheduling exam:', error);
      toast.error('Failed to schedule exam');
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.faculty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || exam.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getExamTypeIcon = (type) => {
    switch(type) {
      case 'theory': return <BookOpen className="h-4 w-4" />;
      case 'practical': return <Users className="h-4 w-4" />;
      case 'oral': return <GraduationCap className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Exam</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {semester} {academicYear} Semester Exams
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Schedule New Exam'}
        </button>
      </div>

      {/* Schedule Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schedule New Exam</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Course <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Choose a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name} (Sem {course.semester})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exam Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exam Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.examTime}
                onChange={(e) => setFormData({...formData, examTime: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (hours)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="1"
                max="6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exam Type
              </label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({...formData, examType: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {examTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exam Room <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.examRoom}
                onChange={(e) => setFormData({...formData, examRoom: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Room</option>
                {rooms.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Marks
              </label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({...formData, totalMarks: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Passing Marks
              </label>
              <input
                type="number"
                value={formData.passingMarks}
                onChange={(e) => setFormData({...formData, passingMarks: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Any additional information about the exam"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Special Instructions
              </label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Any special instructions for students"
              />
            </div>
          </div>

          {/* Re-exam Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={formData.reexamAvailable}
                onChange={(e) => setFormData({...formData, reexamAvailable: e.target.checked})}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Make re-exam available</span>
            </label>

            {formData.reexamAvailable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Re-exam Date
                  </label>
                  <input
                    type="date"
                    value={formData.reexamDate}
                    onChange={(e) => setFormData({...formData, reexamDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Re-exam Fee
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="text"
                      value={formData.reexamFee}
                      onChange={(e) => setFormData({...formData, reexamFee: e.target.value})}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleExam}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Exam
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams by course or faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exams List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredExams.map(exam => (
          <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{exam.courseName}</h3>
                  <span className="text-sm text-gray-500">{exam.courseCode}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(exam.status)}`}>
                    {exam.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">{exam.examDate} at {exam.examTime}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">{exam.duration}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">{exam.examRoom}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">{exam.studentsEnrolled} Students</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="flex items-center text-sm">
                    <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Faculty: {exam.faculty}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">Marks: {exam.totalMarks} (Pass: {exam.passingMarks})</span>
                  </div>
                  <div className="flex items-center text-sm">
                    {getExamTypeIcon(exam.examType)}
                    <span className="text-gray-600 dark:text-gray-300 ml-2 capitalize">{exam.examType} Exam</span>
                  </div>
                </div>

                {exam.reexamDate && (
                  <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg inline-flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800 dark:text-yellow-300">
                      Re-exam available on {exam.reexamDate} • Fee: ₹{exam.reexamFee}
                    </span>
                  </div>
                )}

                {exam.specialInstructions && (
                  <p className="mt-3 text-sm text-gray-500 italic">"{exam.specialInstructions}"</p>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Eye className="h-4 w-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Edit className="h-4 w-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Exams</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{exams.length}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
              <p className="text-2xl font-semibold mt-2 text-green-600 dark:text-green-400">
                {exams.filter(e => e.status === 'scheduled').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold mt-2 text-gray-600 dark:text-gray-400">
                {exams.filter(e => e.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <XCircle className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">
                {exams.reduce((acc, exam) => acc + exam.studentsEnrolled, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleExam;