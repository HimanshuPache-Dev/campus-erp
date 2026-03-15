import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  DollarSign,
  Calendar,
  X
} from 'lucide-react';

const AlertsPanel = ({ alerts }) => {
  const [dismissed, setDismissed] = useState([]);

  const dismissAlert = (sectionId, itemId) => {
    setDismissed([...dismissed, `${sectionId}-${itemId}`]);
  };

  const alertSections = [
    {
      id: 'attendance',
      title: 'Low Attendance Alert',
      icon: AlertTriangle,
      color: 'red',
      items: alerts.lowAttendance,
      badge: `${alerts.lowAttendance.length} students`
    },
    {
      id: 'courses',
      title: 'Unassigned Courses',
      icon: BookOpen,
      color: 'yellow',
      items: alerts.unassignedCourses,
      badge: `${alerts.unassignedCourses.length} courses`
    },
    {
      id: 'fees',
      title: 'Fee Defaulters',
      icon: DollarSign,
      color: 'orange',
      items: alerts.feeDefaulters,
      badge: `${alerts.feeDefaulters.length} students`
    },
    {
      id: 'exams',
      title: 'Upcoming Exams',
      icon: Calendar,
      color: 'blue',
      items: alerts.upcomingExams,
      badge: `${alerts.upcomingExams.length} exams`
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-400',
          badge: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400',
          icon: 'text-red-500 dark:text-red-400'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-400',
          badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400',
          icon: 'text-yellow-500 dark:text-yellow-400'
        };
      case 'orange':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-800 dark:text-orange-400',
          badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-400',
          icon: 'text-orange-500 dark:text-orange-400'
        };
      case 'blue':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-400',
          badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400',
          icon: 'text-blue-500 dark:text-blue-400'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-800 dark:text-gray-400',
          badge: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400',
          icon: 'text-gray-500 dark:text-gray-400'
        };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts & Warnings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {alertSections.reduce((acc, section) => acc + section.items.length, 0)} active alerts
            </p>
          </div>
          <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {alertSections.map((section) => {
          const colors = getColorClasses(section.color);
          const filteredItems = section.items.filter(
            item => !dismissed.includes(`${section.id}-${item.id}`)
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={section.id} className={`p-4 ${colors.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <section.icon className={`h-5 w-5 ${colors.icon}`} />
                  <h4 className={`text-sm font-medium ${colors.text}`}>
                    {section.title}
                  </h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                    {section.badge}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow group"
                  >
                    <div className="flex-1">
                      {'name' in item && (
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                      )}
                      {'course' in item && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.course}</p>
                      )}
                      {item.attendance && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Attendance: {item.attendance}
                        </p>
                      )}
                      {item.amount && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          Due: {item.amount} • {item.dueDate}
                        </p>
                      )}
                      {item.date && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {item.date} at {item.time} • {item.room}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => dismissAlert(section.id, item.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertsPanel;