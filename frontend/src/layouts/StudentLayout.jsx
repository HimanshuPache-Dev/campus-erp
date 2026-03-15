import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSemester } from '../context/SemesterContext';
import {
  LayoutDashboard,
  CalendarCheck,
  BarChart3,
  Calendar,
  CreditCard,
  User,
  Bell,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const { semester, academicYear } = useSemester();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navigation = [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Attendance', href: '/student/attendance', icon: CalendarCheck },
    { name: 'My Results', href: '/student/results', icon: BarChart3 },
    { name: 'Timetable', href: '/student/timetable', icon: Calendar },
    { name: 'Fees', href: '/student/fees', icon: CreditCard },
    { name: 'Profile', href: '/student/profile', icon: User },
    { name: 'Notifications', href: '/student/notifications', icon: Bell },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        
        <div className={`absolute inset-y-0 left-0 w-72 ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        } shadow-xl transform transition-transform duration-300 ease-in-out`}>
          <div className={`flex h-16 items-center justify-between px-6 border-b ${
            darkMode ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Student Portal</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <div className="mb-8">
              <p className={`px-3 text-xs font-semibold uppercase tracking-wider mb-3 ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                MENU
              </p>
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg mb-1 transition-all duration-200 group ${
                      isActive 
                        ? darkMode ? 'bg-gray-800 text-white' : 'bg-purple-50 text-purple-600'
                        : darkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    darkMode ? 'text-gray-500 group-hover:text-white' : 'text-gray-500 group-hover:text-purple-600'
                  }`} />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
          
          <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                darkMode ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        } border-r transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        <div className={`flex h-16 items-center justify-between px-4 border-b ${
          darkMode ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div className={`flex items-center space-x-2 ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            {!collapsed && (
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Student Portal</h1>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`p-1.5 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <div className="mb-8">
            {!collapsed && (
              <p className={`px-3 text-xs font-semibold uppercase tracking-wider mb-3 ${
                darkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                MENU
              </p>
            )}
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-2.5 text-sm font-medium rounded-lg mb-1 transition-all duration-200 group ${
                    isActive 
                      ? darkMode ? 'bg-gray-800 text-white' : 'bg-purple-50 text-purple-600'
                      : darkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                title={collapsed ? item.name : ''}
              >
                <item.icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'} ${
                  darkMode ? 'text-gray-500 group-hover:text-white' : 'text-gray-500 group-hover:text-purple-600'
                }`} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </div>
        </div>
        
        <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
              darkMode ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' : 'text-red-600 hover:bg-red-50'
            }`}
            title={collapsed ? 'Logout' : ''}
          >
            <LogOut className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Header */}
        <header className={`sticky top-0 z-40 border-b ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1 flex items-center justify-end space-x-4">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  semester === 'Winter' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                }`}>
                  {semester} {academicYear}
                </span>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {darkMode ? '🌞' : '🌙'}
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'S'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                    {user?.name || 'Student'}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user?.department || 'Student'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;