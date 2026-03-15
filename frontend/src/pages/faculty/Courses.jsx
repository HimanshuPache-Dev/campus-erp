import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  Search,
  Filter,
  ChevronRight,
  GraduationCap,
  TrendingUp,
  Download,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';

const FacultyCourses = () => {
  const { user } = useAuth();
  const { semester, academicYear } = useSemester();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
    }
  }, [user?.id]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, course_code, course_name, semester, department, credits')
        .eq('is_active', true)
        .limit(10);

      if (error) throw error;

      const coursesWithStats = await Promise.all(
        data.map(async (course) => {
          
          // Get student count
          const { count } = await supabase
            .from('student_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);

          // Get attendance stats
          const { data: attendanceData } = await supabase
            .from('attendance')
            .select('status')
            .eq('course_id', course.id)
            .eq('faculty_id', user.id);

          const totalRecords = attendanceData?.length || 0;
          const presentRecords = attendanceData?.filter(a => a.status === 'present').length || 0;
          const attendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

          // Get average marks
          const { data: resultsData } = await supabase
            .from('results')
            .select('marks_obtained, total_marks')
            .eq('course_id', course.id)
            .eq('faculty_id', user.id);

          let avgMarks = 0;
          if (resultsData && resultsData.length > 0) {
            const totalPercentage = resultsData.reduce((sum, r) => 
              sum + ((r.marks_obtained / r.total_marks) * 100), 0
            );
            avgMarks = Math.round(totalPercentage / resultsData.length);
          }

          return {
            id: course.id,
            code: course.course_code,
            name: course.course_name,
            semester: course.semester,
            students: count || 0,
            schedule: 'Mon, Wed, Fri 10:00 AM', // Would come from timetable
            room: 'Room 401', // Would come from timetable
            credits: course.credits || 4,
            attendance,
            avgMarks,
            pendingTasks: 0, // Would be calculated
            department: course.department
          };
        })
      );

      setCourses(coursesWithStats);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = selectedSemester === 'all' || course.semester.toString() === selectedSemester;
    return matchesSearch && matchesSemester;
  });

  const getSemesterColor = (sem) => {
    if (sem % 2 === 0) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {semester} {academicYear} • {user?.department}
          </p>
        </div>
        <button className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          <Download className="h-4 w-4 mr-2" />
          Export List
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-3 mb-3">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{course.name}</h2>
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                    {course.code}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSemesterColor(course.semester)}`}>
                    Semester {course.semester}
                  </span>
                  <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                    {course.credits} Credits
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">{course.schedule}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">{course.students} Students</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">{course.room}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Avg: {course.avgMarks}% | Att: {course.attendance}%</span>
                  </div>
                </div>

                {course.pendingTasks > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg inline-flex items-center">
                    <span className="text-sm text-yellow-800 dark:text-yellow-300">
                      ⚠️ {course.pendingTasks} pending task{course.pendingTasks > 1 ? 's' : ''} (attendance/results)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4 lg:mt-0 lg:ml-6">
                <button
                  onClick={() => navigate(`/faculty/attendance?course=${course.code}`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Attendance
                </button>
                <button
                  onClick={() => navigate(`/faculty/results?course=${course.code}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Results
                </button>
                <button
                  onClick={() => navigate(`/faculty/students?course=${course.code}`)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Students
                </button>
                <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacultyCourses;