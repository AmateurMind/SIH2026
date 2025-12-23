import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Grid, List, Loader2, Users, ChevronLeft, ChevronRight, X, Filter } from 'lucide-react';
import StudentCard from '../../components/students/StudentCard';

const StudentDirectory = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        department: '',
        semester: '',
        skills: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    });

    // Static data for filters
    const departments = [
        'Computer Science', 'Information Technology', 'Electronics',
        'Electrical', 'Mechanical', 'Civil'
    ];
    const semesters = [
        { value: '1', label: 'Semester 1' },
        { value: '2', label: 'Semester 2' },
        { value: '3', label: 'Semester 3' },
        { value: '4', label: 'Semester 4' },
        { value: '5', label: 'Semester 5' },
        { value: '6', label: 'Semester 6' },
        { value: '7', label: 'Semester 7' },
        { value: '8', label: 'Semester 8' }
    ];

    useEffect(() => {
        fetchStudents();
    }, [pagination.page, searchQuery, filters]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery,
                ...filters
            };

            const response = await axios.get('/students/directory', {
                params,
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                setStudents(response.data.students);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total,
                    pages: response.data.pagination.pages
                }));
            }
        } catch (error) {
            console.error('Fetch students error:', error);
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleClearFilters = () => {
        setFilters({ department: '', semester: '', skills: '' });
        setSearchQuery('');
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleViewProfile = (student) => {
        navigate(`/admin/students/${student.id}`);
    };

    const handleViewResumes = (student) => {
        navigate(`/admin/students/${student.id}/resumes`);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading && students.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-slate-500 font-medium">Loading students...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-blue-500 selection:text-white pb-20">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[120px] pointer-events-none" />
            <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-blue-100 rounded-full shadow-sm mb-3">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">Directory</span>
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Student Directory</h1>
                            <p className="text-slate-500 text-lg">Manage and track student progress across the platform.</p>
                        </div>
                        <div className="flex bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-full transition-all duration-300 ${viewMode === 'grid'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                title="Grid View"
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-full transition-all duration-300 ${viewMode === 'list'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                title="List View"
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar & Filters */}
                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or roll number..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent hover:border-slate-200 focus:border-blue-500 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-900 placeholder-slate-400 transition-all font-medium"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="relative">
                                    <select
                                        className="appearance-none pl-4 pr-10 py-3.5 bg-slate-50 border border-transparent hover:border-slate-200 rounded-2xl text-slate-600 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer transition-all min-w-[160px]"
                                        value={filters.department}
                                        onChange={(e) => handleFilterChange({ ...filters, department: e.target.value })}
                                    >
                                        <option value="">All Departments</option>
                                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <Filter className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>

                                <div className="relative">
                                    <select
                                        className="appearance-none pl-4 pr-10 py-3.5 bg-slate-50 border border-transparent hover:border-slate-200 rounded-2xl text-slate-600 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer transition-all min-w-[140px]"
                                        value={filters.semester}
                                        onChange={(e) => handleFilterChange({ ...filters, semester: e.target.value })}
                                    >
                                        <option value="">All Semesters</option>
                                        {semesters.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                    <Filter className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>

                                {(filters.department || filters.semester || searchQuery) && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-5 py-3.5 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-colors flex items-center gap-2"
                                    >
                                        <X size={18} /> Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Results Count & Loader */}
                    <div className="flex items-center justify-between px-2">
                        <p className="text-slate-500 font-medium">
                            Found <span className="text-slate-900 font-bold">{pagination.total}</span> students
                        </p>
                        {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                    </div>

                    {/* Students Display */}
                    {students.length === 0 ? (
                        <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 p-16 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                                <Users size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No students found</h3>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                We couldn't find any students matching your current filters. Try adjusting your search criteria.
                            </p>
                            <button
                                onClick={handleClearFilters}
                                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full hover:bg-slate-50 font-bold shadow-sm transition-all hover:shadow-md"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={
                                viewMode === 'grid'
                                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                                    : 'space-y-4'
                            }>
                                {students.map((student) => (
                                    <StudentCard
                                        key={student._id}
                                        student={student}
                                        viewMode={viewMode}
                                        onViewProfile={handleViewProfile}
                                        onViewResumes={handleViewResumes}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="p-3 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-bold text-slate-600">
                                        Page {pagination.page} of {pagination.pages}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className="p-3 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDirectory;
