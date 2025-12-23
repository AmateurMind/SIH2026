import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, TrendingUp, ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar, Clock, Activity } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/analytics/dashboard');
      if (response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Optional: setAnalytics to empty structure if needed, or let UI handle null
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-slate-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans text-slate-900 selection:bg-indigo-500 selection:text-white pb-20">

      {/* Abstract Background Elements (Matching Landing Page Vibe) */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-white to-white" />

      {/* Floating Quantum Blobs */}
      <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-[20%] -left-[10%] w-[35%] h-[35%] rounded-full bg-blue-200/20 blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-teal-100/30 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10">

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-blue-100 rounded-full shadow-sm mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">Live Updates</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 text-lg">Overview of your platform's performance.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white p-2.5 rounded-full border border-slate-200 shadow-sm text-slate-500">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Total Students"
            value={analytics?.overview?.totalStudents || 0}
            trend="+12%"
            trendUp={true}
            icon={Users}
            color="blue"
            delay={0}
          />
          <StatCard
            label="Active Internships"
            value={analytics?.overview?.activeInternships || 0}
            trend="+5%"
            trendUp={true}
            icon={BookOpen}
            color="indigo"
            delay={100}
          />
          <StatCard
            label="Total Applications"
            value={analytics?.overview?.totalApplications || 0}
            trend="+24%"
            trendUp={true}
            icon={FileText}
            color="purple"
            delay={200}
          />
          <StatCard
            label="Placement Rate"
            value={`${analytics?.overview?.placementRate || 0}%`}
            trend="+2.5%"
            trendUp={true}
            icon={TrendingUp}
            color="emerald"
            delay={300}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-100 p-8 overflow-hidden hover:shadow-xl hover:shadow-slate-200/40 transition-shadow duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Activity className="h-5 w-5" />
                </div>
                Recent Activity
              </h2>
              <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            <div className="relative pl-4 space-y-8 before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
              {analytics?.recentActivities?.map((activity, idx) => (
                <div key={activity.id || idx} className="relative pl-8 group">
                  <div className="absolute left-[17px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-500 ring-4 ring-blue-50 group-hover:ring-blue-100 transition-all"></div>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 p-3 -m-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        <span className="font-bold">{activity.student}</span> applied for <span className="text-blue-600 font-semibold">{activity.internship}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <BookOpen className="h-3 w-3 text-slate-400" />
                        <p className="text-xs text-slate-500 font-medium">{activity.company}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm whitespace-nowrap">
                      {new Date(activity.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )) || (
                  <div className="text-center py-10">
                    <p className="text-slate-400">No recent activity found.</p>
                  </div>
                )}
            </div>
          </div>

          {/* Upcoming Interviews */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-100 p-8 hover:shadow-xl hover:shadow-slate-200/40 transition-shadow duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Clock className="h-5 w-5" />
                </div>
                Interviews
              </h2>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">View All</button>
            </div>

            <div className="space-y-4">
              {analytics?.upcomingInterviews?.map((interview, idx) => (
                <div key={interview.id || idx} className="group relative bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex flex-col items-center justify-center flex-shrink-0 text-indigo-600 border border-indigo-100 group-hover:scale-105 transition-transform">
                      <span className="text-xs font-bold uppercase">{new Date(interview.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-xl font-bold leading-none">{new Date(interview.date).getDate()}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate mb-0.5">{interview.student}</p>
                      <p className="text-xs text-slate-500 font-medium truncate mb-2">{interview.internship}</p>

                      <div className="flex items-center flex-wrap gap-2">
                        <span className="inline-flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(interview.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md capitalize border border-indigo-100">
                          {interview.mode}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-60">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <Calendar className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-medium">No upcoming interviews</p>
                  </div>
                )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, trend, trendUp, icon: Icon, color, delay }) => (
  <div
    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${color}-500/20 transition-colors`}></div>

    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-500 text-sm font-bold mb-1 uppercase tracking-wider">{label}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {trend && (
          <div className={`flex items-center text-xs font-bold ${trendUp ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-red-600 bg-red-50 border border-red-100'} px-2.5 py-1 rounded-lg`}>
            {trendUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
            {trend}
          </div>
        )}
        <div className={`w-16 h-1 bg-slate-100 rounded-full overflow-hidden`}>
          <div className={`h-full bg-${color}-500 w-2/3 rounded-full opacity-50 group-hover:opacity-100 transition-opacity`} />
        </div>
      </div>
    </div>
  </div>
);

export default AdminDashboard;