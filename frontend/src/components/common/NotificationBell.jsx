import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationBell = ({ darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        title: 'New Student Enrolled',
        message: 'John Doe has been enrolled in Computer Science',
        type: 'info',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        id: 2,
        title: 'Attendance Marked',
        message: 'Dr. Smith has marked attendance for CS101',
        type: 'success',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        id: 3,
        title: 'Fee Payment Pending',
        message: '5 students have pending fees for this semester',
        type: 'warning',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      },
      {
        id: 4,
        title: 'System Update',
        message: 'System maintenance scheduled for tonight at 2 AM',
        type: 'info',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48)
      },
      {
        id: 5,
        title: 'Low Attendance Alert',
        message: '3 students have attendance below 75%',
        type: 'alert',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 15)
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => {
      const notif = notifications.find(n => n.id === id);
      return notif && !notif.isRead ? prev - 1 : prev;
    });
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/admin/notifications');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBg = (type, isRead) => {
    if (isRead) {
      return darkMode ? 'bg-gray-800/50' : 'bg-white';
    }
    switch (type) {
      case 'success': return darkMode ? 'bg-green-900/20' : 'bg-green-50';
      case 'warning': return darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50';
      case 'alert': return darkMode ? 'bg-red-900/20' : 'bg-red-50';
      default: return darkMode ? 'bg-blue-900/20' : 'bg-blue-50';
    }
  };

  return (
    <div ref={notificationRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-96 rounded-lg shadow-xl border z-50 animate-slideDown ${
          darkMode 
            ? 'bg-gray-900 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-4 border-b flex justify-between items-center ${
            darkMode ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <div>
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h3>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {unreadCount} unread • {notifications.length} total
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-primary-400 hover:bg-gray-800' 
                    : 'text-primary-600 hover:bg-primary-50'
                }`}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b last:border-0 transition-colors relative group ${
                    getNotificationBg(notification.type, notification.isRead)
                  } ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.isRead 
                            ? darkMode ? 'text-white' : 'text-gray-900'
                            : darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) => deleteNotification(notification.id, e)}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                          }`}
                        >
                          <X className={`h-3 w-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        </button>
                      </div>
                      <p className={`text-sm mt-1 pr-6 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      <div className={`flex items-center mt-2 text-xs ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className={`flex-shrink-0 p-1 rounded transition-colors ${
                          darkMode 
                            ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700' 
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={`p-3 border-t rounded-b-lg ${
            darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'
          }`}>
            <button 
              onClick={handleViewAll}
              className={`w-full text-center text-sm py-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;