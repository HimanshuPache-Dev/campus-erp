import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { supabase } from '../../config/supabase';
import {
  CreditCard,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Printer,
  Eye,
  ChevronRight,
  IndianRupee
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentFees = () => {
  const { user } = useAuth();
  const { semester, academicYear } = useSemester();
  const [selectedYear, setSelectedYear] = useState('2024-25');
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchFeeData();
    }
  }, [user?.id, selectedYear]);

  const fetchFeeData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', user.id)
        .eq('academic_year', selectedYear)
        .order('due_date', { ascending: true });

      if (error) throw error;

      setFeeData(data || []);
    } catch (error) {
      console.error('Error fetching fee data:', error);
      toast.error('Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    const totalFees = feeData.reduce((sum, f) => sum + (f.amount || 0), 0);
    const paidFees = feeData.reduce((sum, f) => sum + (f.amount_paid || 0), 0);
    const pendingFees = totalFees - paidFees;

    return { totalFees, paidFees, pendingFees };
  };

  const years = ['2023-24', '2024-25', '2025-26'];

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'overdue': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const handleDownloadReceipt = (receiptNo) => {
    toast.success(`Downloading receipt ${receiptNo}`);
  };

  const handlePayNow = () => {
    toast.success('Redirecting to payment gateway...');
  };

  const handleDownloadStatement = () => {
    toast.success('Downloading fee statement');
  };

  const feeSummary = calculateSummary();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (feeData.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Fee Records</h3>
        <p className="text-gray-500 dark:text-gray-400">No fee data available for this academic year</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Details</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {user?.department} • {semester} {academicYear}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={handleDownloadStatement}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Statement
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Fees</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{feeSummary.totalFees.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Paid Fees</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{feeSummary.paidFees.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Fees</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{feeSummary.pendingFees.toLocaleString()}</p>
        </div>
      </div>

      {/* Fee Payment Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Progress</h3>
          <button
            onClick={handlePayNow}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            Pay Now
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Paid: ₹{feeSummary.paidFees.toLocaleString()}</span>
            <span className="text-gray-600 dark:text-gray-400">Pending: ₹{feeSummary.pendingFees.toLocaleString()}</span>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${feeSummary.totalFees > 0 ? (feeSummary.paidFees / feeSummary.totalFees) * 100 : 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{feeSummary.totalFees > 0 ? (feeSummary.paidFees / feeSummary.totalFees * 100).toFixed(1) : 0}% Complete</span>
            <span>₹{feeSummary.paidFees.toLocaleString()} of ₹{feeSummary.totalFees.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Fee Structure Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fee Structure</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Head</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pending</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {feeData.map((fee, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{fee.fee_type}</td>
                  <td className="px-6 py-4 text-right">₹{fee.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-green-600">₹{fee.amount_paid.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-red-600">₹{(fee.amount - fee.amount_paid).toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fee.payment_status)}`}>
                      {getStatusIcon(fee.payment_status)}
                      <span className="ml-1 capitalize">{fee.payment_status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    {fee.due_date ? new Date(fee.due_date).toLocaleDateString('en-IN') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-semibold">
              <tr>
                <td className="px-6 py-4 text-gray-900 dark:text-white">Total</td>
                <td className="px-6 py-4 text-right">₹{feeSummary.totalFees.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-green-600">₹{feeSummary.paidFees.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-red-600">₹{feeSummary.pendingFees.toLocaleString()}</td>
                <td colSpan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={handlePayNow}
          className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
        >
          <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Pay Now</p>
        </button>
        <button
          onClick={handleDownloadStatement}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
        >
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Statement</p>
        </button>
        <button
          onClick={() => toast.success('Opening payment history')}
          className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
        >
          <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">History</p>
        </button>
        <button
          onClick={() => window.print()}
          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
        >
          <Printer className="h-6 w-6 text-gray-600 dark:text-gray-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Print</p>
        </button>
      </div>
    </div>
  );
};

export default StudentFees;
