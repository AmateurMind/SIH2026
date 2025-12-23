import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Briefcase, TrendingUp, Clock, ExternalLink, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const RecruiterDashboard = () => {
    const { user } = useAuth();
    const [pendingEvals, setPendingEvals] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Hardcoded stats for now - can be replaced with API calls later
    const stats = [
        { label: 'Active Job Postings', value: '4', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Applications', value: '128', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Shortlisted Candidates', value: '32', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Interview Scheduled', value: '12', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;

            try {
                // Determine company name (Fallback logic for demo user)
                let companyName = user.company;
                if (!companyName && user.email?.includes('techcorp')) {
                    companyName = 'TechCorp'; // Matches partial search in backend
                }

                // 1. Fetch Pending IPP Evaluations
                const ippResponse = await axios.get('/ipp', {
                    params: {
                        status: 'pending_mentor_eval',
                        company: companyName
                    }
                });

                if (ippResponse.data.success) {
                    setPendingEvals(ippResponse.data.data);
                }

                // 2. Fetch Recent Applications
                // Note: The backend returns all applications for recruiters, so we filter by company here
                const appsResponse = await axios.get('/applications');
                let allApps = appsResponse.data.applications || [];

                if (companyName) {
                    allApps = allApps.filter(app =>
                        app.internship?.company?.toLowerCase().includes(companyName.toLowerCase())
                    );
                }

                // Sort by appliedAt descending and take top 5
                const sortedApps = allApps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)).slice(0, 5);
                setRecentApplications(sortedApps);

            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const handleEvaluate = (ipp) => {
        const token = ipp.mentorAccessToken || '';
        const email = ipp.companyMentorEvaluation?.mentorEmail || '';
        const name = ipp.companyMentorEvaluation?.mentorName || '';

        // This opens the public evaluation route
        const link = `${window.location.origin}/mentor/evaluate/${ipp.ippId}?token=${token}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;

        // Open in new tab
        window.open(link, '_blank');
        toast.success('Opening evaluation form...');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
                        <p className="text-gray-600 mt-1">Overview of your recruitment activities</p>
                    </div>
                    <Link to="/recruiter/internships" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all flex items-center gap-2">
                        <Briefcase size={20} />
                        Post New Job
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.bg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={stat.color} size={24} />
                                </div>
                                <span className="flex items-center text-green-500 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full">
                                    <TrendingUp size={12} className="mr-1" />
                                    +12%
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Pending Evaluations Section */}
                {pendingEvals.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
                        <div className="p-6 border-b border-blue-50 bg-blue-50/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Pending Intern Evaluations</h2>
                                    <p className="text-sm text-gray-500">Please complete performance reviews for these interns</p>
                                </div>
                            </div>
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                {pendingEvals.length} Pending
                            </span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {pendingEvals.map((ipp) => (
                                <div key={ipp.ippId} className="p-5 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            {ipp.studentDetails?.name?.charAt(0) || 'S'}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900">{ipp.studentDetails?.name || 'Student Name'}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-gray-600 font-medium">{ipp.internshipDetails?.role || 'Intern Role'}</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">ID: {ipp.ippId}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleEvaluate(ipp)}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                                    >
                                        Evaluate Intern
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Activity & Quick Actions Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Applications */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
                            <Link to="/recruiter/applications" className="text-blue-600 text-sm font-medium hover:underline">View All</Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentApplications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No recent applications found.</div>
                            ) : (
                                recentApplications.map((app) => (
                                    <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-sm shadow-sm">
                                            {app.student?.name?.charAt(0) || 'S'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-gray-900">{app.student?.name || 'Student Name'}</h4>
                                            <p className="text-xs text-gray-500">Applied for {app.internship?.title || 'Internship'}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-400 block">{new Date(app.appliedAt).toLocaleDateString()}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${app.status === 'applied' ? 'bg-blue-50 text-blue-600' :
                                                app.status === 'offered' ? 'bg-green-50 text-green-600' :
                                                    app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {app.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors font-medium text-gray-700 flex items-center gap-3">
                                <FileText size={18} className="text-gray-500" />
                                Review New Resumes
                            </button>
                            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors font-medium text-gray-700 flex items-center gap-3">
                                <Users size={18} className="text-gray-500" />
                                Search Candidates
                            </button>
                            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors font-medium text-gray-700 flex items-center gap-3">
                                <Clock size={18} className="text-gray-500" />
                                Schedule Interviews
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
