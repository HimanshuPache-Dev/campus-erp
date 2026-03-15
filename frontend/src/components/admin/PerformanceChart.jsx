import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const PerformanceChart = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Avg GPA: <span className="font-medium text-primary-600 dark:text-primary-400">{payload[0].value}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Students: <span className="font-medium">{payload[0].payload.students}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={document.documentElement.classList.contains('dark') ? '#374151' : '#f0f0f0'} />
        <XAxis 
          dataKey="department" 
          tick={{ fontSize: 12, fill: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#4B5563' }} 
        />
        <YAxis 
          domain={[0, 4]} 
          tick={{ fontSize: 12, fill: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#4B5563' }} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#4B5563' }} />
        <Bar dataKey="avgGPA" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;