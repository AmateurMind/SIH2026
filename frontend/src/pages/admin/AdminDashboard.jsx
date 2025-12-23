import React, { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, FileCheck, ArrowUpRight, CheckCircle2, AlertCircle, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsData, setStatsData] = useState({
        totalStudents: 0,
        recruiters: 0,
        activeInternships: 0,
        placementRate: 0
    });

    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Apps
                const appsResponse = await axios.get('/applications');
                if (appsResponse.data && appsResponse.data.applications) {
                    const sortedApps = appsResponse.data.applications
                        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
                        .slice(0, 5)
                        .map(app => ({
                            id: app.id,
                            student: app.student?.name || 'Unknown Student',
                            role: app.internship?.title || 'Unknown Role',
                            company: app.internship?.company || 'Unknown Company',
                            status: app.status.charAt(0).toUpperCase() + app.status.slice(1).replace(/_/g, ' '),
                            date: timeAgo(new Date(app.appliedAt))
                        }));
                    setRecentApplications(sortedApps);
                }

                // Fetch Analytics Stats
                try {
                    const analyticsResponse = await axios.get('/analytics/dashboard');
                    if (analyticsResponse.data) {
                        const overview = analyticsResponse.data.overview;
                        if (overview) {
                            setStatsData({
                                totalStudents: overview.totalStudents || 0,
                                recruiters: overview.totalRecruiters || 0,
                                activeInternships: overview.activeInternships || 0,
                                placementRate: overview.placementRate || 0
                            });
                        }

                        // Process Monthly Trends for Chart
                        const trends = analyticsResponse.data.monthlyTrends || [];
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const currentYear = new Date().getFullYear();

                        // Create 12-month data structure
                        let maxVal = 0;
                        const processedChartData = months.map(month => {
                            const trend = trends.find(t => t.month.startsWith(month));
                            const value = trend ? trend.applications : 0;
                            if (value > maxVal) maxVal = value;
                            return { label: month, value };
                        });

                        // Calculate percentages for bar height
                        const finalChartData = processedChartData.map(d => ({
                            ...d,
                            percentage: maxVal > 0 ? (d.value / maxVal) * 80 + 10 : 5 // Scale to 10-90% height, min 5%
                        }));

                        setChartData(finalChartData);
                    }
                } catch (analyticsError) {
                    console.error("Failed to fetch analytics, using fallback data", analyticsError);
                    // Fallback chart data if API fails (keep the UI looking good)
                    setChartData([
                        { label: 'Jan', value: 0, percentage: 5 }, { label: 'Feb', value: 0, percentage: 5 },
                        { label: 'Mar', value: 0, percentage: 5 }, { label: 'Apr', value: 0, percentage: 5 },
                        { label: 'May', value: 0, percentage: 5 }, { label: 'Jun', value: 0, percentage: 5 },
                        { label: 'Jul', value: 0, percentage: 5 }, { label: 'Aug', value: 0, percentage: 5 },
                        { label: 'Sep', value: 0, percentage: 5 }, { label: 'Oct', value: 0, percentage: 5 },
                        { label: 'Nov', value: 0, percentage: 5 }, { label: 'Dec', value: 0, percentage: 5 }
                    ]);
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Stats configuration using dynamic data
    const stats = [
        { label: 'Total Students', value: statsData.totalStudents.toLocaleString(), change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Recruiters', value: statsData.recruiters.toLocaleString(), change: '+4%', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Active Internships', value: statsData.activeInternships.toLocaleString(), change: '+8%', icon: Briefcase, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'Placement Rate', value: `${statsData.placementRate}%`, change: '+5%', icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Overview</h1>
                        <p className="text-slate-500 mt-1">Welcome back, Administrator. Here's what's happening today.</p>
                    </div>

                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.bg} p-3 rounded-lg group-hover:scale-105 transition-transform`}>
                                    <stat.icon className={`${stat.color} w-6 h-6`} />
                                </div>
                                <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    {stat.change} <ArrowUpRight className="w-3 h-3 ml-1" />
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area - Recent Activity/Applications */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
                                <Link to="/admin/applications" className="text-sm font-medium text-rose-600 hover:text-rose-700 hover:underline">
                                    View All
                                </Link>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {loading ? (
                                    <div className="p-8 text-center text-slate-500">Loading recent applications...</div>
                                ) : recentApplications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">No recent applications found.</div>
                                ) : (
                                    recentApplications.map((app) => (
                                        <div key={app.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-200 transition-all">
                                                    {app.student.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-slate-900">{app.student}</h4>
                                                    <p className="text-xs text-slate-500">Applied for <span className="font-medium text-slate-700">{app.role}</span> at {app.company}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${app.status === 'Approved' || app.status === 'Accepted' || app.status === 'Hired' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                                <span className="text-xs text-slate-400 font-medium hidden sm:block">{app.date}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Placement Stats Graph */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900">Application Trends</h2>
                                <select className="text-sm border-slate-200 rounded-lg text-slate-600 focus:ring-blue-500 focus:border-blue-500">
                                    <option>This Year</option>
                                    <option>Last Year</option>
                                </select>
                            </div>
                            <div className="h-64 flex items-end justify-between gap-2 px-4">
                                {chartData.length > 0 ? (
                                    chartData.map((item, i) => (
                                        <div key={i} className="w-full bg-slate-50 rounded-t-lg relative group h-full flex flex-col justify-end">
                                            <div
                                                className="w-full bg-blue-600/90 rounded-t-sm hover:bg-blue-700 transition-all relative"
                                                style={{ height: `${item.percentage}%` }}
                                            >
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {item.value} Applications
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                                        No data available for this period
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium uppercase tracking-wide">
                                {chartData.map((item, i) => (
                                    <span key={i}>{item.label}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Quick Actions */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                            <div className="space-y-2">
                                <Link to="/admin/students" className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-3 group">
                                    <div className="bg-white p-1.5 rounded-md border border-slate-200 group-hover:border-rose-500/50 group-hover:text-rose-600 transition-colors">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    Verify New Students
                                </Link>
                                <Link to="/admin/internships" className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-3 group">
                                    <div className="bg-white p-1.5 rounded-md border border-slate-200 group-hover:border-rose-500/50 group-hover:text-rose-600 transition-colors">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    Approve Job Postings
                                </Link>
                                <button onClick={() => alert('Feature coming soon')} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-3 group">
                                    <div className="bg-white p-1.5 rounded-md border border-slate-200 group-hover:border-rose-500/50 group-hover:text-rose-600 transition-colors">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                    Review Flagged Issues
                                </button>
                                <Link to="/admin/calendar" className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-3 group">
                                    <div className="bg-white p-1.5 rounded-md border border-slate-200 group-hover:border-rose-500/50 group-hover:text-rose-600 transition-colors">
                                        <CalendarIcon className="w-4 h-4" />
                                    </div>
                                    Manage Academic Calendar
                                </Link>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
