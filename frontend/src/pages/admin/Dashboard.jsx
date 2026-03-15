import React from 'react';
import { motion } from 'framer-motion';
import { useDatabaseData } from '../../hooks/useDatabaseData';
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import CountUp from '../../components/common/CountUp';
import { SkeletonStats } from '../../components/common/SkeletonLoader';
import { staggerContainer, staggerItem } from '../../animations/variants';

const StatCard = ({ title, value, icon: Icon, color, delay = 0, prefix = '', suffix = '' }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.03, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-default"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        <CountUp end={typeof value === 'number' ? value : 0} prefix={prefix} suffix={suffix} />
      </p>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const { students, faculty, courses, stats, alerts, loading, lastUpdated } = useDatabaseData();

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        <SkeletonStats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Welcome back'}
          </p>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-700 dark:text-yellow-400">{alerts.length} alert{alerts.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="blue" />
        <StatCard title="Total Faculty" value={stats.totalFaculty} icon={GraduationCap} color="green" />
        <StatCard title="Active Courses" value={stats.totalCourses} icon={BookOpen} color="purple" />
        <StatCard title="Pending Fees" value={stats.pendingFees} icon={DollarSign} color="red" prefix="₹" />
      </motion.div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 space-y-2"
        >
          <h2 className="font-semibold text-yellow-800 dark:text-yellow-300 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Active Alerts ({alerts.length})
          </h2>
          {alerts.map(alert => (
            <p key={alert.id} className="text-sm text-yellow-700 dark:text-yellow-400 ml-6">
              • {alert.title}: {alert.message}
            </p>
          ))}
        </motion.div>
      )}

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Attendance</h2>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">
            <CountUp end={stats.presentToday} />
            <span className="text-xl text-gray-400 font-normal"> / {stats.totalStudents}</span>
          </p>
          <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: stats.totalStudents > 0 ? `${(stats.presentToday / stats.totalStudents) * 100}%` : '0%' }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              className="h-full bg-green-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* Students Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Students</h2>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {students.slice(0, 3).map((s, i) => (
              <div key={s.id} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300">
                  {s.first_name?.[0]}{s.last_name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{s.first_name} {s.last_name}</p>
                  <p className="text-xs text-gray-500">{s.department}</p>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No students yet</p>
            )}
          </div>
        </motion.div>

        {/* Courses Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Courses</h2>
            <BookOpen className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {courses.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{c.course_name}</p>
                  <p className="text-xs text-gray-500">{c.course_code} • {c.department}</p>
                </div>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                  Sem {c.semester}
                </span>
              </div>
            ))}
            {courses.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No courses yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
