import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  Bell,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProfileMenu = ({ user, darkMode, setDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400';
      case 'faculty':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'student':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400';
    }
  };

  const menuItems = [
    {
      label: 'Your Profile',
      icon: User,
      onClick: () => {
        setIsOpen(false);
        navigate('/admin/profile');
      }
    },
    {
      label: 'Settings',
      icon: Settings,
      onClick: () => {
        setIsOpen(false);
        navigate('/admin/settings');
      }
    },
    {
      label: 'Notifications',
      icon: Bell,
      onClick: () => {
        setIsOpen(false);
        navigate('/admin/notifications');
      }
    }
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-3 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
        }`}
      >
        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            {getInitials(user?.name || 'User')}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            {user?.name || 'Admin User'}
          </p>
          <p className={`text-xs capitalize ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {user?.role || 'admin'}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-72 rounded-lg shadow-xl border z-50 animate-slideDown ${
          darkMode 
            ? 'bg-gray-900 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-primary-700 dark:text-primary-300">
                  {getInitials(user?.name || 'User')}
                </span>
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || 'Admin User'}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user?.email || 'admin@campus.edu'}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role || 'admin'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-2 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`h-4 w-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className={`p-2 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <button
              onClick={() => {
                setDarkMode(!darkMode);
                localStorage.setItem('darkMode', (!darkMode).toString());
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                {darkMode ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Moon className="h-4 w-4 text-gray-500" />
                )}
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors relative ${
                darkMode ? 'bg-primary-600' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transform transition-transform ${
                  darkMode ? 'translate-x-5' : 'translate-x-0.5'
                }`}></div>
              </div>
            </button>
          </div>

          <div className="p-2">
            <button
              onClick={logout}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                darkMode 
                  ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' 
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;