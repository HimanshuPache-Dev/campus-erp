import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDatabaseData } from '../../hooks/useDatabaseData';
import { Search, Plus, Edit, Eye, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import { staggerContainer, staggerItem } from '../../animations/variants';
import toast from 'react-hot-toast';
import { supabase } from '../../config/supabase';

const Students = () => {
  const { students, loading, refreshData } = useDatabaseData();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const filtered = students.filter(s =>
    `${s.first_name} ${s.last_name} ${s.email} ${s.department}`
      .toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Student deleted');
      refreshData();
    } catch (e) {
      toast.error(e.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{students.length} total students</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/admin/students/add')}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Student
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['Student', 'Email', 'Department', 'Semester', 'Enrollment', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="divide-y divide-gray-200 dark:divide-gray-700"
              >
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchTerm ? 'No students match your search' : 'No students yet. Add your first student!'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map(student => (
                      <motion.tr
                        key={student.id}
                        variants={staggerItem}
                        exit={{ opacity: 0, x: -20 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-9 w-9 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-300">
                              {student.first_name?.[0]}{student.last_name?.[0]}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {student.first_name} {student.last_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{student.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{student.department || '—'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                            Sem {student.student_details?.[0]?.current_semester || student.currentSemester || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {student.student_details?.[0]?.enrollment_number || student.enrollment_number || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <motion.button whileHover={{ scale: 1.15 }} onClick={() => navigate(`/admin/students/${student.id}`)}
                              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                              <Eye className="h-4 w-4 text-blue-500" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.15 }} onClick={() => navigate(`/admin/students/${student.id}/edit`)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                              <Edit className="h-4 w-4 text-gray-500" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.15 }}
                              onClick={() => handleDelete(student.id, `${student.first_name} ${student.last_name}`)}
                              disabled={deletingId === student.id}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filtered.length} of {students.length} students
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Students;
