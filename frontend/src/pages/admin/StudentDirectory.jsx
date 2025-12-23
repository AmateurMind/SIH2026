import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Grid, List, Loader2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StudentCard from '../../components/students/StudentCard';
import StudentFilters from '../../components/students/StudentFilters';
import ippService from '../../services/ippService';

const StudentDirectory = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        department: '',
        year: '',
        skills: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    });

    // Detect current role from URL path
    const getCurrentRole = () => {
        if (location.pathname.startsWith('/admin')) return 'admin';
        if (location.pathname.startsWith('/mentor')) return 'mentor';
        if (location.pathname.startsWith('/recruiter')) return 'recruiter';
        return user?.role || 'admin'; // Fallback to user role or admin
    };

    const currentRole = getCurrentRole();

    // Static data for filters (in production, fetch from API)
    const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    const availableSkills = [
        'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
        'MongoDB', 'SQL', 'AWS', 'Docker', 'Git', 'Machine Learning'
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

            const response = await axios.get('/students/directory', { params });

            if (response.data.success) {
                const studentsData = response.data.students;

                // Fetch IPP counts for each student
                const studentsWithIPPs = await Promise.all(
                    studentsData.map(async (student) => {
                        try {
                            const ippResponse = await ippService.getStudentIPPs(student.id || student._id);
                            return {
                                ...student,
                                ippCount: ippResponse.count || ippResponse.data?.length || 0
                            };
                        } catch (error) {
                            console.error(`Error fetching IPPs for student ${student.id}:`, error);
                            return {
                                ...student,
                                ippCount: 0
                            };
                        }
                    })
                );

                setStudents(studentsWithIPPs);
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
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
    };

    const handleClearFilters = () => {
        setFilters({ department: '', year: '', skills: '' });
        setSearchQuery('');
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleViewProfile = (student) => {
        const studentId = student.id || student._id;
        navigate(`/${currentRole}/students/${studentId}`);
    };

    const handleViewResumes = (student) => {
        const studentId = student.id || student._id;
        navigate(`/${currentRole}/students/${studentId}/resumes`);
    };

    const handleViewIPPs = (student) => {
        const studentId = student.id || student._id;
        navigate(`/${currentRole}/students/${studentId}/ipps`);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading && students.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6 pb-24 md:pb-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3">
                        <div>
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                                <Users className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
                                Student Directory
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                Browse and manage all registered students
                            </p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${viewMode === 'grid'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                                title="Grid View"
                            >
                                <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${viewMode === 'list'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                                title="List View"
                            >
                                <List className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Filters Sidebar - Collapsible on mobile */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <details className="lg:hidden bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
                            <summary className="p-3 font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Filters
                            </summary>
                            <div className="p-3 pt-0">
                                <StudentFilters
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    onClearFilters={handleClearFilters}
                                    departments={departments}
                                    years={years}
                                    availableSkills={availableSkills}
                                />
                            </div>
                        </details>
                        <div className="hidden lg:block">
                            <StudentFilters
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClearFilters={handleClearFilters}
                                departments={departments}
                                years={years}
                                availableSkills={availableSkills}
                            />
                        </div>
                    </div>

                    {/* Students Grid/List */}
                    <div className="lg:col-span-3 order-1 lg:order-2">
                        {/* Results Count */}
                        <div className="mb-3 sm:mb-4 flex items-center justify-between">
                            <p className="text-xs sm:text-sm text-gray-600">
                                Showing <span className="font-semibold">{students.length}</span> of{' '}
                                <span className="font-semibold">{pagination.total}</span> students
                            </p>
                            {loading && (
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-600" />
                            )}
                        </div>

                        {/* Students Display */}
                        {students.length === 0 ? (
                            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 sm:p-12 text-center">
                                <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No students found</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Try adjusting your search or filters
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={
                                    viewMode === 'grid'
                                        ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4'
                                        : 'space-y-3'
                                }>
                                    {students.map((student) => (
                                        <StudentCard
                                            key={student._id}
                                            student={student}
                                            viewMode={viewMode}
                                            onViewProfile={handleViewProfile}
                                            onViewResumes={handleViewResumes}
                                            onViewIPPs={handleViewIPPs}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="mt-4 sm:mt-6 flex items-center justify-center gap-1 sm:gap-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="p-1.5 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>

                                        {[...Array(pagination.pages)].map((_, idx) => {
                                            const pageNum = idx + 1;
                                            // Show first page, last page, current page, and pages around current
                                            if (
                                                pageNum === 1 ||
                                                pageNum === pagination.pages ||
                                                (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors ${pagination.page === pageNum
                                                            ? 'bg-blue-600 text-white'
                                                            : 'border border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            } else if (
                                                pageNum === pagination.page - 2 ||
                                                pageNum === pagination.page + 2
                                            ) {
                                                return <span key={pageNum} className="px-1 sm:px-2 text-sm">...</span>;
                                            }
                                            return null;
                                        })}

                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.pages}
                                            className="p-1.5 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDirectory;
