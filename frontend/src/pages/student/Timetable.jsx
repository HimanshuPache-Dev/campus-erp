import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { supabase } from '../../config/supabase';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  List
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentTimetable = () => {
  const { user } = useAuth();
  const { semester, academicYear } = useSemester();
  const [viewMode, setViewMode] = useState('week');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState({});
  const [courses, setCourses] = useState([]);

  const weekDays = [
    { id: 'monday', label: 'Monday', short: 'Mon' },
    { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { id: 'thursday', label: 'Thursday', short: 'Thu' },
    { id: 'friday', label: 'Friday', short: 'Fri' },
    { id: 'saturday', label: 'Saturday', short: 'Sat' },
  ];

  useEffect(() => {
    if (user?.id) {
      fetchSchedule();
    }
  }, [user?.id, semester, academicYear]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);

      // Fetch enrolled courses
      const { data: enrollments, error: enrollError } = await supabase
        .from('student_enrollments')
        .select(`
          course_id,
          courses (
            id,
            course_code,
            course_name,
            semester
          )
        `)
        .eq('student_id', user.id)
        .eq('academic_year', academicYear);

      if (enrollError) throw enrollError;

      setCourses(enrollments?.map(e => e.courses) || []);

      // For now, show empty schedule as we don't have a schedule table
      // In production, you would fetch from a schedule/timetable table
      setScheduleData({});
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'Lecture': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-l-4 border-blue-500';
      case 'Practical': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-l-4 border-green-500';
      case 'Lab': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-l-4 border-purple-500';
      case 'Exam': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-l-4 border-red-500';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleExport = () => {
    toast.success('Exporting timetable...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Timetable</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {user?.department} • {semester} {academicYear}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setViewMode(viewMode === 'week' ? 'day' : 'week')}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {viewMode === 'week' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Timetable Available</h3>
          <p className="text-gray-500 dark:text-gray-400">Your course schedule will appear here once published</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Enrolled Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, index) => (
              <div key={index} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white">{course.course_name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{course.course_code}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Semester {course.semester}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              📅 Detailed class schedule will be available soon. Check back later for your weekly timetable.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTimetable;
