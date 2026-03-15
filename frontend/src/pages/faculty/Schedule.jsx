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

      // Fetch timetable slots for this faculty
      const { data, error } = await supabase
        .from('timetable_slots')
        .select(`
          *,
          courses (course_code, course_name, semester, credits)
        `)
        .eq('faculty_id', user.id)
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

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
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Schedule Available</h3>
          <p className="text-gray-500 dark:text-gray-400">Your teaching schedule will appear here once timetable is created</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="border border-gray-200 dark:border-gray-600 p-3 text-left font-semibold text-gray-900 dark:text-white">Day</th>
                <th className="border border-gray-200 dark:border-gray-600 p-3 text-left font-semibold text-gray-900 dark:text-white">Time</th>
                <th className="border border-gray-200 dark:border-gray-600 p-3 text-left font-semibold text-gray-900 dark:text-white">Course</th>
                <th className="border border-gray-200 dark:border-gray-600 p-3 text-left font-semibold text-gray-900 dark:text-white">Room</th>
                <th className="border border-gray-200 dark:border-gray-600 p-3 text-left font-semibold text-gray-900 dark:text-white">Semester</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((slot) => (
                <tr key={slot.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="border border-gray-200 dark:border-gray-600 p-3 text-gray-900 dark:text-white">
                    {slot.day_of_week}
                  </td>
                  <td className="border border-gray-200 dark:border-gray-600 p-3 text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                    </div>
                  </td>
                  <td className="border border-gray-200 dark:border-gray-600 p-3">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {slot.courses?.course_code}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {slot.courses?.course_name}
                    </div>
                  </td>
                  <td className="border border-gray-200 dark:border-gray-600 p-3 text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      {slot.room_number}
                    </div>
                  </td>
                  <td className="border border-gray-200 dark:border-gray-600 p-3 text-gray-900 dark:text-white">
                    Semester {slot.courses?.semester}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FacultySchedule;
