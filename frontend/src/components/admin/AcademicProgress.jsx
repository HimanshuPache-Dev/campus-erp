import React, { useState, useEffect } from 'react';
import { useSemester } from '../../context/SemesterContext';
import { studentsAPI } from '../../services/api';
import { Calendar, Loader, AlertCircle } from 'lucide-react';

const AcademicProgress = () => {
  const { 
    semester, 
    academicYear, 
    getAcademicYearRange,
    getActiveStudentSemesters,
    isWinter,
    isSummer 
  } = useSemester();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeSemesters = getActiveStudentSemesters();
  const yearRange = getAcademicYearRange();

  // Fetch real student data from database
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        console.log('📚 Fetching students for AcademicProgress...');
        
        const response = await studentsAPI.getAll();
        console.log('✅ API Response:', response);
        console.log('✅ Students data:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          setStudents(response.data);
          console.log(`✅ Loaded ${response.data.length} students`);
        } else {
          console.log('⚠️ No students data or invalid format');
          setStudents([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching students:', err);
        console.error('❌ Error details:', err.response?.data || err.message);
        setError('Failed to load student data');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [semester, academicYear]);

  // Debug: Log students and their semesters
  useEffect(() => {
    if (students.length > 0) {
      console.log('📊 Students with semesters:', students.map(s => ({
        name: `${s.first_name} ${s.last_name}`,
        semester: s.student_details?.current_semester || s.currentSemester,
        details: s.student_details
      })));
    }
  }, [students]);

  // Calculate real student counts by year based on their current semester
  const studentsByYear = {
    year1: students.filter(s => {
      const sem = s.student_details?.current_semester || s.currentSemester || 0;
      return sem === 1 || sem === 2;
    }).length,
    year2: students.filter(s => {
      const sem = s.student_details?.current_semester || s.currentSemester || 0;
      return sem === 3 || sem === 4;
    }).length,
    year3: students.filter(s => {
      const sem = s.student_details?.current_semester || s.currentSemester || 0;
      return sem === 5 || sem === 6;
    }).length,
  };

  // Calculate semester-wise active counts
  const semesterStatus = [1, 2, 3, 4, 5, 6].map(sem => {
    const count = students.filter(s => {
      const studentSem = s.student_details?.current_semester || s.currentSemester || 0;
      return studentSem === sem;
    }).length;
    
    return {
      semester: sem,
      year: Math.ceil(sem / 2),
      isActive: activeSemesters.includes(sem),
      count: count
    };
  });

  console.log('📊 Calculated stats:', {
    studentsByYear,
    semesterStatus,
    totalStudents: students.length
  });

  // Get semester display text
  const getSemesterDisplay = (sem) => {
    if (semester === 'Winter' && [1,3,5].includes(sem)) return 'Active';
    if (semester === 'Summer' && [2,4,6].includes(sem)) return 'Active';
    return 'Inactive';
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-xl ${
        isWinter 
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
          : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
      }`}>
        <div className="flex items-center justify-center py-8">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading academic data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-xl ${
        isWinter 
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
          : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
      }`}>
        <div className="flex items-center justify-center py-4 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl ${
      isWinter 
        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
        : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center ${
        isWinter ? 'text-blue-800 dark:text-blue-300' : 'text-green-800 dark:text-green-300'
      }`}>
        <Calendar className="h-5 w-5 mr-2" />
        Academic Year Progress - {yearRange}
      </h3>
      
      {/* Year-wise Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Year 1 Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Year 1</h4>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              studentsByYear.year1 > 0
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {studentsByYear.year1} Students
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {/* Semester 1 */}
            <div className={`p-2 rounded-lg text-center ${
              semesterStatus.find(s => s.semester === 1)?.isActive
                ? isWinter
                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                  : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                : 'bg-gray-100 dark:bg-gray-700 opacity-50'
            }`}>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sem 1</p>
              <p className={`text-lg font-bold ${
                semesterStatus.find(s => s.semester === 1)?.isActive
                  ? isWinter ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {semesterStatus.find(s => s.semester === 1)?.count || 0}
              </p>
              <p className="text-xs text-gray-500">
                {getSemesterDisplay(1)}
              </p>
            </div>
            
            {/* Semester 2 */}
            <div className={`p-2 rounded-lg text-center ${
              semesterStatus.find(s => s.semester === 2)?.isActive
                ? isSummer
                  ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                  : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                : 'bg-gray-100 dark:bg-gray-700 opacity-50'
            }`}>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sem 2</p>
              <p className={`text-lg font-bold ${
                semesterStatus.find(s => s.semester === 2)?.isActive
                  ? isSummer ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {semesterStatus.find(s => s.semester === 2)?.count || 0}
              </p>
              <p className="text-xs text-gray-500">
                {getSemesterDisplay(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Year 2 Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Year 2</h4>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              studentsByYear.year2 > 0
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {studentsByYear.year2} Students
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {/* Semester 3 */}
            <div className={`p-2 rounded-lg text-center ${
              semesterStatus.find(s => s.semester === 3)?.isActive
                ? isWinter
                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                  : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                : 'bg-gray-100 dark:bg-gray-700 opacity-50'
            }`}>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sem 3</p>
              <p className={`text-lg font-bold ${
                semesterStatus.find(s => s.semester === 3)?.isActive
                  ? isWinter ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {semesterStatus.find(s => s.semester === 3)?.count || 0}
              </p>
              <p className="text-xs text-gray-500">
                {getSemesterDisplay(3)}
              </p>
            </div>
            
            {/* Semester 4 */}
            <div className={`p-2 rounded-lg text-center ${
              semesterStatus.find(s => s.semester === 4)?.isActive
                ? isSummer
                  ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                  : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                : 'bg-gray-100 dark:bg-gray-700 opacity-50'
            }`}>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sem 4</p>
              <p className={`text-lg font-bold ${
                semesterStatus.find(s => s.semester === 4)?.isActive
                  ? isSummer ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {semesterStatus.find(s => s.semester === 4)?.count || 0}
              </p>
              <p className="text-xs text-gray-500">
                {getSemesterDisplay(4)}
              </p>
            </div>
          </div>
        </div>

        {/* Year 3 Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Year 3</h4>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              studentsByYear.year3 > 0
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {studentsByYear.year3} Students
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {/* Semester 5 */}
            <div className={`p-2 rounded-lg text-center ${
              semesterStatus.find(s => s.semester === 5)?.isActive
                ? isWinter
                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                  : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                : 'bg-gray-100 dark:bg-gray-700 opacity-50'
            }`}>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sem 5</p>
              <p className={`text-lg font-bold ${
                semesterStatus.find(s => s.semester === 5)?.isActive
                  ? isWinter ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {semesterStatus.find(s => s.semester === 5)?.count || 0}
              </p>
              <p className="text-xs text-gray-500">
                {getSemesterDisplay(5)}
              </p>
            </div>
            
            {/* Semester 6 */}
            <div className={`p-2 rounded-lg text-center ${
              semesterStatus.find(s => s.semester === 6)?.isActive
                ? isSummer
                  ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                  : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                : 'bg-gray-100 dark:bg-gray-700 opacity-50'
            }`}>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sem 6</p>
              <p className={`text-lg font-bold ${
                semesterStatus.find(s => s.semester === 6)?.isActive
                  ? isSummer ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {semesterStatus.find(s => s.semester === 6)?.count || 0}
              </p>
              <p className="text-xs text-gray-500">
                {getSemesterDisplay(6)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Current Session</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{semester} {academicYear}</p>
          <p className="text-xs text-gray-500">{yearRange}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Active Semesters</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{activeSemesters.join(', ')}</p>
          <p className="text-xs text-gray-500">Sem {activeSemesters[0]} - Sem {activeSemesters[2]}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm col-span-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">Students by Year</p>
          <div className="flex justify-between mt-1">
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{studentsByYear.year1}</p>
              <p className="text-xs text-gray-500">Year 1</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{studentsByYear.year2}</p>
              <p className="text-xs text-gray-500">Year 2</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{studentsByYear.year3}</p>
              <p className="text-xs text-gray-500">Year 3</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center border-t border-gray-200 dark:border-gray-700 pt-3">
        * Students automatically progress to next semester when academic year changes
      </p>
    </div>
  );
};

export default AcademicProgress;