import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { supabase } from '../../config/supabase';
import {
  Bell,
  Send,
  Check,
  Trash2,
  X,
  Users,
  Building2,
  CheckCircle,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const FacultyNotifications = () => {
  const { user } = useAuth();
  const { semester, academicYear } = useSemester();
  const [activeTab, setActiveTab] = useState('inbox');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'medium',
    recipients: 'department'
  });

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, activeTab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      if (activeTab === 'inbox') {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } else {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSentNotifications(data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast.error('Please enter title and message');
      return;
    }

    try {
      // Get recipient IDs based on selection
      let recipientIds = [];

      if (notificationForm.recipients === 'department') {
        // Send to all students in faculty's department
        const { data } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'student')
          .eq('department', user.department)
          .eq('is_active', true);
        recipientIds = data?.map(u => u.id) || [];
      } else if (notificationForm.recipients === 'my_students') {
        // Send to students enrolled in faculty's courses
        const { data: courses } = await supabase
          .from('course_assignments')
          .select('course_id')
          .eq('faculty_id', user.id);

        if (courses && courses.length > 0) {
          const courseIds = courses.map(c => c.course_id);
          const { data: enrollments } = await supabase
            .from('student_enrollments')
            .select('student_id')
            .in('course_id', courseIds);
          recipientIds = [...new Set(enrollments?.map(e => e.student_id) || [])];
        }
      } else if (notificationForm.recipients === 'all_students') {
        // Send to all students
        const { data } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'student')
          .eq('is_active', true);
        recipientIds = data?.map(u => u.id) || [];
      }

      if (recipientIds.length === 0) {
        toast.error('No recipients found');
        return;
      }

      // Insert notifications for each recipient
      const notificationsToInsert = recipientIds.map(recipientId => ({
        user_id: recipientId,
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        priority: notificationForm.priority,
        is_read: false,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notificationsToInsert);

      if (error) throw error;

      toast.success(`Notification sent to ${recipientIds.length} students!`);
      setNotificationForm({
        title: '',
        message: '',
        type: 'general',
        priority: 'medium',
        recipients: 'department'
      });
      setShowSendModal(false);
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => notif.id === id ? { ...notif, is_read: true } : notif)
      );
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to mark as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Stay updated and communicate with students
          </p>
        </div>
        <button
          onClick={() => setShowSendModal(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mt-4 sm:mt-0"
        >
          <Send className="h-4 w-4 mr-2" />
          Send Notification
        </button>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inbox'
                ? 'border-green-600 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Inbox ({unreadCount} unread)
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sent'
                ? 'border-green-600 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Sent
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {(activeTab === 'inbox' ? notifications : sentNotifications).length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {activeTab === 'inbox' ? 'No notifications' : 'No sent notifications'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === 'inbox' ? "You're all caught up!" : 'Send your first notification to students'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {(activeTab === 'inbox' ? notifications : sentNotifications).map((notif) => (
              <div
                key={notif.id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  activeTab === 'inbox' && !notif.is_read ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {notif.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {notif.message}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(notif.created_at).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                  {activeTab === 'inbox' && !notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Send Notification</h2>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Class Cancelled, Assignment Reminder"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your message here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={notificationForm.type}
                    onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="exam">Exam</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={notificationForm.priority}
                    onChange={(e) => setNotificationForm({...notificationForm, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Send To
                </label>
                <select
                  value={notificationForm.recipients}
                  onChange={(e) => setNotificationForm({...notificationForm, recipients: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="my_students">My Students (Enrolled in my courses)</option>
                  <option value="department">My Department Students</option>
                  <option value="all_students">All Students</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyNotifications;
