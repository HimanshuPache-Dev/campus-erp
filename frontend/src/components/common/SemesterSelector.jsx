import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useSemester } from '../../context/SemesterContext';

const SemesterSelector = ({ darkMode }) => {
  const { semester, setSemester, academicYear, setAcademicYear, availableSemesters } = useSemester();
  
  const currentYear = new Date().getFullYear();
  const years = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2
  ];
  
  const semesters = [
    { value: 'Winter', label: 'Winter Semester', months: 'Odd Semesters (1,3,5)' },
    { value: 'Summer', label: 'Summer Semester', months: 'Even Semesters (2,4,6)' }
  ];

  const handleSemesterChange = (newSemester) => {
    setSemester(newSemester);
    // Trigger data refresh
    window.dispatchEvent(new CustomEvent('semesterChange', { 
      detail: { semester: newSemester, academicYear } 
    }));
  };

  const handleYearChange = (newYear) => {
    setAcademicYear(newYear);
    // Trigger data refresh
    window.dispatchEvent(new CustomEvent('semesterChange', { 
      detail: { semester, academicYear: newYear } 
    }));
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <select
          value={semester}
          onChange={(e) => handleSemesterChange(e.target.value)}
          className={`appearance-none pl-9 pr-8 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700 text-white hover:border-gray-600' 
              : 'bg-white border-gray-300 text-gray-700 hover:border-primary-500 border'
          }`}
        >
          {semesters.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label} - {s.months}
            </option>
          ))}
        </select>
        <Calendar className={`absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none ${
          darkMode ? 'text-gray-500' : 'text-gray-400'
        }`} />
        <ChevronDown className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none ${
          darkMode ? 'text-gray-500' : 'text-gray-400'
        }`} />
      </div>
      
      <select
        value={academicYear}
        onChange={(e) => handleYearChange(e.target.value)}
        className={`appearance-none px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700 text-white hover:border-gray-600' 
            : 'bg-white border-gray-300 text-gray-700 hover:border-primary-500 border'
        }`}
      >
        {years.map((year) => {
          const yearRange = semester === 'Winter' 
            ? `${year}-${year + 1}` 
            : `${year - 1}-${year}`;
          return (
            <option key={year} value={year}>
              {yearRange}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SemesterSelector;