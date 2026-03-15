import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CalendarCheck,
  BarChart3, DollarSign, Settings, LogOut, ChevronLeft, ChevronRight,
  UserPlus, FileText, AlertTriangle, Bell, X, Sparkles, Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Faculty', href: '/admin/faculty', icon: GraduationCap },
  { name: 'Courses', href: '/admin/courses', icon: BookOpen },
  { name: 'Timetable', href: '/admin/manage-timetable', icon: Calendar },
  { name: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
  { name: 'Results', href: '/admin/results', icon: BarChart3 },
  { name: 'Fees', href: '/admin/fees', icon: DollarSign },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
];

const quickActions = [
  { name: 'Add Student', href: '/admin/students/add', icon: UserPlus },
  { name: 'Add Faculty', href: '/admin/faculty/add', icon: GraduationCap },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Alerts', href: '/admin/alerts', icon: AlertTriangle },
];

const SidebarContent = ({ collapsed, darkMode, onClose }) => {
  const { logout, user } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex h-16 items-center ${collapsed ? 'justify-center px-4' : 'justify-between px-5'} border-b border-admin-100/50 dark:border-white/5 flex-shrink-0`}>
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-admin-500 to-violet-600 rounded-xl flex items-center justify-center shadow-glow-purple flex-shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">CampusERP</h1>
              <p className="text-xs text-admin-600 dark:text-admin-400 font-medium">Admin Portal</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-admin-500 to-violet-600 rounded-xl flex items-center justify-center shadow-glow-purple">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
        {!collapsed && (
          <p className="px-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Main</p>
        )}
        <nav className="space-y-0.5">
          {navigation.map((item) => (
            <NavLink key={item.name} to={item.href} onClick={onClose}
              className={({ isActive }) =>
                `nav-item group ${collapsed ? 'justify-center' : ''} ${isActive ? 'nav-item-active-admin' : 'nav-item-inactive'}`
              }
              title={collapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${collapsed ? '' : 'mr-3'} ${isActive ? 'text-admin-600 dark:text-admin-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}`} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                  {!collapsed && isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-admin-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {!collapsed && (
          <>
            <p className="px-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-5 mb-2">Quick Actions</p>
            <nav className="space-y-0.5">
              {quickActions.map((item) => (
                <NavLink key={item.name} to={item.href} onClick={onClose}
                  className={({ isActive }) => `nav-item group ${isActive ? 'nav-item-active-admin' : 'nav-item-inactive'}`}>
                  <item.icon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 flex-shrink-0" />
                  <span className="text-xs truncate">{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </>
        )}
      </div>

      {/* User + Logout */}
      <div className="flex-shrink-0 border-t border-admin-100/50 dark:border-white/5 p-3">
        {!collapsed && user && (
          <div className="flex items-center space-x-3 px-3 py-2 mb-2 rounded-xl bg-admin-50 dark:bg-admin-900/20">
            <div className="w-8 h-8 bg-gradient-to-br from-admin-500 to-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name || 'Admin'}</p>
              <p className="text-xs text-admin-600 dark:text-admin-400 truncate">Administrator</p>
            </div>
          </div>
        )}
        <button onClick={logout}
          className={`w-full nav-item ${collapsed ? 'justify-center' : ''} text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600`}
          title={collapsed ? 'Logout' : undefined}>
          <LogOut className={`h-5 w-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'}`} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

const AdminSidebar = ({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed, darkMode }) => {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`absolute inset-y-0 left-0 w-72 ${darkMode ? 'sidebar-glass-dark' : 'sidebar-glass'} shadow-2xl`}>
              <SidebarContent collapsed={false} darkMode={darkMode} onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${darkMode ? 'sidebar-glass-dark' : 'sidebar-glass'} transition-all duration-300 ease-in-out ${collapsed ? 'lg:w-[72px]' : 'lg:w-64'} z-30`}>
        <SidebarContent collapsed={collapsed} darkMode={darkMode} />
        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow z-10">
          {collapsed ? <ChevronRight className="h-3 w-3 text-gray-500" /> : <ChevronLeft className="h-3 w-3 text-gray-500" />}
        </button>
      </div>
    </>
  );
};

export default AdminSidebar;
