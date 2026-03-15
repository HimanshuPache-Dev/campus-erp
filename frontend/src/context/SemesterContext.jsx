import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabase';

const SemesterContext = createContext();

export const useSemester = () => {
  const context = useContext(SemesterContext);
  if (!context) throw new Error('useSemester must be used within a SemesterProvider');
  return context;
};

export const SemesterProvider = ({ children }) => {
  const [semester, setSemester] = useState('Winter');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auto-detect current semester from month
  useEffect(() => {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    setSemester(month >= 8 && month <= 11 ? 'Winter' : 'Summer');
    setAcademicYear(year.toString());
  }, []);

  // Generate available semester options
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const semesters = [];
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      semesters.push({ year, semester: 'Winter', label: `Winter ${year}` });
      semesters.push({ year, semester: 'Summer', label: `Summer ${year}` });
    }
    setAvailableSemesters(semesters);
  }, []);

  // Fetch real data from Supabase when semester/year changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentsRes, facultyRes, coursesRes] = await Promise.all([
          supabase
            .from('users')
            .select('*, student_details(*)')
            .eq('role', 'student')
            .eq('is_active', true)
            .limit(50),
          supabase
            .from('users')
            .select('*, faculty_details(*)')
            .eq('role', 'faculty')
            .eq('is_active', true)
            .limit(50),
          supabase
            .from('courses')
            .select('*')
            .eq('is_active', true)
            .limit(50),
        ]);

        setStudents(studentsRes.data || []);
        setFaculty(facultyRes.data || []);
        setCourses(coursesRes.data || []);
      } catch (err) {
        console.error('SemesterContext fetch error:', err);
        // Set empty arrays on error so app still works
        setStudents([]);
        setFaculty([]);
        setCourses([]);
      } finally {
        setLoading(false);
        window.dispatchEvent(new CustomEvent('dataRefresh', { detail: { semester, academicYear } }));
      }
    };

    fetchData();
  }, [semester, academicYear]);

  const getActiveStudentSemesters = () => semester === 'Winter' ? [1, 3, 5] : [2, 4, 6];

  const getAcademicYearRange = () => {
    const year = parseInt(academicYear);
    return semester === 'Winter' ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  const value = {
    semester, setSemester,
    academicYear, setAcademicYear,
    availableSemesters,
    students, faculty, courses,
    loading,
    getActiveStudentSemesters,
    getAcademicYearRange,
    isWinter: semester === 'Winter',
    isSummer: semester === 'Summer',
  };

  return <SemesterContext.Provider value={value}>{children}</SemesterContext.Provider>;
};
