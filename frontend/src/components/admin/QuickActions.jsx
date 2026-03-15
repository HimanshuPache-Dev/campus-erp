import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  GraduationCap,
  BookOpen,
  FileText,
  BarChart3,
  Download,
  Mail,
  Calendar,
  Settings,
  DollarSign,
  Users,
  Bell,        // ✅ Add Bell import
  Clock,       // ✅ Add Clock for Schedule Exam
  Award,
  TrendingUp,
  Activity
} from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Add Student',
      icon: UserPlus,
      color: 'blue',
      href: '/admin/students/add',
      description: 'Enroll new student'
    },
    {
      label: 'Add Faculty',
      icon: GraduationCap,
      color: 'green',
      href: '/admin/faculty/add',
      description: 'Add new faculty member'
    },
    {
      label: 'Create Course',
      icon: BookOpen,
      color: 'purple',
      href: '/admin/courses/create',
      description: 'Add new course'
    },
    {
      label: 'Send Notification',
      icon: Bell,        // ✅ Now Bell is defined
      color: 'pink',
      href: '/admin/notifications/send',
      description: 'Send announcement'
    },
    {
      label: 'Schedule Exam',
      icon: Calendar,     // ✅ Calendar is already imported
      color: 'indigo',
      href: '/admin/exams/schedule',
      description: 'Create exam schedule'
    },
    {
      label: 'Generate Report',
      icon: FileText,
      color: 'yellow',
      href: '/admin/reports',
      description: 'Create custom report'
    },
    {
      label: 'Manage Fees',
      icon: DollarSign,
      color: 'orange',
      href: '/admin/fees',
      description: 'Process payments'
    },
    {
      label: 'View Analytics',
      icon: BarChart3,
      color: 'red',
      href: '/admin/analytics',
      description: 'Detailed insights'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50',
      green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50',
      purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50',
      pink: 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/50',
      orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50',
      indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50',
      red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Frequently used operations
            </p>
          </div>
          <Settings className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.href)}
              className="group p-4 rounded-lg border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 text-center"
            >
              <div className={`w-12 h-12 mx-auto rounded-lg ${getColorClasses(action.color)} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;