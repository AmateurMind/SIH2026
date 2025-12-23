import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    BookOpen,
    FileText,
    User,
    TrendingUp,
    MapPin,
    Clock,
    DollarSign,
    Star,
    ArrowRight,
    Calendar,
    Building,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Mic,
    Code2
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import SkillGapWidget from '../../components/skillgap/SkillGapWidget';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        applications: [],
        recommendedInternships: [],
        recentActivity: [],
        stats: {}
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [applicationsRes, internshipsRes, analyticsRes] = await Promise.all([
                axios.get('/applications'),
                axios.get('/internships?recommended=true'),
                axios.get(`/analytics/student/${user.id}`)
            ]);

            setDashboardData({
                applications: applicationsRes.data.applications.slice(0, 5),
                recommendedInternships: internshipsRes.data.internships.slice(0, 4),
                stats: analyticsRes.data
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            applied: 'bg-white text-blue-700 border-blue-100',
            pending_mentor_approval: 'bg-white text-yellow-700 border-yellow-100',
            approved: 'bg-white text-green-700 border-green-100',
            rejected: 'bg-white text-red-700 border-red-100',
            interview_scheduled: 'bg-white text-purple-700 border-purple-100',
            offered: 'bg-white text-emerald-700 border-emerald-100'
        };
        return colors[status] || 'bg-gray-50 text-gray-700 border-gray-100';
    };

    const formatStatus = (status) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-[68px] pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <LoadingSpinner size="large" className="text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-[30px] pb-20 md:pb-12 px-2 sm:px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Header */}
                <div className="mb-6 sm:mb-8 lg:mb-10 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                        Welcome back, {user.name}!
                    </h1>
                    <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg">
                        {user.isPlaced ? (
                            `Congratulations on your placement! 🎉`
                        ) : (
                            `Here's what's happening with your internship journey`
                        )}
                    </p>
                </div>

                {/* Placement Success Banner - Only show if user is placed */}
                {user.isPlaced && user.placedAt && (
                    <div className="mb-6 sm:mb-8 lg:mb-10 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm">
                                    <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-500" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900 mb-2">
                                    🎉 Congratulations on your placement!
                                </h2>
                                <div className="text-green-800 space-y-2">
                                    <p className="font-semibold text-base sm:text-lg">
                                        {user.placedAt.position} at {user.placedAt.company}
                                    </p>
                                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 lg:gap-6 text-sm sm:text-base">
                                        <span className="flex items-center bg-white/60 px-3 py-1.5 rounded-lg">
                                            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                                            {user.placedAt.package}
                                        </span>
                                        <span className="flex items-center bg-white/60 px-3 py-1.5 rounded-lg">
                                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                                            Joining: {new Date(user.placedAt.joinDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
                    <div className="glass-panel-lite p-4 sm:p-5 lg:p-6 glass-hover group">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="p-2 sm:p-2.5 lg:p-3 bg-blue-50 rounded-lg sm:rounded-xl group-hover:bg-blue-100 transition-colors">
                                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-gray-400 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">Total</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                            {dashboardData.stats.totalApplications || 0}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">Total Applications</p>
                    </div>

                    <div className="glass-panel-lite p-4 sm:p-5 lg:p-6 glass-hover group">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="p-2 sm:p-2.5 lg:p-3 bg-green-50 rounded-lg sm:rounded-xl group-hover:bg-green-100 transition-colors">
                                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-gray-400 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">Avg</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                            {dashboardData.stats.averageRating ?? 'N/A'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">Performance Rating</p>
                    </div>

                    <div className="glass-panel-lite p-4 sm:p-5 lg:p-6 glass-hover group">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="p-2 sm:p-2.5 lg:p-3 bg-purple-50 rounded-lg sm:rounded-xl group-hover:bg-purple-100 transition-colors">
                                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-gray-400 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">Skills</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                            {dashboardData.stats.skills?.length ?? 0}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">Skills Acquired</p>
                    </div>

                    <div className="glass-panel-lite p-4 sm:p-5 lg:p-6 glass-hover group">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="p-2 sm:p-2.5 lg:p-3 bg-orange-50 rounded-lg sm:rounded-xl group-hover:bg-orange-100 transition-colors">
                                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-gray-400 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">Badges</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                            {dashboardData.stats.totalBadges ?? 0}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">Badges Earned</p>
                    </div>
                </div>



                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                    {/* Recent Applications */}
                    <div className="lg:col-span-2">
                        <div className="glass-panel-lite p-4 sm:p-6 lg:p-8 h-full">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-0">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Applications</h2>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Track your latest job applications</p>
                                </div>
                                <Link
                                    to="/student/applications"
                                    className="text-primary-600 hover:text-primary-700 active:text-primary-800 text-xs sm:text-sm font-semibold flex items-center justify-center sm:justify-start transition-colors bg-primary-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-100 active:bg-primary-200 touch-manipulation"
                                >
                                    View All
                                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
                                </Link>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                {dashboardData.applications.length === 0 ? (
                                    <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl sm:rounded-2xl border border-dashed border-gray-200 px-4">
                                        <div className="bg-white p-3 sm:p-4 rounded-full inline-flex mb-3 sm:mb-4 shadow-sm">
                                            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-medium text-gray-900">No applications yet</h3>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-4 sm:mb-6 max-w-sm mx-auto">Start your journey by browsing available internships and applying to the ones that match your skills.</p>
                                        <Link
                                            to="/student/internships"
                                            className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-lg sm:rounded-xl transition-all shadow-sm hover:shadow-md font-medium text-sm sm:text-base touch-manipulation"
                                        >
                                            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                            Browse Internships
                                        </Link>
                                    </div>
                                ) : (
                                    dashboardData.applications.map((application) => (
                                        <div key={application.id} className="group border border-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 bg-white shadow-sm hover:shadow-md">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                                                <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1">
                                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg sm:text-xl font-bold text-gray-500 flex-shrink-0">
                                                        {application.internship?.company?.charAt(0) || 'C'}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                                                            {application.internship?.title || 'Unknown Position'}
                                                        </h3>
                                                        <div className="flex flex-col sm:flex-row sm:items-center mt-1 gap-1 sm:gap-0 sm:space-x-3 text-xs sm:text-sm text-gray-500">
                                                            <span className="flex items-center">
                                                                <Building className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 text-gray-400" />
                                                                <span className="truncate">{application.internship?.company || 'Unknown Company'}</span>
                                                            </span>
                                                            <span className="hidden sm:inline w-1 h-1 bg-gray-300 rounded-full"></span>
                                                            <span className="flex items-center">
                                                                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 text-gray-400" />
                                                                {new Date(application.appliedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold border ${getStatusColor(application.status)} self-start sm:self-center whitespace-nowrap`}>
                                                    {formatStatus(application.status)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                        {/* Profile Completion - Kept inside sidebar */}

                        <div className="glass-panel-lite p-4 sm:p-6 lg:p-8">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900">Profile Status</h3>
                                <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full">100%</span>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between text-xs sm:text-sm group">
                                    <span className="text-gray-600 flex items-center">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 mr-1.5 sm:mr-2"></div>
                                        Basic Info
                                    </span>
                                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                </div>
                                <div className="w-full bg-gray-100 h-1 sm:h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full w-full rounded-full"></div>
                                </div>

                                <div className="flex items-center justify-between text-xs sm:text-sm group pt-1 sm:pt-2">
                                    <span className="text-gray-600 flex items-center">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 mr-1.5 sm:mr-2"></div>
                                        Skills
                                    </span>
                                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                </div>
                                <div className="w-full bg-gray-100 h-1 sm:h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full w-full rounded-full"></div>
                                </div>

                                <div className="flex items-center justify-between text-xs sm:text-sm group pt-1 sm:pt-2">
                                    <span className="text-gray-600 flex items-center">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 mr-1.5 sm:mr-2"></div>
                                        Resume
                                    </span>
                                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                </div>
                                <div className="w-full bg-gray-100 h-1 sm:h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full w-full rounded-full"></div>
                                </div>
                            </div>

                            <div className="mt-4 sm:mt-6 bg-green-50 border border-green-100 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-start">
                                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                                <p className="text-xs sm:text-sm text-green-800 font-medium">
                                    Great job! Your profile is fully optimized for recruiters.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Skill Assessment & Gap Analysis - New Widget Integration */}
                <div className="mb-6 sm:mb-8 lg:mb-10">
                    <SkillGapWidget />
                </div>

                {/* Recommended Internships */}
                <div className="mt-8 sm:mt-10 lg:mt-12">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-0">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recommended For You</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Opportunities matching your profile</p>
                        </div>
                        <Link
                            to="/student/internships"
                            className="text-primary-600 hover:text-primary-700 active:text-primary-800 text-xs sm:text-sm font-semibold flex items-center justify-center sm:justify-start transition-colors bg-primary-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-100 active:bg-primary-200 touch-manipulation"
                        >
                            View All
                            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                        {dashboardData.recommendedInternships.map((internship) => (
                            <div key={internship.id} className="glass-panel-lite p-4 sm:p-5 lg:p-6 glass-hover group h-full flex flex-col">
                                <div className="flex items-start justify-between mb-3 sm:mb-4">
                                    <img
                                        src={internship.companyLogo}
                                        alt={internship.company}
                                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-white border border-gray-100 p-1 object-contain shadow-sm"
                                    />
                                    {internship.recommendationScore && (
                                        <div className="flex items-center bg-green-50 text-green-700 border border-green-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
                                            <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 fill-green-700" />
                                            {internship.recommendationScore}%
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                                    {internship.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 font-medium line-clamp-1">{internship.company}</p>

                                <div className="space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 flex-1">
                                    <div className="flex items-center">
                                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-2.5 text-gray-400 flex-shrink-0" />
                                        <span className="line-clamp-1">{internship.location}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-2.5 text-gray-400 flex-shrink-0" />
                                        <span className="line-clamp-1">{internship.stipend}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 sm:mr-2.5 text-gray-400 flex-shrink-0" />
                                        <span className="line-clamp-1">{internship.duration}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-100">
                                    {internship.hasApplied ? (
                                        <span className="w-full btn-success text-xs sm:text-sm py-2 sm:py-2.5 flex items-center justify-center cursor-not-allowed opacity-70 rounded-lg sm:rounded-xl font-medium">
                                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                            Applied
                                        </span>
                                    ) : (
                                        <Link
                                            to={`/student/internships`}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center font-semibold shadow-sm hover:shadow-md group-hover:border-primary-200 group-hover:text-primary-600 touch-manipulation"
                                        >
                                            View Details
                                            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;