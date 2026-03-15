import React from 'react';
import {
  Server,
  Database,
  Users,
  HardDrive,
  Clock,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const SystemHealth = ({ health }) => {
  const metrics = [
    {
      label: 'Database',
      value: health.database,
      icon: Database,
      status: health.database === 'healthy' ? 'success' : 'warning'
    },
    {
      label: 'Server',
      value: health.server,
      icon: Server,
      status: health.server === 'healthy' ? 'success' : 'warning'
    },
    {
      label: 'Active Users',
      value: health.activeUsers,
      icon: Users,
      status: 'info'
    },
    {
      label: 'Storage Used',
      value: health.storageUsed,
      icon: HardDrive,
      status: health.storageUsed < '70%' ? 'success' : 'warning'
    },
    {
      label: 'Response Time',
      value: health.responseTime,
      icon: Clock,
      status: health.responseTime < '200ms' ? 'success' : 'warning'
    },
    {
      label: 'Uptime',
      value: health.uptime,
      icon: Activity,
      status: 'success'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              All systems operational
            </p>
          </div>
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${getStatusColor(metric.status)}`}>
                  {getStatusIcon(metric.status)}
                  <span className="capitalize">{metric.status}</span>
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Last checked</span>
            <span className="text-gray-900 dark:text-white font-medium">Just now</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600 dark:text-gray-400">Next backup</span>
            <span className="text-gray-900 dark:text-white font-medium">2:00 AM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;