import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, DollarSign, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDatabaseData } from '../../hooks/useDatabaseData';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';

const AssignFees = () => {
  const navigate = useNavigate();
  const { students, loading } = useDatabaseData();
  const [saving, setSaving] = useState(false);
  const [useCustomFee, setUseCustomFee] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    fee_type: '',
    amount: '',
    due_date: '',
    academic_year: '2025-26',
    semester_type: 'Winter'
  });

  const commonFeeTypes = [
    'Tuition Fee',
    'Library Fee',
    'Lab Fee',
    'Sports Fee',
    'Exam Fee',
    'Development Fee',
    'Hostel Fee',
    'Transport Fee',
    'Admission Fee',
    'Registration Fee',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.student_id || !formData.fee_type || !formData.amount || !formData.due_date) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('fees')
        .insert({
          student_id: formData.student_id,
          fee_type: formData.fee_type,
          amount: parseFloat(formData.amount),
          due_date: formData.due_date,
          status: 'pending',
          academic_year: formData.academic_year,
          semester_type: formData.semester_type
        });

      if (error) throw error;

      toast.success('Fee assigned successfully!');
      navigate('/admin/fees');
    } catch (error) {
      console.error('Error assigning fee:', error);
      toast.error('Failed to assign fee');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <button
          onClick={() => navigate('/admin/fees')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Fees
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <DollarSign className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assign Fees</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Assign fees to individual or all students</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Selection - First */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Student <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.student_id}
              onChange={(e) => setFormData({...formData, student_id: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select a student...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} - {student.student_details?.[0]?.enrollment_number || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          {/* Fee Type Selection or Custom Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fee Type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!useCustomFee}
                    onChange={() => setUseCustomFee(false)}
                    className="mr-2"
                  />
                  <span className="text-sm">Select from common types</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={useCustomFee}
                    onChange={() => setUseCustomFee(true)}
                    className="mr-2"
                  />
                  <span className="text-sm">Enter custom fee type</span>
                </label>
              </div>

              {!useCustomFee ? (
                <select
                  value={formData.fee_type}
                  onChange={(e) => setFormData({...formData, fee_type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select fee type...</option>
                  {commonFeeTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.fee_type}
                  onChange={(e) => setFormData({...formData, fee_type: e.target.value})}
                  placeholder="Enter custom fee type (e.g., Development Fee)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              )}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter amount (e.g., 5000)"
              required
              min="0"
              step="0.01"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the exact amount for this fee
            </p>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Academic Year & Semester */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Academic Year
              </label>
              <input
                type="text"
                value={formData.academic_year}
                onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Semester Type
              </label>
              <select
                value={formData.semester_type}
                onChange={(e) => setFormData({...formData, semester_type: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="Winter">Winter</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/admin/fees')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Assigning...' : 'Assign Fee'}
            </button>
          </div>
        </form>

        {/* Quick Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Quick Tips:</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• Select a student first, then choose or enter the fee type</li>
            <li>• You can select from common fee types or enter a custom one</li>
            <li>• Enter the exact amount you want to charge for this fee</li>
            <li>• Set an appropriate due date for payment</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default AssignFees;
