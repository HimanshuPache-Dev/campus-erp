import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { supabase } from '../../config/supabase';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Users,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  List
} from 'lucide-react';
import toast from 'react-hot-toast';

const FacultySchedule = () => {
  const { user } = useAuth();
  const { semester, academicYear } = useSemester();
  const [viewMode, setViewMode] = useState('month');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (user?.id) {
      fetchSchedule();
    }
  }, [user?.id, semester, academicYear]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('course_code');

      if (error) throw error;

      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Schedule</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {semester} {academicYear} • {user?.department}
          </p>
        </div>
        <button
          onClick={() => toast.success('Exporting schedule...')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 mt-4 sm:mt-0"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Schedule Available</h3>
          <p className="text-gray-500 dark:text-gray-400">Your teaching schedule will appear here</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium px-2 py-1 bg-white dark:bg-gray-800 rounded-full">
                    {course.course_code}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{course.course_name}</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center mt-2">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Semester {course.semester}
                  </div>
                  <div className="flex items-center mt-1">
                    <Users className="h-4 w-4 mr-2" />
                    Credits: {course.credits}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              📅 Detailed class schedule with timings will be available soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultySchedule;
