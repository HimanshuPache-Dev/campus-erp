import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSemester } from '../../context/SemesterContext';
import { BookOpen, Plus, Search, Filter, Edit, Trash2, Eye, Calendar, Clock, Users, GraduationCap, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../services/supabase';

const Courses = () => {
  const navigate = useNavigate();
  const { semester, academicYear } = useSemester();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({ totalCourses: 0, activeFaculty: 0, totalStudents: 0, examsScheduled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchStats();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id, course_code, course_name, department, semester, credits, status,
        exam_date, exam_time, exam_duration
      `)
      .order('course_code');
    if (error) { setError(error.message); setLoading(false); return; }
    setCourses(data || []);
    setLoading(false);
  };

  const fetchDepartments = async () => {
    const { data } = await supabase.from('courses').select('department').not('department', 'is', null);
    if (data) setDepartments([...new Set(data.map(d => d.department))].sort());
  };

  const fetchStats = async () => {
    const [coursesRes, facultyRes, studentsRes, examsRes] = await Promise.all([
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'faculty'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('courses').select('id', { count: 'exact', head: true }).not('exam_date', 'is', null),
    ]);
    setStats({
      totalCourses: coursesRes.count || 0,
      activeFaculty: facultyRes.count || 0,
      totalStudents: studentsRes.count || 0,
      examsScheduled: examsRes.count || 0,
    });
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) { toast.error('Failed to delete course'); return; }
    toast.success('Course deleted successfully');
    fetchCourses();
    fetchStats();
  };

  const getFacultyName = (course) => {
    return 'Not Assigned';
  };

  const getStudentCount = (course) => course.student_enrollments?.[0]?.count ?? 0;

  const filteredCourses = courses.filter(course => {
    const faculty = getFacultyName(course).toLowerCase();
    const matchesSearch = course.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) || faculty.includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || course.department === selectedDepartment;
    const matchesSemester = selectedSemester === 'all' || course.semester === parseInt(selectedSemester);
    return matchesSearch && matchesDepartment && matchesSemester;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage courses, faculty assignments, and exams for {semester} {academicYear}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/admin/courses/create')} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />Create Course
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />Export
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search courses by name, code, or faculty..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
              <option value="all">All Departments</option>
              {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
              <option value="all">All Semesters</option>
              {[1,2,3,4,5,6].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'blue' },
          { label: 'Active Faculty', value: stats.activeFaculty, icon: GraduationCap, color: 'green' },
          { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'purple' },
          { label: 'Exams Scheduled', value: stats.examsScheduled, icon: Calendar, color: 'yellow' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{value}</p>
              </div>
              <div className={`p-3 bg-${color}-50 dark:bg-${color}-900/30 rounded-xl`}>
                <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">No courses found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Semester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Faculty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exam Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCourses.map((course) => {
                    const facultyName = getFacultyName(course);
                    const initials = facultyName !== 'Unassigned' ? facultyName.split(' ').map(n => n[0]).join('').slice(0, 2) : '?';
                    return (
                      <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{course.course_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{course.course_code}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{course.department}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">
                            Sem {course.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs font-medium text-green-700 dark:text-green-300">{initials}</span>
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white">{facultyName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{course.credits}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{getStudentCount(course)}</td>
                        <td className="px-6 py-4">
                          {course.exam_date ? (
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">{course.exam_date}</p>
                              <p className="text-xs text-gray-500">{course.exam_time}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Not scheduled</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => navigate(`/admin/courses/${course.id}`)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="View">
                              <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                            <button onClick={() => navigate(`/admin/courses/${course.id}/edit`)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="Edit">
                              <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                            <button onClick={() => navigate(`/admin/courses/${course.id}/schedule-exam`)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="Schedule Exam">
                              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                            <button onClick={() => handleDeleteCourse(course.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="Delete">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Showing {filteredCourses.length} of {courses.length} courses</p>
            </div>
          </>
        )}
      </div>

      {!loading && courses.filter(c => c.exam_date).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Exams</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Scheduled exams for {semester} {academicYear}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.filter(c => c.exam_date).map(course => (
              <div key={course.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{course.course_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{course.course_code} • Sem {course.semester}</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">
                    {course.credits} Credits
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">{course.exam_date}</span>
                  </div>
                  {course.exam_time && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">{course.exam_time} • {course.exam_duration}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">{getFacultyName(course)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
