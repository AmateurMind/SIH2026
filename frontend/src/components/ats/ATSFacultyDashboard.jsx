import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Users,
  Award,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

const ATSFacultyDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    department: '',
    sortBy: 'atsScore',
    order: 'desc',
    search: ''
  });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, [pagination.page, filters.department, filters.sortBy, filters.order]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.department && { department: filters.department }),
        sortBy: filters.sortBy,
        order: filters.order
      });

      const res = await axios.get(`/ats/students/list?${params}`);
      
      if (res.data.success) {
        setStudents(res.data.students);
        setPagination(prev => ({ ...prev, ...res.data.pagination }));
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/ats/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // For now, we'll filter client-side since the search is not implemented in backend
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'text-gray-400';
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score) => {
    if (score === null || score === undefined) return 'bg-gray-100';
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    if (score >= 40) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const getScoreLabel = (score) => {
    if (score === null || score === undefined) return 'N/A';
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    if (score >= 40) return 'Below Avg';
    return 'Poor';
  };

  // Filter students based on search
  const filteredStudents = students.filter(student => 
    !searchInput || 
    student.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchInput.toLowerCase()) ||
    student.id?.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Analyzed</p>
                <p className="text-xl font-bold text-gray-900">{stats.studentsWithResume}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-xl font-bold text-gray-900">{stats.averageScore}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Excellent (90+)</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.scoreDistribution?.find(d => d.range === '90')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email, or ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </form>

          {/* Department Filter */}
          <select
            value={filters.department}
            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          >
            <option value="">All Departments</option>
            <option value="CSE">Computer Science</option>
            <option value="ECE">Electronics</option>
            <option value="ME">Mechanical</option>
            <option value="EE">Electrical</option>
            <option value="CE">Civil</option>
          </select>

          {/* Sort */}
          <select
            value={`${filters.sortBy}-${filters.order}`}
            onChange={(e) => {
              const [sortBy, order] = e.target.value.split('-');
              setFilters(prev => ({ ...prev, sortBy, order }));
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          >
            <option value="atsScore-desc">Score (High to Low)</option>
            <option value="atsScore-asc">Score (Low to High)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>

          {/* Refresh */}
          <button
            onClick={() => {
              fetchStudents();
              fetchStats();
            }}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-500">Loading students...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semester
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ATS Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Analyzed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {student.department || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {student.semester || '-'}
                        </td>
                        <td className="px-4 py-3">
                          {student.atsScore !== null && student.atsScore !== undefined ? (
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBgColor(student.atsScore)} ${getScoreColor(student.atsScore)}`}>
                                {student.atsScore}
                              </span>
                              <span className={`text-xs ${getScoreColor(student.atsScore)}`}>
                                {getScoreLabel(student.atsScore)}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                              Not Analyzed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {student.atsAnalyzedAt 
                            ? new Date(student.atsAnalyzedAt).toLocaleDateString()
                            : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-8 h-8 text-gray-300" />
                          <p>No students found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Score Distribution */}
      {stats?.scoreDistribution && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
          <div className="flex items-end gap-2 h-32">
            {stats.scoreDistribution.map((item, index) => {
              const maxCount = Math.max(...stats.scoreDistribution.map(d => d.count), 1);
              const height = (item.count / maxCount) * 100;
              
              const rangeLabels = {
                0: '0-25',
                25: '25-50',
                50: '50-75',
                75: '75-90',
                90: '90+'
              };

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={`w-full rounded-t ${
                      index === 0 ? 'bg-red-400' :
                      index === 1 ? 'bg-orange-400' :
                      index === 2 ? 'bg-yellow-400' :
                      index === 3 ? 'bg-green-400' :
                      'bg-green-500'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${item.count} students`}
                  ></div>
                  <span className="text-xs text-gray-500">{rangeLabels[item.range]}</span>
                  <span className="text-xs font-medium text-gray-700">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSFacultyDashboard;
