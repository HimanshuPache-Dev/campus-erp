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

      // Fetch enrolled courses for current academic year
      const { data: enrollments, error: enrollError } = await supabase
        .from('student_enrollments')
        .select('course_id')
        .eq('student_id', user.id);

      if (enrollError) throw enrollError;

      const courseIds = enrollments?.map(e => e.course_id) || [];

      if (courseIds.length === 0) {
        setScheduleData({});
        setCourses([]);
        setLoading(false);
        return;
      }

      // Fetch timetable slots for enrolled courses (don't filter by semester)
      const { data: slotsData, error: slotsError } = await supabase
        .from('timetable_slots')
        .select(`
          *,
          courses (course_code, course_name, credits),
          users:faculty_id (first_name, last_name)
        `)
        .in('course_id', courseIds)
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (slotsError) throw slotsError;

      // Organize slots by day
      const organized = {};
      weekDays.forEach(day => {
        organized[day.id] = slotsData?.filter(s => 
          s.day_of_week.toLowerCase() === day.label.toLowerCase()
        ) || [];
      });

      setScheduleData(organized);
      setCourses(slotsData || []);
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

  const hasSchedule = Object.values(scheduleData).some(day => day.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Timetable</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {user?.department} • {semester} {academicYear}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mt-4 sm:mt-0"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      {!hasSchedule ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Timetable Available</h3>
          <p className="text-gray-500 dark:text-gray-400">Your course schedule will appear here once published by admin</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="border border-gray-200 dark:border-gray-600 p-3 text-left font-semibold text-gray-900 dark:text-white">
                  Time
                </th>
                {weekDays.map(day => (
                  <th key={day.id} className="border border-gray-200 dark:border-gray-600 p-3 text-left font-semibold text-gray-900 dark:text-white">
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                <tr key={time}>
                  <td className="border border-gray-200 dark:border-gray-600 p-3 font-medium bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                    {time}
                  </td>
                  {weekDays.map(day => {
                    const slot = scheduleData[day.id]?.find(s => s.start_time === time + ':00');
                    return (
                      <td key={day.id} className="border border-gray-200 dark:border-gray-600 p-2">
                        {slot ? (
                          <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg border-l-4 border-purple-500">
                            <div className="font-semibold text-sm text-gray-900 dark:text-white">
                              {slot.courses?.course_code}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {slot.courses?.course_name}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                              <User className="h-3 w-3 mr-1" />
                              {slot.users?.first_name} {slot.users?.last_name}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {slot.room_number}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center text-sm">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentTimetable;
