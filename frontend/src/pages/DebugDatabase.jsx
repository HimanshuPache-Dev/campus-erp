import React from 'react';
import { useDatabaseData } from '../hooks/useDatabaseData';

const DebugDatabase = () => {
  const { students, faculty, courses, attendance, fees, alerts, stats, loading, lastUpdated } = useDatabaseData();

  if (loading) return <div className="p-8 text-center">Loading database...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Database Status</h1>
      <p className="text-sm text-gray-500 mb-4">Last Updated: {new Date(lastUpdated).toLocaleString()}</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
          <div className="text-sm text-blue-800">Students</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.totalFaculty}</div>
          <div className="text-sm text-green-800">Faculty</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.totalCourses}</div>
          <div className="text-sm text-purple-800">Courses</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{alerts.length}</div>
          <div className="text-sm text-yellow-800">Active Alerts</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Students ({students.length})</h2>
          <pre className="text-xs bg-gray-50 p-2 rounded max-h-40 overflow-auto">
            {JSON.stringify(students.slice(0, 3), null, 2)}
          </pre>
        </div>
        
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Alerts ({alerts.length})</h2>
          <pre className="text-xs bg-gray-50 p-2 rounded max-h-40 overflow-auto">
            {JSON.stringify(alerts, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugDatabase;