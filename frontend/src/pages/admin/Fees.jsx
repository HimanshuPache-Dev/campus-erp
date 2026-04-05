import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, CheckCircle } from 'lucide-react';
import { useDatabaseData } from '../../hooks/useDatabaseData';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';
import { SkeletonStats, SkeletonTable } from '../../components/common/SkeletonLoader';
import { staggerContainer, staggerItem } from '../../animations/variants';
import CountUp from '../../components/common/CountUp';
import toast from 'react-hot-toast';

const statusColors = {
  paid: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  overdue: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  partial: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
};

const Fees = () => {
  const navigate = useNavigate();
  const { fees, loading, refreshData } = useDatabaseData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const totalPending = fees
    .filter(f => f.status === 'pending' || f.status === 'overdue')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  const handleMarkPaid = async (id) => {
    try {
      const { error } = await supabase
        .from('fees')
        .update({ 
          status: 'paid', 
          payment_method: 'manual',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Fee marked as paid');
      refreshData();
    } catch (e) {
      toast.error('Failed to update fee');
    }
  };

  const filtered = fees.filter(f => {
    const name = `${f.users?.first_name || ''} ${f.users?.last_name || ''}`.toLowerCase();
    const matchSearch = name.includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'all' || f.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const summary = {
    total: fees.reduce((s, f) => s + (f.amount || 0), 0),
    paid: fees.filter(f => f.status === 'paid').reduce((s, f) => s + (f.amount || 0), 0),
    pending: fees.filter(f => f.status === 'pending').reduce((s, f) => s + (f.amount || 0), 0),
    overdue: fees.filter(f => f.status === 'overdue').reduce((s, f) => s + (f.amount || 0), 0),
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fees Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage student fees</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/admin/fees/assign')}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Assign Fees
        </motion.button>
      </motion.div>

      {loading ? <SkeletonStats /> : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Fees', value: summary.total, color: 'text-gray-900 dark:text-white' },
            { label: 'Collected', value: summary.paid, color: 'text-green-600 dark:text-green-400' },
            { label: 'Pending', value: summary.pending, color: 'text-yellow-600 dark:text-yellow-400' },
            { label: 'Overdue', value: summary.overdue, color: 'text-red-600 dark:text-red-400' },
          ].map(({ label, value, color }) => (
            <motion.div key={label} variants={staggerItem} whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
              <p className={`text-2xl font-bold mt-2 ${color}`}>
                ₹<CountUp end={value} />
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search students..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {loading ? <SkeletonTable rows={5} /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['Student', 'Fee Type', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="hidden" animate="show"
                className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">No fee records found</td></tr>
                ) : filtered.map(fee => (
                  <motion.tr key={fee.id} variants={staggerItem}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {fee.users?.first_name} {fee.users?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{fee.users?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{fee.fee_type}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">₹{fee.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{fee.due_date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[fee.status] || statusColors.pending}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {fee.status !== 'paid' && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleMarkPaid(fee.id)}
                          className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Mark Paid
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Showing {filtered.length} of {fees.length} records</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Fees;
