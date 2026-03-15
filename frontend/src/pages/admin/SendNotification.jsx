import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSemester } from '../../context/SemesterContext';
import { supabase } from '../../config/supabase';
import {
  Bell,
  Send,
  Mail,
  MessageSquare,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ArrowLeft,
  CheckCircle,
  X,
  Filter,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const SendNotification = () => {
  const navigate = useNavigate();
  const { semester, academicYear } = useSemester();
  const [activeTab, setActiveTab] = useState('compose');
  const [selectedRecipients, setSelectedRecipients] = useState({
    allStudents: false,
    allFaculty: false,
    specificDepartment: false,
    specificCourse: false,
    specificSemester: false,
  });
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'normal',
    sendEmail: false,
    sendSMS: false,
    sendPush: true,
    scheduleLater: false,
    scheduleDate: '',
    scheduleTime: '',
  });

  const [notifications, setNotifications] = useState([]);

  // Fetch courses and departments from Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, course_code, course_name, department')
        .eq('is_active', true)
        .order('course_code');

      if (coursesError) throw coursesError;

      setCourses(coursesData.map(c => ({
        id: c.id,
        code: c.course_code,
        name: c.course_name,
        department: c.department
      })));

      // Get unique departments
      const uniqueDepts = [...new Set(coursesData.map(c => c.department))];
      setDepartments(uniqueDepts);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const semesters = [1, 2, 3, 4, 5, 6];
  const notificationTypes = ['info', 'success', 'warning', 'alert'];
  const priorities = ['low', 'normal', 'high', 'urgent'];

  const handleRecipientChange = (key) => {
    setSelectedRecipients(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Please enter title and message');
      return;
    }

    // Get recipient list
    let recipientList = [];
    if (selectedRecipients.allStudents) recipientList.push('All Students');
    if (selectedRecipients.allFaculty) recipientList.push('All Faculty');
    if (selectedRecipients.specificDepartment && selectedDepartment) 
      recipientList.push(`${selectedDepartment} Department`);
    if (selectedRecipients.specificCourse && selectedCourse) {
      const course = courses.find(c => c.id === selectedCourse);
      if (course) recipientList.push(`${course.name} Students`);
    }
    if (selectedRecipients.specificSemester && selectedSemester) 
      recipientList.push(`Semester ${selectedSemester} Students`);

    if (recipientList.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    try {
      // In a real implementation, you would:
      // 1. Get user IDs based on selected recipients
      // 2. Insert notifications for each user in the notifications table
      // For now, we'll just add to local state
      
      const newNotification = {
        id: Date.now(),
        title: formData.title,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        recipients: recipientList.join(', '),
        sentAt: new Date().toISOString(),
        status: 'sent',
        readCount: 0,
        totalCount: 0
      };

      setNotifications([newNotification, ...notifications]);
      toast.success('Notification sent successfully!');
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'info',
        priority: 'normal',
        sendEmail: false,
        sendSMS: false,
        sendPush: true,
        scheduleLater: false,
        scheduleDate: '',
        scheduleTime: '',
      });
      setSelectedRecipients({
        allStudents: false,
        allFaculty: false,
        specificDepartment: false,
        specificCourse: false,
        specificSemester: false,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const filteredNotifications = notifications.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.recipients.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Send Notification</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Send announcements to students and faculty
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'compose'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Compose Notification
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Notification History
          </button>
        </div>
      </div>

      {activeTab === 'compose' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compose Message</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notification Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Exam Schedule Update"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your notification message here..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notification Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {notificationTypes.map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Delivery Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.sendPush}
                        onChange={(e) => setFormData({...formData, sendPush: e.target.checked})}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Push Notification (In-app)</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.sendEmail}
                        onChange={(e) => setFormData({...formData, sendEmail: e.target.checked})}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.sendSMS}
                        onChange={(e) => setFormData({...formData, sendSMS: e.target.checked})}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">SMS</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.scheduleLater}
                      onChange={(e) => setFormData({...formData, scheduleLater: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule for later</span>
                  </label>
                  
                  {formData.scheduleLater && (
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <input
                        type="date"
                        value={formData.scheduleDate}
                        onChange={(e) => setFormData({...formData, scheduleDate: e.target.value})}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="time"
                        value={formData.scheduleTime}
                        onChange={(e) => setFormData({...formData, scheduleTime: e.target.value})}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recipients Panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Recipients</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Total Recipients: 0
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">All Students</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedRecipients.allStudents}
                      onChange={() => handleRecipientChange('allStudents')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">All Faculty</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedRecipients.allFaculty}
                      onChange={() => handleRecipientChange('allFaculty')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </label>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Specific Department</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedRecipients.specificDepartment}
                        onChange={() => handleRecipientChange('specificDepartment')}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                    
                    {selectedRecipients.specificDepartment && (
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Specific Course</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedRecipients.specificCourse}
                        onChange={() => handleRecipientChange('specificCourse')}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                    
                    {selectedRecipients.specificCourse && (
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Specific Semester</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedRecipients.specificSemester}
                        onChange={() => handleRecipientChange('specificSemester')}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                    
                    {selectedRecipients.specificSemester && (
                      <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Semester</option>
                        {semesters.map(sem => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSendNotification}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center justify-center"
            >
              <Send className="h-5 w-5 mr-2" />
              Send Notification
            </button>
          </div>
        </div>
      ) : (
        /* Notification History */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification History</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map(notification => (
              <div key={notification.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        notification.type === 'success' ? 'bg-green-100 text-green-800' :
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        notification.type === 'alert' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {notification.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                      {notification.title}
                    </h4>
                    
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <span>To: {notification.recipients}</span>
                      <span>•</span>
                      <span>Sent: {new Date(notification.sentAt).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-gray-600">
                          {notification.readCount}/{notification.totalCount} read
                        </span>
                      </div>
                      <button className="text-sm text-primary-600 hover:text-primary-700">
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SendNotification;