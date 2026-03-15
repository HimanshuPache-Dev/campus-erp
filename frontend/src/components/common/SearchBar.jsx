import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, BookOpen, GraduationCap } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ placeholder = 'Search...', className = '', darkMode }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockResults = [
          { 
            id: 1, 
            type: 'student', 
            name: 'John Doe', 
            detail: 'Computer Science, Semester 3',
            email: 'john.doe@campus.edu',
            enrollment: 'CS2024001'
          },
          { 
            id: 2, 
            type: 'student', 
            name: 'Jane Smith', 
            detail: 'Information Technology, Semester 5',
            email: 'jane.smith@campus.edu',
            enrollment: 'IT2023002'
          },
          { 
            id: 3, 
            type: 'faculty', 
            name: 'Dr. Robert Johnson', 
            detail: 'Professor, Computer Science',
            email: 'r.johnson@campus.edu',
            employeeId: 'FAC2021001'
          },
          { 
            id: 4, 
            type: 'faculty', 
            name: 'Prof. Sarah Williams', 
            detail: 'Associate Professor, Mathematics',
            email: 's.williams@campus.edu',
            employeeId: 'FAC2020015'
          },
          { 
            id: 5, 
            type: 'course', 
            name: 'Data Structures and Algorithms', 
            detail: 'CS301 • 4 Credits',
            code: 'CS301'
          },
          { 
            id: 6, 
            type: 'course', 
            name: 'Database Management Systems', 
            detail: 'CS302 • 3 Credits',
            code: 'CS302'
          },
        ].filter(item => 
          item.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          item.detail.toLowerCase().includes(debouncedQuery.toLowerCase())
        );

        setResults(mockResults);
        setIsOpen(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleResultClick = (result) => {
    setIsOpen(false);
    setQuery('');
    if (result.type === 'student') {
      navigate(`/admin/students/${result.id}`);
    } else if (result.type === 'faculty') {
      navigate(`/admin/faculty/${result.id}`);
    } else if (result.type === 'course') {
      navigate(`/admin/courses/${result.id}`);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'student': return <Users className="h-4 w-4" />;
      case 'faculty': return <GraduationCap className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'student': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'faculty': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'course': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
          darkMode ? 'text-gray-500' : 'text-gray-400'
        }`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 border'
          }`}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
              darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (results.length > 0 || loading) && (
        <div className={`absolute z-50 mt-2 w-full rounded-lg shadow-lg border max-h-96 overflow-y-auto animate-fadeIn ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Searching...</p>
            </div>
          ) : (
            <>
              {results.length > 0 ? (
                <div className="py-2">
                  {results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className={`w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start space-x-3 border-b last:border-0 transition-colors duration-150 ${
                        darkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${getTypeColor(result.type)} flex items-center justify-center`}>
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{result.name}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(result.type)}`}>
                            {result.type}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{result.detail}</p>
                        {result.email && (
                          <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{result.email}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No results found for "{debouncedQuery}"</p>
                  <p className="text-xs mt-1">Try searching with different keywords</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;