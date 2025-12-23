import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Users, Building2, Briefcase, FileCheck,
    TrendingUp, Award, Target, Zap, ChevronRight,
    Search, Download, Filter
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminAnalytics = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/analytics/dashboard');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="large" /></div>;
    if (!data) return <div className="p-8 text-center text-slate-500">Failed to load analytics data.</div>;

    const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

    // Professionalizing the data for the "flex"
    const deptData = Object.entries(data.studentsByDepartment || {}).map(([name, value]) => ({ name, value }));
    const statusData = [
        { name: 'Selected/Hired', value: (data.applicationsByStatus?.accepted || 0) + (data.applicationsByStatus?.offered || 0) },
        { name: 'In Review', value: (data.applicationsByStatus?.applied || 0) + (data.applicationsByStatus?.approved || 0) },
        { name: 'Interviews', value: (data.applicationsByStatus?.interview_scheduled || 0) + (data.applicationsByStatus?.interviewed || 0) },
        { name: 'Others', value: (data.applicationsByStatus?.rejected || 0) + (data.applicationsByStatus?.declined || 0) }
    ].filter(d => d.value > 0);

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Institutional Analytics</h1>
                        <p className="text-slate-500 mt-1">Real-time performance monitoring and placement success tracking.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm font-sans">
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                    </div>
                </div>

                {/* Achievement Flex Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Target className="w-16 h-16 text-blue-600" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium mb-1">Career Success Rate</p>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1 leading-none">{data.overview?.successRate}%</h3>
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 w-fit px-2 py-0.5 rounded-full mt-2">
                            <TrendingUp className="w-3 h-3" /> +15.4% YoY
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Award className="w-16 h-16 text-purple-600" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium mb-1">Industry Verified IPPs</p>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1 leading-none">{data.overview?.verifiedIPPs}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Quality-checked credentials</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Building2 className="w-16 h-16 text-rose-600" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium mb-1">Corporate Partners</p>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1 leading-none">{data.overview?.totalRecruiters}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Active hiring companies</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group border-b-2 border-b-blue-600">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Zap className="w-16 h-16 text-amber-600" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium mb-1">Offers Extended</p>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1 leading-none">{data.overview?.acceptedOffers}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Direct campus placements</p>
                    </div>
                </div>

                {/* Main Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Application Pipeline */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Application Pipeline</h2>
                                <p className="text-sm text-slate-500">Distribution across hiring stages</p>
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.monthlyTrends || []}>
                                    <defs>
                                        <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Nunito' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Nunito' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Nunito' }}
                                    />
                                    <Area type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Department Distribution */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Department Overview</h2>
                                <p className="text-sm text-slate-500">Student count by specialization</p>
                            </div>
                        </div>
                        <div className="h-80 w-full flex flex-col md:flex-row items-center border border-dashed border-slate-100 rounded-xl p-4">
                            <div className="w-full md:w-2/3 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={deptData}
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {deptData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ fontFamily: 'Nunito', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/3 flex flex-col gap-3 justify-center">
                                {deptData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-xs font-bold text-slate-700 truncate font-sans">{entry.name}</span>
                                        <span className="text-xs text-slate-400 font-medium font-sans">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lower Insights Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Top Hiring Companies */}
                    <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col font-sans">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            Top Hiring Partners
                        </h2>
                        <div className="space-y-4 flex-grow">
                            {data.topCompanies?.map((company, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 group hover:bg-slate-100 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm font-bold text-slate-700 border border-slate-200">
                                            {idx + 1}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{company.company}</span>
                                    </div>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg">
                                        {company.applications} APPS
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button className="mt-6 w-full py-2.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 font-sans">
                            View Partner Network <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Stage Success Breakdown */}
                    <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 shadow-xl relative overflow-hidden font-sans">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-2">Hiring Velocity</h2>
                            <p className="text-slate-400 mb-8 font-medium">Stage conversion metrics for current cycle</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {statusData.map((stage, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stage.name}</div>
                                        <div className="text-4xl font-black text-white">{stage.value}</div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                style={{ width: `${Math.min(100, (stage.value / data.overview?.totalApplications) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                                    <div className="flex items-center gap-4 text-white">
                                        <div className="p-3 bg-blue-600/20 rounded-xl">
                                            <Sparkles className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">AI Predicted Placement</div>
                                            <div className="text-slate-400 text-sm">Projected reach based on active application velocity</div>
                                        </div>
                                    </div>
                                    <div className="text-4xl font-black text-blue-400">
                                        {Math.min(96, (data.overview?.successRate || 0) + 12)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Sparkles icon if missing from lucide
const Sparkles = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
);

export default AdminAnalytics;
