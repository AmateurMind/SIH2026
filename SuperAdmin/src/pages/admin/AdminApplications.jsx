import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Building, FileText, Download, ChevronDown, Eye, MoreHorizontal, Search, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

import { openResumeSecurely } from '../../utils/resumeViewer';
import { sendApplicationStatusEmail } from '../../utils/web3forms';

const statuses = [
  'applied',
  'pending_mentor_approval',
  'approved',
  'rejected',
  'interview_scheduled',
  'offered',
  'completed',
];

const AdminApplications = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({ status: '', department: '', from: '', to: '', search: '' });

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/applications');
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      toast.error('Could not load applications');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return (applications || []).filter(app => {
      if (filters.status && app.status !== filters.status) return false;
      if (filters.department && app.student?.department !== filters.department) return false;
      if (filters.from && new Date(app.appliedAt) < new Date(filters.from)) return false;
      if (filters.to && new Date(app.appliedAt) > new Date(filters.to)) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          app.student?.name?.toLowerCase().includes(searchLower) ||
          app.internship?.title?.toLowerCase().includes(searchLower) ||
          app.internship?.company?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [applications, filters]);

  const updateStatus = async (id, status, feedback = null) => {
    try {
      const response = await axios.put(`/applications/${id}/status`, { status, feedback });
      toast.success('Status updated');

      // Send email notification via Web3Forms (frontend)
      if (response.data.student && response.data.internship) {
        sendApplicationStatusEmail({
          student: response.data.student,
          internship: response.data.internship,
          status: response.data.application.status,
          feedback: feedback || response.data.application.feedback
        }).catch(err => {
          console.warn('Email notification failed:', err);
        });
      }

      await fetchApps();
    } catch (e) {
      console.error('Update status error:', e);
      toast.error('Failed to update status');
    }
  };


  const exportCSV = () => {
    const headers = ['Application ID', 'Student Name', 'Student Email', 'Department', 'Internship', 'Company', 'Status', 'Applied At'];
    const rows = filtered.map(app => [
      app.id,
      app.student?.name || '',
      app.student?.email || '',
      app.student?.department || '',
      app.internship?.title || '',
      app.internship?.company || '',
      app.status,
      new Date(app.appliedAt).toISOString()
    ]);
    const csv = [headers, ...rows].map(r => r.map(field => {
      const s = String(field ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applications_export_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const exportJSON = () => {
    try {
      const data = filtered.map((app) => ({
        id: app.id,
        student: app.student,
        internship: app.internship,
        status: app.status,
        appliedAt: app.appliedAt
      }));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `applications_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('JSON exported');
    } catch (e) {
      toast.error('Export failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const departments = Array.from(new Set(applications.map(a => a.student?.department).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-50 to-slate-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wider uppercase rounded-full mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Admin Portal
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
                Applications
              </h1>
              <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
                Manage and track student applications across all departments.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all text-sm font-bold shadow-sm flex items-center justify-center group"
              >
                <Download className="h-4 w-4 mr-2 text-slate-400 group-hover:text-blue-600 transition-colors" />
                Export CSV
              </button>
              <button
                onClick={exportJSON}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all text-sm font-bold shadow-sm flex items-center justify-center group"
              >
                <FileText className="h-4 w-4 mr-2 text-slate-400 group-hover:text-blue-600 transition-colors" />
                Export JSON
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by student, role, or company..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-xl border-slate-200 bg-slate-50 text-slate-700 font-medium focus:border-blue-500 focus:ring-blue-500/20 py-2.5 px-4 text-sm outline-none transition-all cursor-pointer hover:bg-slate-100/50"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
              </div>
            </div>
            <div>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-xl border-slate-200 bg-slate-50 text-slate-700 font-medium focus:border-blue-500 focus:ring-blue-500/20 py-2.5 px-4 text-sm outline-none transition-all cursor-pointer hover:bg-slate-100/50"
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                >
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
              </div>
            </div>
            <div className="relative">
              <input
                type="date"
                className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-700 font-medium focus:border-blue-500 focus:ring-blue-500/20 py-2.5 px-4 text-sm outline-none transition-all cursor-pointer hover:bg-slate-100/50"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                placeholder="From"
              />
            </div>
          </div>
        </div>

        {/* Responsive list */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">Role & Company</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">Applied</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((app) => (
                <tr key={app.id} className="group hover:bg-slate-50/80 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{app.student?.name || '-'}</span>
                      <span className="text-xs font-medium text-slate-500">{app.student?.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{app.internship?.title || '-'}</span>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {app.internship?.company}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                      <select
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border-0 ring-1 ring-inset focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer bg-transparent transition-all ${app.status === 'approved' ? 'text-emerald-700 ring-emerald-600/20 bg-emerald-50 hover:bg-emerald-100' :
                          app.status === 'rejected' ? 'text-rose-700 ring-rose-600/20 bg-rose-50 hover:bg-rose-100' :
                            app.status === 'interview_scheduled' ? 'text-purple-700 ring-purple-600/20 bg-purple-50 hover:bg-purple-100' :
                              app.status === 'applied' ? 'text-blue-700 ring-blue-600/20 bg-blue-50 hover:bg-blue-100' :
                                app.status === 'pending_mentor_approval' ? 'text-amber-700 ring-amber-600/20 bg-amber-50 hover:bg-amber-100' :
                                  app.status === 'offered' ? 'text-indigo-700 ring-indigo-600/20 bg-indigo-50 hover:bg-indigo-100' :
                                    app.status === 'completed' ? 'text-emerald-700 ring-emerald-600/20 bg-emerald-50 hover:bg-emerald-100' :
                                      'text-slate-600 ring-slate-500/20 bg-slate-50 hover:bg-slate-100'
                          }`}
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-current opacity-50 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 tabular-nums">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      {app.status !== 'completed' && app.status !== 'rejected' && (
                        <button
                          onClick={() => updateStatus(app.id, 'completed')}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Mark as Completed"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {app.student?.resumeLink && (
                        <button
                          onClick={() => openResumeSecurely(app.student.id, app.student.name)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Resume"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {filtered.map(app => (
            <div key={app.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-slate-900">{app.student?.name || '-'}</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">{app.student?.department}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${app.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  app.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    app.status === 'interview_scheduled' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      app.status === 'applied' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        app.status === 'pending_mentor_approval' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          app.status === 'offered' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                            app.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              'bg-slate-50 text-slate-600 border-slate-100'
                  }`}>
                  {app.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-slate-700">
                  <Building className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="font-bold">{app.internship?.title}</span>
                  <span className="mx-1.5 text-slate-300">•</span>
                  <span className="text-slate-500">{app.internship?.company}</span>
                </div>
                <div className="flex items-center text-xs font-medium text-slate-500">
                  <Calendar className="h-3.5 w-3.5 mr-2 text-slate-400" />
                  Applied {new Date(app.appliedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
                <select
                  className="flex-1 rounded-xl border-slate-200 bg-slate-50 text-slate-900 font-medium focus:border-blue-500 focus:ring-blue-500/20 py-2.5 px-3 text-xs outline-none"
                  value={app.status}
                  onChange={(e) => updateStatus(app.id, e.target.value)}
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                {app.student?.resumeLink && (
                  <button
                    onClick={() => openResumeSecurely(app.student.id, app.student.name)}
                    className="px-3 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors text-xs font-bold shadow-sm flex items-center"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" /> Resume
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminApplications;
