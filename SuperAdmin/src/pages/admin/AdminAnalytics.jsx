import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, Legend, CartesianGrid } from 'recharts';
import { Users, Briefcase, FileText, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/analytics/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center"><LoadingSpinner size="large" /></div>
    );
  }

  if (!data) return null;

  const statusData = Object.entries(data.applicationsByStatus || {}).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  const studentsDept = Object.entries(data.studentsByDepartment || {}).map(([department, value]) => ({ department, value }));
  const monthly = (data.monthlyTrends || []).map(d => ({ month: d.month, applications: d.applications }));
  const skills = (data.skillsDemand || []).map(d => ({ skill: d.skill, demand: d.demand }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-sm">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="capitalize">{entry.name}:</span>
              <span className="font-semibold text-gray-900">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans text-slate-900 selection:bg-indigo-500 selection:text-white pb-20">

      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-white to-white" />
      <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-[20%] -left-[10%] w-[35%] h-[35%] rounded-full bg-blue-200/20 blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-teal-100/30 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics Overview</h1>
          <p className="text-lg text-slate-500 mt-1">Key metrics and performance indicators.</p>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <OverviewCard
            label="Total Students"
            value={data.overview?.totalStudents}
            icon={Users}
            trend="+12%"
            trendUp={true}
            color="blue"
            delay={0}
          />
          <OverviewCard
            label="Active Internships"
            value={data.overview?.activeInternships}
            icon={Briefcase}
            trend="+5%"
            trendUp={true}
            color="indigo"
            delay={100}
          />
          <OverviewCard
            label="Total Applications"
            value={data.overview?.totalApplications}
            icon={FileText}
            trend="+24%"
            trendUp={true}
            color="purple"
            delay={200}
          />
          <OverviewCard
            label="Placement Rate"
            value={`${data.overview?.placementRate || 0}%`}
            icon={TrendingUp}
            trend="+2.5%"
            trendUp={true}
            color="emerald"
            delay={300}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Applications (Line) */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
            <h2 className="font-bold text-slate-900 mb-6 text-xl tracking-tight">Application Trends</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Applications by Status (Pie) */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
            <h2 className="font-bold text-slate-900 mb-6 text-xl tracking-tight">Application Status Distribution</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    cornerRadius={5}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-sm text-slate-600 font-medium ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students by Department (Bar) */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
            <h2 className="font-bold text-slate-900 mb-6 text-xl tracking-tight">Students by Department</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={studentsDept} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="department"
                    type="category"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skills Demand (Bar) */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
            <h2 className="font-bold text-slate-900 mb-6 text-xl tracking-tight">Top Skills in Demand</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={skills}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="skill"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="demand" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OverviewCard = ({ label, value, icon: Icon, trend, trendUp, color = 'blue', delay = 0 }) => (
  <div
    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${color}-500/20 transition-colors`}></div>

    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-500 text-sm font-bold mb-1 uppercase tracking-wider">{label}</p>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value ?? '-'}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {trend && (
          <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-lg ${trendUp ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-red-600 bg-red-50 border border-red-100'}`}>
            {trendUp ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
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

export default AdminAnalytics;
