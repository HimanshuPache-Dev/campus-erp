import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary', subtitle }) => {
  const colors = {
    primary: {
      bg: 'bg-primary-50 dark:bg-primary-900/30',
      text: 'text-primary-600 dark:text-primary-400',
      dark: 'bg-primary-100 dark:bg-primary-900/50',
      gradient: 'from-primary-500 to-primary-600'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
      dark: 'bg-green-100 dark:bg-green-900/50',
      gradient: 'from-green-500 to-green-600'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      dark: 'bg-blue-100 dark:bg-blue-900/50',
      gradient: 'from-blue-500 to-blue-600'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      text: 'text-yellow-600 dark:text-yellow-400',
      dark: 'bg-yellow-100 dark:bg-yellow-900/50',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      dark: 'bg-purple-100 dark:bg-purple-900/50',
      gradient: 'from-purple-500 to-purple-600'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      text: 'text-red-600 dark:text-red-400',
      dark: 'bg-red-100 dark:bg-red-900/50',
      gradient: 'from-red-500 to-red-600'
    },
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300"></div>
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline mt-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtitle && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">{subtitle}</span>
            )}
          </div>
          
          {trend && (
            <div className="flex items-center mt-3">
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                trend === 'up' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {trend === 'up' ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                <span>{trendValue}</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${colors[color].bg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-6 w-6 ${colors[color].text}`} />
        </div>
      </div>

      {trend && (
        <div className="mt-4">
          <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${colors[color].gradient} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(Math.abs(parseInt(trendValue)) * 10, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;