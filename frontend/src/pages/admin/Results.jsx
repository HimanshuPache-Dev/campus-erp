import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, Eye, Edit, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const Results = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [results, setResults] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [selectedSemester]);

  const fetchSemesters = async () => {
    const { data, error } = await supabase
      .from('results')
      .select('semester')
      .not('semester', 'is', null);
    if (error) { setError(error.message); return; }
    const unique = [...new Set(data.map(r => r.semester))].sort().reverse();
    setSemesters(unique);
    if (unique.length > 0) setSelectedSemester(unique[0]);
  };

  const fetchResults = async () => {
    if (!selectedSemester) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('results')
      .select(`
        id, marks_obtained, total_marks, grade, percentage, status, semester,
        users!results_student_id_fkey(first_name, last_name, enrollment_number),
        courses(course_code)
      `)
      .eq('semester', selectedSemester)
      .order('created_at', { ascending: false });
    if (error) { setError(error.message); setLoading(false); return; }
    setResults(data || []);
    setLoading(false);
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'text-gray-600 dark:text-gray-400';
    if (grade.startsWith('A')) return 'text-green-600 dark:text-green-400';
    if (grade.startsWith('B')) return 'text-blue-600 dark:text-blue-400';
    if (grade.startsWith('C')) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const filteredResults = results.filter(r => {
    const name = `${r.users?.first_name || ''} ${r.users?.last_name || ''}`.toLowerCase();
    const enrollment = (r.users?.enrollment_number || '').toLowerCase();
    const course = (r.courses?.course_code || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || enrollment.includes(term) || course.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Results</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage and publish student results</p>
        </div>
        <button
          onClick={() => navigate('/admin/results/add')}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Result
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {semesters.length === 0 && <option value="">No semesters</option>}
              {semesters.map(sem => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Results List</h3>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading results...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : filteredResults.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">No results found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {result.users?.first_name} {result.users?.last_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{result.users?.enrollment_number}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{result.courses?.course_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{result.marks_obtained}/{result.total_marks}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${getGradeColor(result.grade)}`}>{result.grade}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {result.percentage != null ? `${result.percentage}%` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        result.status === 'published'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                      }`}>
                        {result.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => navigate(`/admin/results/${result.id}`)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="View">
                          <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </button>
                        <button onClick={() => navigate(`/admin/results/${result.id}/edit`)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="Edit">
                          <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" title="More">
                          <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredResults.length} of {results.length} results
          </p>
        </div>
      </div>
    </div>
  );
};

export default Results;
