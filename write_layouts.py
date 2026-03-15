import os

base = r"C:\Users\pache\campus-erp\campus-erp\frontend\src\layouts"

faculty = """import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSemester } from '../context/SemesterContext';
import { LayoutDashboard, BookOpen, CalendarCheck, BarChart3, Users, Calendar, User, Bell, LogOut, Menu, ChevronLeft, ChevronRight, Sun, Moon, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
  { name: 'My Courses', href: '/faculty/courses', icon: BookOpen },
  { name: 'Attendance', href: '/faculty/attendance', icon: CalendarCheck },
  { name: 'Results', href: '/faculty/results', icon: BarChart3 },
  { name: 'My Students', href: '/faculty/students', icon: Users },
  { name: 'Schedule', href: '/faculty/schedule', icon: Calendar },
  { name: 'Profile', href: '/faculty/profile', icon: User },
  { name: 'Notifications', href: '/faculty/notifications', icon: Bell },
];

const SidebarContent = ({ collapsed, darkMode, onClose, user, logout }) => (
  <div className="flex flex-col h-full">
    <div className={`flex h-16 items-center ${collapsed ? 'justify-center px-4' : 'justify-between px-5'} border-b border-faculty-100/50 dark:border-white/5 flex-shrink-0`}>
      {!collapsed && (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-faculty-500 to-sky-600 rounded-xl flex items-center justify-center shadow-glow-blue flex-shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">CampusERP</h1>
            <p className="text-xs text-faculty-600 dark:text-faculty-400 font-medium">Faculty Portal</p>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="w-8 h-8 bg-gradient-to-br from-faculty-500 to-sky-600 rounded-xl flex items-center justify-center shadow-glow-blue">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}
      {onClose && (
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
    <div className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
      {!collapsed && <p className="px-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Menu</p>}
      <nav className="space-y-0.5">
        {navigation.map(item => (
          <NavLink key={item.name} to={item.href} onClick={onClose}
            className={({ isActive }) => `nav-item group ${collapsed ? 'justify-center' : ''} ${isActive ? 'nav-item-active-faculty' : 'nav-item-inactive'}`}
            title={collapsed ? item.name : undefined}>
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'} ${isActive ? 'text-faculty-600 dark:text-faculty-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
                {!collapsed && isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-faculty-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
    <div className="flex-shrink-0 border-t border-faculty-100/50 dark:border-white/5 p-3">
      {!collapsed && user && (
        <div className="flex items-center space-x-3 px-3 py-2 mb-2 rounded-xl bg-faculty-50 dark:bg-faculty-900/20">
          <div className="w-8 h-8 bg-gradient-to-br from-faculty-500 to-sky-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'F'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name || 'Faculty'}</p>
            <p className="text-xs text-faculty-600 dark:text-faculty-400 truncate">{user.department || 'Faculty'}</p>
          </div>
        </div>
      )}
      <button onClick={logout}
        className={`w-full nav-item group ${collapsed ? 'justify-center' : ''} text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600`}
        title={collapsed ? 'Logout' : undefined}>
        <LogOut className={`h-5 w-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'}`} />
        {!collapsed && <span>Logout</span>}
      </button>
    </div>
  </div>
);

const FacultyLayout = () => {
  const { user, logout } = useAuth();
  const { semester, academicYear } = useSemester();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => { logout(); toast.success('Logged out successfully'); };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`absolute inset-y-0 left-0 w-72 ${darkMode ? 'sidebar-glass-dark' : 'sidebar-glass'} shadow-2xl`}>
              <SidebarContent collapsed={false} darkMode={darkMode} onClose={() => setSidebarOpen(false)} user={user} logout={handleLogout} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${darkMode ? 'sidebar-glass-dark' : 'sidebar-glass'} transition-all duration-300 ${collapsed ? 'lg:w-[72px]' : 'lg:w-64'} z-30`}>
        <SidebarContent collapsed={collapsed} darkMode={darkMode} user={user} logout={handleLogout} />
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow z-10">
          {collapsed ? <ChevronRight className="h-3 w-3 text-gray-500" /> : <ChevronLeft className="h-3 w-3 text-gray-500" />}
        </button>
      </div>

      <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}`}>
        <header className={`sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6 border-b transition-all ${darkMode ? 'bg-gray-950/90 border-white/5 backdrop-blur-xl' : 'bg-white/90 border-gray-100 backdrop-blur-xl'} shadow-sm`}>
          <button onClick={() => setSidebarOpen(true)} className={`lg:hidden p-2 rounded-xl transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center justify-end space-x-3">
            <span className={`hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${semester === 'Winter' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
              {semester} {academicYear}
            </span>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl transition-colors ${darkMode ? 'text-yellow-400 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-faculty-500 to-sky-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'F'}
              </div>
              <div className="hidden md:block">
                <p className={`text-sm font-semibold leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name?.split(' ')[0] || 'Faculty'}</p>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.department || 'Faculty'}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={window.location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout;
"""

student = """import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSemester } from '../context/SemesterContext';
import { LayoutDashboard, CalendarCheck, BarChart3, Calendar, CreditCard, User, Bell, LogOut, Menu, ChevronLeft, ChevronRight, Sun, Moon, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'My Attendance', href: '/student/attendance', icon: CalendarCheck },
  { name: 'My Results', href: '/student/results', icon: BarChart3 },
  { name: 'Timetable', href: '/student/timetable', icon: Calendar },
  { name: 'Fees', href: '/student/fees', icon: CreditCard },
  { name: 'Profile', href: '/student/profile', icon: User },
  { name: 'Notifications', href: '/student/notifications', icon: Bell },
];

const SidebarContent = ({ collapsed, darkMode, onClose, user, logout }) => (
  <div className="flex flex-col h-full">
    <div className={`flex h-16 items-center ${collapsed ? 'justify-center px-4' : 'justify-between px-5'} border-b border-student-100/50 dark:border-white/5 flex-shrink-0`}>
      {!collapsed && (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-student-500 to-teal-600 rounded-xl flex items-center justify-center shadow-glow-green flex-shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">CampusERP</h1>
            <p className="text-xs text-student-600 dark:text-student-400 font-medium">Student Portal</p>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="w-8 h-8 bg-gradient-to-br from-student-500 to-teal-600 rounded-xl flex items-center justify-center shadow-glow-green">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}
      {onClose && (
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
    <div className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
      {!collapsed && <p className="px-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Menu</p>}
      <nav className="space-y-0.5">
        {navigation.map(item => (
          <NavLink key={item.name} to={item.href} onClick={onClose}
            className={({ isActive }) => `nav-item group ${collapsed ? 'justify-center' : ''} ${isActive ? 'nav-item-active-student' : 'nav-item-inactive'}`}
            title={collapsed ? item.name : undefined}>
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'} ${isActive ? 'text-student-600 dark:text-student-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
                {!collapsed && isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-student-500" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
    <div className="flex-shrink-0 border-t border-student-100/50 dark:border-white/5 p-3">
      {!collapsed && user && (
        <div className="flex items-center space-x-3 px-3 py-2 mb-2 rounded-xl bg-student-50 dark:bg-student-900/20">
          <div className="w-8 h-8 bg-gradient-to-br from-student-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name || 'Student'}</p>
            <p className="text-xs text-student-600 dark:text-student-400 truncate">{user.department || 'Student'}</p>
          </div>
        </div>
      )}
      <button onClick={logout}
        className={`w-full nav-item group ${collapsed ? 'justify-center' : ''} text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600`}
        title={collapsed ? 'Logout' : undefined}>
        <LogOut className={`h-5 w-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'}`} />
        {!collapsed && <span>Logout</span>}
      </button>
    </div>
  </div>
);

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const { semester, academicYear } = useSemester();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => { logout(); toast.success('Logged out successfully'); };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`absolute inset-y-0 left-0 w-72 ${darkMode ? 'sidebar-glass-dark' : 'sidebar-glass'} shadow-2xl`}>
              <SidebarContent collapsed={false} darkMode={darkMode} onClose={() => setSidebarOpen(false)} user={user} logout={handleLogout} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${darkMode ? 'sidebar-glass-dark' : 'sidebar-glass'} transition-all duration-300 ${collapsed ? 'lg:w-[72px]' : 'lg:w-64'} z-30`}>
        <SidebarContent collapsed={collapsed} darkMode={darkMode} user={user} logout={handleLogout} />
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow z-10">
          {collapsed ? <ChevronRight className="h-3 w-3 text-gray-500" /> : <ChevronLeft className="h-3 w-3 text-gray-500" />}
        </button>
      </div>

      <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}`}>
        <header className={`sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6 border-b transition-all ${darkMode ? 'bg-gray-950/90 border-white/5 backdrop-blur-xl' : 'bg-white/90 border-gray-100 backdrop-blur-xl'} shadow-sm`}>
          <button onClick={() => setSidebarOpen(true)} className={`lg:hidden p-2 rounded-xl transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-center justify-end space-x-3">
            <span className={`hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${semester === 'Winter' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
              {semester} {academicYear}
            </span>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl transition-colors ${darkMode ? 'text-yellow-400 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-student-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'S'}
              </div>
              <div className="hidden md:block">
                <p className={`text-sm font-semibold leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name?.split(' ')[0] || 'Student'}</p>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.department || 'Student'}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={window.location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
"""

with open(os.path.join(base, 'FacultyLayout.jsx'), 'w', encoding='utf-8') as f:
    f.write(faculty)

with open(os.path.join(base, 'StudentLayout.jsx'), 'w', encoding='utf-8') as f:
    f.write(student)

print('done')
