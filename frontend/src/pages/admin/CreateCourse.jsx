import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSemester } from '../../context/SemesterContext';
import { supabase } from '../../config/supabase';
import {
  BookOpen,
  Save,
  ArrowLeft,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckSquare,
  Bell,
  Send,
  Mail,
  MessageSquare,
  Plus,
  X,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { semester, academicYear } = useSemester();
  const [activeTab, setActiveTab] = useState('basic');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultyList, setFacultyList] = useState([]);

  // Fetch faculty data from Supabase
  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          department,
          email,
          phone,
          faculty_details(qualification)
        `)
        .eq('role', 'faculty')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;

      const formattedFaculty = data.map(f => ({
        id: f.id,
        name: `${f.first_name} ${f.last_name}`,
        department: f.department || 'Not Assigned',
        designation: f.faculty_details?.[0]?.qualification || 'Faculty',
        email: f.email,
        phone: f.phone || 'N/A'
      }));

      setFacultyList(formattedFaculty);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      toast.error('Failed to load faculty data');
    }
  };

  const [formData, setFormData] = useState({
    // Basic Course Information
    basicInfo: {
      courseCode: '',
      courseName: '',
      department: 'Computer Engineering',
      semester: '3',
      credits: '4',
      courseType: 'theory',
      electiveType: 'core',
      description: '',
      objectives: '',
      syllabus: '',
      referenceBooks: '',
    },
    
    // Faculty Assignment
    facultyInfo: {
      assignedFaculty: '',
      coFaculty: [],
      facultyRole: 'primary',
      teachingHours: '4',
      practicalHours: '2',
      tutorialHours: '0',
    },
    
    // Course Schedule
    scheduleInfo: {
      lecturesPerWeek: '4',
      practicalsPerWeek: '2',
      tutorialsPerWeek: '0',
      totalHours: '60',
      startDate: '',
      endDate: '',
      daysOfWeek: [],
      classroom: '',
      labRequired: 'no',
    },
    
    // Assessment & Grading
    assessmentInfo: {
      examPattern: 'semester',
      midtermMarks: '30',
      finalMarks: '70',
      practicalMarks: '25',
      oralMarks: '25',
      termworkMarks: '25',
      passingMarks: '40',
      gradingScheme: 'percentage',
    },
    
    // Prerequisites
    prerequisiteInfo: {
      requiredCourses: [],
      minimumAttendance: '75',
      previousMarks: '',
      skills: '',
    },
    
    // Exam Schedule
    examInfo: {
      examDate: '',
      examTime: '',
      examDuration: '3',
      examRoom: '',
      examType: 'theory',
      passingCriteria: '',
      reexamDate: '',
      reexamFee: '',
      scheduled: false,
    },
    
    // Notifications
    notificationInfo: {
      sendToStudents: false,
      sendToFaculty: false,
      sendToDepartment: false,
      notificationTitle: '',
      notificationMessage: '',
      notificationType: 'info',
      recipients: [],
    }
  });

  const [notifications, setNotifications] = useState([]);
  const [exams, setExams] = useState([]);

  const departments = [
    'Computer Engineering',
    'Information Technology',
    'Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering'
  ];

  const semesters = [1, 2, 3, 4, 5, 6];
  const courseTypes = ['theory', 'practical', 'theory+practical'];
  const electiveTypes = ['core', 'departmental elective', 'open elective'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const notificationTypes = ['info', 'success', 'warning', 'alert'];

  // Get faculty for selected department only
  const getFacultyByDepartment = () => {
    return facultyList.filter(f => f.department === formData.basicInfo.department);
  };

  // Get faculty count by department
  const getFacultyCountByDepartment = (department) => {
    return facultyList.filter(f => f.department === department).length;
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Reset faculty selection when department changes
    if (section === 'basicInfo' && field === 'department') {
      setFormData(prev => ({
        ...prev,
        facultyInfo: {
          ...prev.facultyInfo,
          assignedFaculty: '',
          coFaculty: []
        }
      }));
    }
  };

  const handleArrayChange = (section, field, value) => {
    const items = value.split(',').map(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: items
      }
    }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      scheduleInfo: {
        ...prev.scheduleInfo,
        daysOfWeek: prev.scheduleInfo.daysOfWeek.includes(value)
          ? prev.scheduleInfo.daysOfWeek.filter(day => day !== value)
          : [...prev.scheduleInfo.daysOfWeek, value]
      }
    }));
  };

  // Handle Send Notification
  const handleSendNotification = () => {
    if (!formData.notificationInfo.notificationTitle || !formData.notificationInfo.notificationMessage) {
      toast.error('Please enter notification title and message');
      return;
    }

    const newNotification = {
      id: Date.now(),
      title: formData.notificationInfo.notificationTitle,
      message: formData.notificationInfo.notificationMessage,
      type: formData.notificationInfo.notificationType,
      recipients: [],
      sentAt: new Date().toISOString(),
      courseCode: formData.basicInfo.courseCode,
      courseName: formData.basicInfo.courseName,
      status: 'sent'
    };

    // Add recipients based on selection
    if (formData.notificationInfo.sendToStudents) {
      newNotification.recipients.push('All Students');
    }
    if (formData.notificationInfo.sendToFaculty) {
      const faculty = facultyList.find(f => f.id.toString() === formData.facultyInfo.assignedFaculty);
      if (faculty) {
        newNotification.recipients.push(faculty.name);
      }
    }
    if (formData.notificationInfo.sendToDepartment) {
      newNotification.recipients.push(`${formData.basicInfo.department} Department`);
    }

    setNotifications([...notifications, newNotification]);
    toast.success('Notification sent successfully!');
    setShowNotificationModal(false);
    
    // Reset notification form
    setFormData(prev => ({
      ...prev,
      notificationInfo: {
        ...prev.notificationInfo,
        notificationTitle: '',
        notificationMessage: '',
        notificationType: 'info',
        sendToStudents: false,
        sendToFaculty: false,
        sendToDepartment: false,
      }
    }));
  };

  // Handle Schedule Exam
  const handleScheduleExam = () => {
    if (!formData.examInfo.examDate || !formData.examInfo.examTime || !formData.examInfo.examRoom) {
      toast.error('Please fill in all exam details');
      return;
    }

    const selectedFacultyMember = facultyList.find(f => f.id.toString() === formData.facultyInfo.assignedFaculty);

    const newExam = {
      id: Date.now(),
      courseCode: formData.basicInfo.courseCode,
      courseName: formData.basicInfo.courseName,
      department: formData.basicInfo.department,
      semester: formData.basicInfo.semester,
      examDate: formData.examInfo.examDate,
      examTime: formData.examInfo.examTime,
      examDuration: formData.examInfo.examDuration,
      examRoom: formData.examInfo.examRoom,
      examType: formData.examInfo.examType,
      reexamDate: formData.examInfo.reexamDate,
      reexamFee: formData.examInfo.reexamFee,
      faculty: selectedFacultyMember?.name || 'Not Assigned',
      status: 'scheduled',
      scheduledAt: new Date().toISOString()
    };

    setExams([...exams, newExam]);
    setFormData(prev => ({
      ...prev,
      examInfo: {
        ...prev.examInfo,
        scheduled: true
      }
    }));
    
    toast.success('Exam scheduled successfully!');
    setShowExamModal(false);
  };

  // Handle Create Course
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.basicInfo.courseCode || !formData.basicInfo.courseName || !formData.facultyInfo.assignedFaculty) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const selectedFacultyMember = facultyList.find(f => f.id.toString() === formData.facultyInfo.assignedFaculty);

      // Prepare course data for Supabase
      const courseData = {
        course_code: formData.basicInfo.courseCode,
        course_name: formData.basicInfo.courseName,
        department: formData.basicInfo.department,
        semester: parseInt(formData.basicInfo.semester),
        credits: parseInt(formData.basicInfo.credits),
        faculty_id: formData.facultyInfo.assignedFaculty,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📤 Creating course:', courseData);

      // Insert into Supabase
      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating course:', error);
        if (error.code === '23505') {
          toast.error('Course code already exists');
        } else {
          toast.error('Failed to create course: ' + error.message);
        }
        return;
      }

      console.log('✅ Course created:', data);
      toast.success('Course created successfully!');
      navigate('/admin/courses');
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to create course');
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: BookOpen },
    { id: 'faculty', label: 'Faculty Assignment', icon: GraduationCap },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'assessment', label: 'Assessment', icon: FileText },
    { id: 'prerequisites', label: 'Prerequisites', icon: CheckSquare },
  ];

  // Get current department faculty
  const currentDeptFaculty = getFacultyByDepartment();
  const facultyCount = currentDeptFaculty.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/courses')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {id ? 'Edit Course' : 'Create New Course'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {semester} {academicYear} Semester
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNotificationModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Bell className="h-4 w-4 mr-2" />
            Send Notification
          </button>
          <button
            onClick={() => setShowExamModal(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Exam
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {id ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Course Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo.courseCode}
                    onChange={(e) => handleInputChange('basicInfo', 'courseCode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., CP301"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo.courseName}
                    onChange={(e) => handleInputChange('basicInfo', 'courseName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Data Structures"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.basicInfo.department}
                    onChange={(e) => handleInputChange('basicInfo', 'department', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {facultyCount} faculty available in this department
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Semester
                  </label>
                  <select
                    value={formData.basicInfo.semester}
                    onChange={(e) => handleInputChange('basicInfo', 'semester', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Credits
                  </label>
                  <input
                    type="number"
                    value={formData.basicInfo.credits}
                    onChange={(e) => handleInputChange('basicInfo', 'credits', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    min="1"
                    max="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Type
                  </label>
                  <select
                    value={formData.basicInfo.courseType}
                    onChange={(e) => handleInputChange('basicInfo', 'courseType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {courseTypes.map(type => (
                      <option key={type} value={type}>{type.split('+').join(' + ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Elective Type
                  </label>
                  <select
                    value={formData.basicInfo.electiveType}
                    onChange={(e) => handleInputChange('basicInfo', 'electiveType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {electiveTypes.map(type => (
                      <option key={type} value={type}>{type.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Description
                  </label>
                  <textarea
                    value={formData.basicInfo.description}
                    onChange={(e) => handleInputChange('basicInfo', 'description', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Brief description of the course"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Objectives
                  </label>
                  <textarea
                    value={formData.basicInfo.objectives}
                    onChange={(e) => handleInputChange('basicInfo', 'objectives', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Learning objectives of the course"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Syllabus (comma separated topics)
                  </label>
                  <textarea
                    value={formData.basicInfo.syllabus}
                    onChange={(e) => handleArrayChange('basicInfo', 'syllabus', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Topic1, Topic2, Topic3"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reference Books (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo.referenceBooks}
                    onChange={(e) => handleArrayChange('basicInfo', 'referenceBooks', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Book1, Book2, Book3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Faculty Assignment Tab */}
          {activeTab === 'faculty' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Faculty Assignment</h3>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Department: {formData.basicInfo.department}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Showing {facultyCount} faculty members from {formData.basicInfo.department} department only
                    </p>
                    {facultyCount === 0 && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                        ⚠️ No faculty available in this department. Please add faculty first.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Faculty <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.facultyInfo.assignedFaculty}
                    onChange={(e) => handleInputChange('facultyInfo', 'assignedFaculty', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                    disabled={facultyCount === 0}
                  >
                    <option value="">
                      {facultyCount === 0 
                        ? 'No faculty available in this department' 
                        : 'Select Faculty'}
                    </option>
                    {currentDeptFaculty.map(faculty => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name} - {faculty.designation}
                      </option>
                    ))}
                  </select>
                  {facultyCount > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {currentDeptFaculty.length} faculty members available
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Co-Faculty (if any)
                  </label>
                  <select
                    value={formData.facultyInfo.coFaculty[0] || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        facultyInfo: {
                          ...prev.facultyInfo,
                          coFaculty: value ? [value] : []
                        }
                      }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={facultyCount <= 1}
                  >
                    <option value="">
                      {facultyCount <= 1 
                        ? 'No other faculty available' 
                        : 'Select Co-Faculty'}
                    </option>
                    {currentDeptFaculty
                      .filter(f => f.id.toString() !== formData.facultyInfo.assignedFaculty)
                      .map(faculty => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.name} - {faculty.designation}
                        </option>
                      ))}
                  </select>
                  {facultyCount > 1 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {currentDeptFaculty.filter(f => f.id.toString() !== formData.facultyInfo.assignedFaculty).length} other faculty available
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teaching Hours/Week
                  </label>
                  <input
                    type="number"
                    value={formData.facultyInfo.teachingHours}
                    onChange={(e) => handleInputChange('facultyInfo', 'teachingHours', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Practical Hours/Week
                  </label>
                  <input
                    type="number"
                    value={formData.facultyInfo.practicalHours}
                    onChange={(e) => handleInputChange('facultyInfo', 'practicalHours', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tutorial Hours/Week
                  </label>
                  <input
                    type="number"
                    value={formData.facultyInfo.tutorialHours}
                    onChange={(e) => handleInputChange('facultyInfo', 'tutorialHours', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Faculty List Preview */}
              {facultyCount > 0 && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Available Faculty in {formData.basicInfo.department}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currentDeptFaculty.map(faculty => (
                      <div 
                        key={faculty.id} 
                        className={`flex items-center p-2 rounded-lg ${
                          faculty.id.toString() === formData.facultyInfo.assignedFaculty
                            ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                            {faculty.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">{faculty.name}</p>
                          <p className="text-xs text-gray-500">{faculty.designation}</p>
                        </div>
                        {faculty.id.toString() === formData.facultyInfo.assignedFaculty && (
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Schedule</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lectures per Week
                  </label>
                  <input
                    type="number"
                    value={formData.scheduleInfo.lecturesPerWeek}
                    onChange={(e) => handleInputChange('scheduleInfo', 'lecturesPerWeek', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Practicals per Week
                  </label>
                  <input
                    type="number"
                    value={formData.scheduleInfo.practicalsPerWeek}
                    onChange={(e) => handleInputChange('scheduleInfo', 'practicalsPerWeek', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tutorials per Week
                  </label>
                  <input
                    type="number"
                    value={formData.scheduleInfo.tutorialsPerWeek}
                    onChange={(e) => handleInputChange('scheduleInfo', 'tutorialsPerWeek', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Hours
                  </label>
                  <input
                    type="text"
                    value={formData.scheduleInfo.totalHours}
                    onChange={(e) => handleInputChange('scheduleInfo', 'totalHours', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.scheduleInfo.startDate}
                    onChange={(e) => handleInputChange('scheduleInfo', 'startDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.scheduleInfo.endDate}
                    onChange={(e) => handleInputChange('scheduleInfo', 'endDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Classroom
                  </label>
                  <input
                    type="text"
                    value={formData.scheduleInfo.classroom}
                    onChange={(e) => handleInputChange('scheduleInfo', 'classroom', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Room 401"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lab Required?
                  </label>
                  <select
                    value={formData.scheduleInfo.labRequired}
                    onChange={(e) => handleInputChange('scheduleInfo', 'labRequired', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Days of Week
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {daysOfWeek.map(day => (
                      <label key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.scheduleInfo.daysOfWeek.includes(day)}
                          onChange={() => handleCheckboxChange('daysOfWeek', day)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assessment Tab */}
          {activeTab === 'assessment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assessment & Grading</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Pattern
                  </label>
                  <select
                    value={formData.assessmentInfo.examPattern}
                    onChange={(e) => handleInputChange('assessmentInfo', 'examPattern', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="semester">Semester Pattern</option>
                    <option value="yearly">Yearly Pattern</option>
                    <option value="credit">Credit Based</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Midterm Marks
                  </label>
                  <input
                    type="number"
                    value={formData.assessmentInfo.midtermMarks}
                    onChange={(e) => handleInputChange('assessmentInfo', 'midtermMarks', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Final Exam Marks
                  </label>
                  <input
                    type="number"
                    value={formData.assessmentInfo.finalMarks}
                    onChange={(e) => handleInputChange('assessmentInfo', 'finalMarks', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Practical Marks
                  </label>
                  <input
                    type="number"
                    value={formData.assessmentInfo.practicalMarks}
                    onChange={(e) => handleInputChange('assessmentInfo', 'practicalMarks', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Oral Marks
                  </label>
                  <input
                    type="number"
                    value={formData.assessmentInfo.oralMarks}
                    onChange={(e) => handleInputChange('assessmentInfo', 'oralMarks', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Term Work Marks
                  </label>
                  <input
                    type="number"
                    value={formData.assessmentInfo.termworkMarks}
                    onChange={(e) => handleInputChange('assessmentInfo', 'termworkMarks', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    value={formData.assessmentInfo.passingMarks}
                    onChange={(e) => handleInputChange('assessmentInfo', 'passingMarks', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grading Scheme
                  </label>
                  <select
                    value={formData.assessmentInfo.gradingScheme}
                    onChange={(e) => handleInputChange('assessmentInfo', 'gradingScheme', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="gpa">GPA (4.0)</option>
                    <option value="cgpa">CGPA (10.0)</option>
                    <option value="letter">Letter Grades</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Prerequisites Tab */}
          {activeTab === 'prerequisites' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Prerequisites</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Required Courses (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.prerequisiteInfo.requiredCourses}
                    onChange={(e) => handleArrayChange('prerequisiteInfo', 'requiredCourses', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="CP201, CP202"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Attendance Required (%)
                  </label>
                  <input
                    type="number"
                    value={formData.prerequisiteInfo.minimumAttendance}
                    onChange={(e) => handleInputChange('prerequisiteInfo', 'minimumAttendance', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Previous Marks Required
                  </label>
                  <input
                    type="text"
                    value={formData.prerequisiteInfo.previousMarks}
                    onChange={(e) => handleInputChange('prerequisiteInfo', 'previousMarks', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Minimum 60%"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Required Skills/Knowledge
                  </label>
                  <textarea
                    value={formData.prerequisiteInfo.skills}
                    onChange={(e) => handleInputChange('prerequisiteInfo', 'skills', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Programming basics, Mathematics"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications and Exams History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sent Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sent Notifications</h3>
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No notifications sent yet
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map(notif => (
                <div key={notif.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{notif.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        To: {notif.recipients.join(', ')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.sentAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      notif.type === 'success' ? 'bg-green-100 text-green-800' :
                      notif.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      notif.type === 'alert' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {notif.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Exams */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scheduled Exams</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          {exams.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No exams scheduled yet
            </p>
          ) : (
            <div className="space-y-3">
              {exams.map(exam => (
                <div key={exam.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{exam.courseName}</p>
                      <p className="text-xs text-gray-500">{exam.courseCode}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Date: {exam.examDate} at {exam.examTime}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Room: {exam.examRoom} • Duration: {exam.examDuration} hrs
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Faculty: {exam.faculty}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Scheduled: {new Date(exam.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {exam.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Send Notification</h2>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.notificationInfo.notificationTitle}
                  onChange={(e) => handleInputChange('notificationInfo', 'notificationTitle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Course Update, Exam Schedule"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.notificationInfo.notificationMessage}
                  onChange={(e) => handleInputChange('notificationInfo', 'notificationMessage', e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your notification message here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Type
                </label>
                <select
                  value={formData.notificationInfo.notificationType}
                  onChange={(e) => handleInputChange('notificationInfo', 'notificationType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {notificationTypes.map(type => (
                    <option key={type} value={type}>{type.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Send To
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.notificationInfo.sendToStudents}
                      onChange={(e) => handleInputChange('notificationInfo', 'sendToStudents', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">All Students</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.notificationInfo.sendToFaculty}
                      onChange={(e) => handleInputChange('notificationInfo', 'sendToFaculty', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Assigned Faculty</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.notificationInfo.sendToDepartment}
                      onChange={(e) => handleInputChange('notificationInfo', 'sendToDepartment', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formData.basicInfo.department} Department</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Schedule Exam</h2>
                <button
                  onClick={() => setShowExamModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.examInfo.examDate}
                    onChange={(e) => handleInputChange('examInfo', 'examDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.examInfo.examTime}
                    onChange={(e) => handleInputChange('examInfo', 'examTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={formData.examInfo.examDuration}
                    onChange={(e) => handleInputChange('examInfo', 'examDuration', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Room <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.examInfo.examRoom}
                    onChange={(e) => handleInputChange('examInfo', 'examRoom', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Hall A, Room 401"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Type
                  </label>
                  <select
                    value={formData.examInfo.examType}
                    onChange={(e) => handleInputChange('examInfo', 'examType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="theory">Theory</option>
                    <option value="practical">Practical</option>
                    <option value="oral">Oral</option>
                    <option value="termwork">Term Work</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Passing Criteria
                  </label>
                  <input
                    type="text"
                    value={formData.examInfo.passingCriteria}
                    onChange={(e) => handleInputChange('examInfo', 'passingCriteria', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Minimum 40%"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Re-exam Details (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Re-exam Date
                    </label>
                    <input
                      type="date"
                      value={formData.examInfo.reexamDate}
                      onChange={(e) => handleInputChange('examInfo', 'reexamDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Re-exam Fee
                    </label>
                    <input
                      type="text"
                      value={formData.examInfo.reexamFee}
                      onChange={(e) => handleInputChange('examInfo', 'reexamFee', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="₹ 500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowExamModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleExam}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;