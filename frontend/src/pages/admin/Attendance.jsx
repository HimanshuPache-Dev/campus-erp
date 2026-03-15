import { useState, useEffect } from 'react';
import { useSemester } from '../../context/SemesterContext';
import { Calendar, Filter, Download, Building2, CheckCircle, XCircle, AlertCircle, Eye, Loader } from 'lucide-react';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';

const Attendance = () => {
  const { semester, academicYear } = useSemester();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [expandedDept, setExpandedDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deptData, setDeptData] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        // Get all attendance for selected date
        const { data: attData, error } = await supabase
          .from('attendance')
          .select(`
            status,
            users!attendance_student_id_fkey(id, department),
            courses(id, course_name, course_code, department)
          `)
          .eq('date', selectedDate);

        if (error) throw error;

        // Group by department
        const deptMap = {};
        (attData || []).forEach(a => {
          const dept = a.users?.department || 'Unknown';
          if (!deptMap[dept]) deptMap[dept] = { name: dept, present: 0, absent: 0, late: 0, courses: {} };
          if (a.status === 'present') deptMap[dept].present++;
          else if (a.status === 'absent') deptMap[dept].absent++;
          else if (a.status === 'late') deptMap[dept].late++;

          // Group by course within dept
          const courseKey = a.courses?.course_code;
          if (courseKey) {
            if (!deptMap[dept].courses[courseKey]) {
              deptMap[dept].courses[courseKey] = { name: a.courses.course_name, code: courseKey, present: 0, absent: 0, late: 0, total: 0 };
            }
            deptMap[dept].courses[courseKey].total++;
            if (a.status === 'present') deptMap[dept].courses[courseKey].present++;
            else if (a.status === 'absent') deptMap[dept].courses[courseKey].absent++;
            else if (a.status === 'late') deptMap[dept].courses[courseKey].late++;
          }
        });

        const result = Object.entries(deptMap).map(([name, d], i) => ({
          id: i + 1,
          name,
          totalStudents: d.present + d.absent + d.late,
          present: d.present,
          absent: d.absent,
          late: d.late,
          percentage: d.present + d.absent + d.late > 0
            ? parseFloat(((d.present / (d.present + d.absent + d.late)) * 100).toFixed(1))
            : 0,
          courses: Object.values(d.courses),
        }));

        setDeptData(result);
        setDepartments(result.map(d => d.name));
      } catch (err) {
        console.error('Attendance fetch error:', err);
        toast.error('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedDate, semester, academicYear]);

  const filtered = selectedDepartment === 'all' ? deptData : deptData.filter(d => d.name === selectedDepartment);
  const totalStudents = filtered.reduce((s, d) => s + d.totalStudents, 0);
  const totalPresent = filtered.reduce((s, d) => s + d.present, 0);
  const totalAbsent = filtered.reduce((s, d) => s + d.absent, 0);
  const totalLate = filtered.reduce((s, d) => s + d.late, 0);
  const overallPct = totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(1) : 0;

  const pctColor = (p) => p >= 80 ? 'text-green-600' : p >= 70 ? 'text-yellow-600' : 'text-red-600';

  const handleExport = () => {
    const csv = ['Department,Total,Present,Absent,Late,Percentage',
      ...filtered.map(d => `${d.name},${d.totalStudents},${d.present},${d.absent},${d.late},${d.percentage}%`)
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
    toast.success('Exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Department-wise attendance for {semester} {academicYear}</p>
        </div>
        <button onClick={handleExport} className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Download className="h-4 w-4 mr-2" />Export
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: totalStudents, color: 'text-gray-900 dark:text-white' },
          { label: 'Present', value: totalPresent, color: 'text-green-600 dark:text-green-400' },
          { label: 'Absent', value: totalAbsent, color: 'text-red-600 dark:text-red-400' },
          { label: 'Late', value: totalLate, color: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Attendance %', value: `${overallPct}%`, color: 'text-primary-600 dark:text-primary-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white">
              <option value="all">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader className="h-8 w-8 animate-spin text-primary-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No attendance records for {selectedDate}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(dept => (
            <div key={dept.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                      <Building2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{dept.name}</h3>
                      <p className="text-sm text-gray-500">{dept.totalStudents} records</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
                      <p className={`text-2xl font-bold ${pctColor(dept.percentage)}`}>{dept.percentage}%</p>
                    </div>
                    <button onClick={() => setExpandedDept(expandedDept === dept.id ? null : dept.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Eye className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {[
                    { icon: CheckCircle, color: 'text-green-500', val: dept.present, label: 'Present' },
                    { icon: XCircle, color: 'text-red-500', val: dept.absent, label: 'Absent' },
                    { icon: AlertCircle, color: 'text-yellow-500', val: dept.late, label: 'Late' },
                  ].map(({ icon: Icon, color, val, label }) => (
                    <div key={label} className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className={`text-lg font-semibold ${color}`}>{val}</span>
                      </div>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              {expandedDept === dept.id && dept.courses.length > 0 && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Course Breakdown</h4>
                  <div className="space-y-3">
                    {dept.courses.map((c, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.code}</p>
                          </div>
                          <span className={`text-sm font-semibold ${pctColor(c.total > 0 ? (c.present / c.total) * 100 : 0)}`}>
                            {c.total > 0 ? ((c.present / c.total) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>Present: {c.present}</span>
                          <span>Absent: {c.absent}</span>
                          <span>Late: {c.late}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Attendance;
