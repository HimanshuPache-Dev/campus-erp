import React from 'react';
import {
  CheckCircle,
  UserPlus,
  DollarSign,
  Upload,
  Book,
  Clock,
  MoreVertical
} from 'lucide-react';

const RecentActivity = ({ activities }) => {
  const getIcon = (icon) => {
    switch (icon) {
      case 'check':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'user-plus':
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'dollar':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'upload':
        return <Upload className="h-5 w-5 text-yellow-500" />;
      case 'book':
        return <Book className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
        >
          <div className="flex-shrink-0">
            {getIcon(activity.icon)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.user}
              </p>
              <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(activity.type)}`}>
                {activity.type}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {activity.action}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {activity.timestamp}
            </p>
          </div>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
            <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;