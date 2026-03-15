import { useState, useEffect } from 'react';
import { useSemester } from '../context/SemesterContext';
import { supabase } from '../services/supabase';

export const useSemesterData = () => {
  const { semester, academicYear, students, faculty, courses } = useSemester();
  const [data, setData] = useState({ students: [], faculty: [], courses: [], attendance: [], results: [], fees: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const studentIds = students.map(s => s.id);

        const [attendanceRes, resultsRes, feesRes] = await Promise.all([
          studentIds.length
            ? supabase.from('attendance').select('*, users!attendance_student_id_fkey(first_name, last_name), courses(course_name, course_code)').in('student_id', studentIds).eq('date', today)
            : Promise.resolve({ data: [] }),
          studentIds.length
            ? supabase.from('results').select('*, users!results_student_id_fkey(first_name, last_name), courses(course_name, course_code)').in('student_id', studentIds).eq('semester_type', semester).eq('academic_year', academicYear)
            : Promise.resolve({ data: [] }),
          studentIds.length
            ? supabase.from('fees').select('*').in('student_id', studentIds).eq('semester_type', semester).eq('academic_year', academicYear)
            : Promise.resolve({ data: [] }),
        ]);

        setData({
          students,
          faculty,
          courses,
          attendance: attendanceRes.data || [],
          results: resultsRes.data || [],
          fees: feesRes.data || [],
        });
      } catch (err) {
        console.error('useSemesterData error:', err);
        setData({ students, faculty, courses, attendance: [], results: [], fees: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleRefresh = () => fetchData();
    window.addEventListener('dataRefresh', handleRefresh);
    return () => window.removeEventListener('dataRefresh', handleRefresh);
  }, [semester, academicYear, students, faculty, courses]);

  return { data, loading };
};
