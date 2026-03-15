import React from 'react';
import { useDatabaseData } from '../../hooks/useDatabaseData';
import { Bell, AlertTriangle, DollarSign, BookOpen } from 'lucide-react';

const Alerts = () => {
  // ✅ ONE LINE - gets ALL alerts auto-generated from database!
  const { alerts, loading } = useDatabaseData();

  if (loading) return <div>Loading...</div>;

  const getIcon = (type) => {
    switch(type) {
      case 'attendance': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'fee': return <DollarSign className="h-5 w-5 text-red-500" />;
      case 'course': return <BookOpen className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Alerts ({alerts.length})</h1>
      
      {alerts.map(alert => (
        <div key={alert.id} className="bg-white rounded-lg shadow p-4 mb-3">
          <div className="flex items-start">
            {getIcon(alert.type)}
            <div className="ml-3 flex-1">
              <h3 className="font-semibold">{alert.title}</h3>
              <p className="text-sm text-gray-600">{alert.message}</p>
              <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {alert.priority}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Alerts;