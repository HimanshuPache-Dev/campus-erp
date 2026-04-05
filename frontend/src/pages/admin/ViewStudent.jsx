import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, GraduationCap, User, Edit } from 'lucide-react';
import { supabase } from '../../config/supabase';
import toast from 'react-hot-toast';

const ViewStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

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
      setStudent(data);
    } catch (error) {
      console.error('Error fetching student:', error);
      toast.error('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Student not found</p>
        <button onClick={() => navigate('/admin/students')} className="mt-4 text-primary-600 hover:underline">
          Back to Students
        </button>
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
        <button
          onClick={() => navigate(`/admin/students/${id}/edit`)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Student
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-12">
          <div className="flex items-center space-x-6">
            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
              {student.first_name?.[0]}{student.last_name?.[0]}
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold">{student.first_name} {student.last_name}</h1>
              <p className="text-blue-100 mt-1">{student.student_details?.[0]?.enrollment_number || 'No enrollment number'}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-8 space-y-8">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem icon={Mail} label="Email" value={student.email} />
              <InfoItem icon={Phone} label="Phone" value={student.phone || 'Not provided'} />
              <InfoItem icon={MapPin} label="Address" value={student.address || 'Not provided'} />
              <InfoItem icon={Calendar} label="Date of Birth" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'Not provided'} />
              <InfoItem icon={User} label="Gender" value={student.gender || 'Not provided'} />
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-primary-600" />
              Academic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Department" value={student.department || 'Not assigned'} />
              <InfoItem label="Current Semester" value={student.student_details?.[0]?.current_semester || 'Not set'} />
              <InfoItem label="Batch Year" value={student.student_details?.[0]?.batch_year || 'Not set'} />
              <InfoItem label="CGPA" value={student.student_details?.[0]?.cgpa || 'N/A'} />
              <InfoItem label="Admission Date" value={student.student_details?.[0]?.admission_date ? new Date(student.student_details[0].admission_date).toLocaleDateString() : 'Not set'} />
            </div>
          </div>

          {/* Guardian Information */}
          {student.student_details?.[0] && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Guardian Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem label="Guardian Name" value={student.student_details[0].guardian_name || 'Not provided'} />
                <InfoItem label="Guardian Phone" value={student.student_details[0].guardian_phone || 'Not provided'} />
                <InfoItem label="Guardian Email" value={student.student_details[0].guardian_email || 'Not provided'} />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3">
    {Icon && <Icon className="h-5 w-5 text-gray-400 mt-0.5" />}
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-base font-medium text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  </div>
);

export default ViewStudent;
