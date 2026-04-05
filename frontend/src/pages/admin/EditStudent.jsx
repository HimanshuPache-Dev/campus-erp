import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    department: '',
    current_semester: '',
    batch_year: '',
    cgpa: '',
    enrollment_number: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: ''
  });

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          student_details (*)
        `)
        .eq('id', id)
        .eq('role', 'student')
        .single();

      if (error) throw error;

      const details = data.student_details?.[0] || {};
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        department: data.department || '',
        current_semester: details.current_semester || '',
        batch_year: details.batch_year || '',
        cgpa: details.cgpa || '',
        enrollment_number: details.enrollment_number || '',
        guardian_name: details.guardian_name || '',
        guardian_phone: details.guardian_phone || '',
        guardian_email: details.guardian_email || ''
      });
    } catch (error) {
      console.error('Error fetching student:', error);
      toast.error('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender,
          department: formData.department
        })
        .eq('id', id);

      if (userError) throw userError;

      // Update student_details table
      const { error: detailsError } = await supabase
        .from('student_details')
        .update({
          current_semester: parseInt(formData.current_semester) || null,
          batch_year: parseInt(formData.batch_year) || null,
          cgpa: parseFloat(formData.cgpa) || null,
          enrollment_number: formData.enrollment_number,
          guardian_name: formData.guardian_name,
          guardian_phone: formData.guardian_phone,
          guardian_email: formData.guardian_email
        })
        .eq('user_id', id);

      if (detailsError) throw detailsError;

      toast.success('Student updated successfully!');
      navigate(`/admin/students/${id}`);
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
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
          onClick={() => navigate('/admin/students')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Students
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Student</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="First Name" required value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
              <InputField label="Last Name" required value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
              <InputField label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              <InputField label="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <InputField label="Date of Birth" type="date" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} />
              <SelectField label="Gender" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} options={['', 'Male', 'Female', 'Other']} />
              <div className="md:col-span-2">
                <InputField label="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Enrollment Number" required value={formData.enrollment_number} onChange={(e) => setFormData({...formData, enrollment_number: e.target.value})} />
              <InputField label="Department" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
              <InputField label="Current Semester" type="number" value={formData.current_semester} onChange={(e) => setFormData({...formData, current_semester: e.target.value})} />
              <InputField label="Batch Year" type="number" value={formData.batch_year} onChange={(e) => setFormData({...formData, batch_year: e.target.value})} />
              <InputField label="CGPA" type="number" step="0.01" value={formData.cgpa} onChange={(e) => setFormData({...formData, cgpa: e.target.value})} />
            </div>
          </div>

          {/* Guardian Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Guardian Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Guardian Name" value={formData.guardian_name} onChange={(e) => setFormData({...formData, guardian_name: e.target.value})} />
              <InputField label="Guardian Phone" value={formData.guardian_phone} onChange={(e) => setFormData({...formData, guardian_phone: e.target.value})} />
              <InputField label="Guardian Email" type="email" value={formData.guardian_email} onChange={(e) => setFormData({...formData, guardian_email: e.target.value})} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/admin/students')}
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
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const InputField = ({ label, required, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
    />
  </div>
);

const SelectField = ({ label, options, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
    <select
      {...props}
      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt || 'Select...'}</option>
      ))}
    </select>
  </div>
);

export default EditStudent;
