import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, Bell, Shield, Globe } from 'lucide-react';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ tables: 0, records: 0, size: '0 MB' });

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    setLoading(true);
    try {
      const tables = ['users', 'courses', 'attendance', 'results', 'fees', 'notifications'];
      let totalRecords = 0;
      for (const table of tables) {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        totalRecords += count || 0;
      }
      setStats({ tables: tables.length, records: totalRecords, size: 'N/A' });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Database Tables</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{stats.tables}</p>
            </div>
            <Database className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{loading ? '...' : stats.records}</p>
            </div>
            <SettingsIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Database Size</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{stats.size}</p>
            </div>
            <Globe className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Institution Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Institution Name</label>
            <input type="text" defaultValue="Campus ERP College" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
            <textarea rows="2" defaultValue="123 Education Street, City, State" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
