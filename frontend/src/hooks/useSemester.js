import { useState, useEffect } from 'react';

export function useSemester() {
  const [semester, setSemester] = useState('Winter');
  const [academicYear, setAcademicYear] = useState('2024');

  const getCurrentSemester = () => {
    const date = new Date();
    const month = date.getMonth();
    if (month >= 8 && month <= 11) {
      setSemester('Winter');
      setAcademicYear(date.getFullYear().toString());
    } else if (month >= 0 && month <= 3) {
      setSemester('Summer');
      setAcademicYear(date.getFullYear().toString());
    } else {
      setSemester('Summer');
      setAcademicYear(date.getFullYear().toString());
    }
  };

  useEffect(() => {
    getCurrentSemester();
  }, []);

  return { semester, academicYear, setSemester, setAcademicYear };
}