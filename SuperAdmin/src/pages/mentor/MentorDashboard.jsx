import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Building,
  User,
  Clock,
  Users,
  Eye,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { openResumeSecurely } from '../../utils/resumeViewer';
import { sendApplicationStatusEmail } from '../../utils/web3forms';

const MentorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        axios.get('/applications/pending/mentor'),
        axios.get('/applications')
      ]);
      setPending(pendingRes.data.applications || []);
      setAssigned(allRes.data.applications || []);
    } catch (e) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (appId, action) => {
    try {
      setLoading(true);
      const feedback = feedbackMap[appId] || '';
      const response = await axios.put(`/applications/${appId}/status`, {
        status: action === 'approve' ? 'approved' : 'rejected',
        feedback
      });

      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      toast.success(`Application ${newStatus}`, {
        icon: action === 'approve' ? '✅' : '❌',
      });

      // Optimistically update local state
      setPending(prev => prev.filter(app => app.id !== appId));
      setAssigned(prev => prev.map(app =>
        app.id === appId ? { ...app, status: newStatus } : app
      ));

      if (response.data.student && response.data.internship) {
        // Send email in background, don't await it
        sendApplicationStatusEmail({
          student: response.data.student,
          internship: response.data.internship,
          status: newStatus,
          feedback: feedback
        }).catch(err => {
          console.warn('Email notification failed:', err);
          // Optional: toast.error('Email notification failed, but application status updated');
        });
      }

      // Refresh data in background
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error('Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-500 text-lg">Loading Applications...</p>
        </div>
      </div>
    );
  }

  const approvedCount = assigned.filter(app => app.status === 'approved').length;
  const rejectedCount = assigned.filter(app => app.status === 'rejected').length;

  const StatCard = ({ title, count, icon: Icon, colorClass, delay }) => (
    <div
      className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${colorClass}-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${colorClass}-500/20 transition-colors`}></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-4xl font-bold text-slate-900">{count}</p>
        </div>
        <div className={`w-12 h-12 bg-${colorClass}-50 text-${colorClass}-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

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
            Faculty Portal
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
            Applications Dashboard
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
            Review student internship applications, provide feedback, and manage approvals with our intelligent workflow system.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Pending"
            count={pending.length}
            icon={Clock}
            colorClass="amber"
            delay={0}
          />
          <StatCard
            title="Total Assigned"
            count={assigned.length}
            icon={Users}
            colorClass="blue"
            delay={100}
          />
          <StatCard
            title="Approved"
            count={approvedCount}
            icon={CheckCircle2}
            colorClass="emerald"
            delay={200}
          />
          <StatCard
            title="Rejected"
            count={rejectedCount}
            icon={XCircle}
            colorClass="rose"
            delay={300}
          />
        </div>

        {/* Pending Approvals */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Clock className="h-7 w-7 text-amber-500" />
                Pending Approvals
              </h2>
              <p className="text-slate-500 mt-1">Applications waiting for your review</p>
            </div>
            <span className="px-4 py-2 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-100 shadow-sm">
              {pending.length} Pending
            </span>
          </div>

          {pending.length === 0 ? (
            <div className="text-center py-20 relative z-10">
              <div className="bg-emerald-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                All Caught Up!
              </h3>
              <p className="text-slate-500 text-lg">
                No applications awaiting your approval at the moment.
              </p>
            </div>
          ) : (
            <ul className="space-y-6 relative z-10">
              {pending.map((app, index) => (
                <li
                  key={`${app.id}-${index}`}
                  className="border border-slate-100 rounded-2xl p-6 bg-slate-50 hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all duration-300 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                    <div className="flex-1 min-w-0">
                      {/* Position & Company */}
                      <div className="mb-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                              {app.internship?.title || 'Unknown Position'}
                            </h3>
                            <div className="flex items-center gap-3 text-slate-600 mb-3">
                              <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 text-sm font-medium shadow-sm">
                                <Building className="h-4 w-4 text-blue-600" />
                                {app.internship?.company || 'Unknown Company'}
                              </span>
                              <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 text-sm font-medium shadow-sm">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {new Date(app.appliedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Student Details */}
                      {app.student && (
                        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                          <div className="flex items-start gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0 shadow-inner">
                              <User className="h-7 w-7 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-lg font-bold text-slate-900 mb-0.5">
                                    {app.student.name}
                                  </p>
                                  <p className="text-sm text-slate-500 mb-3">
                                    {app.student.email}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 text-sm mb-3">
                                <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 font-medium">
                                  {app.student.department}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                                  CGPA: {app.student.cgpa}
                                </span>
                              </div>
                              {app.student.resumeLink && (
                                <button
                                  onClick={() => openResumeSecurely(app.student.id, app.student.name)}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-full hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all font-semibold shadow-sm text-sm"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Resume
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Panel */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <label className="block text-sm font-bold text-slate-900 mb-3">
                          Review Feedback
                        </label>
                        <textarea
                          value={feedbackMap[app.id] || ''}
                          onChange={(e) => setFeedbackMap({ ...feedbackMap, [app.id]: e.target.value })}
                          placeholder="Add notes or feedback for the student..."
                          className="w-full h-24 p-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 mb-4 transition-all"
                        />
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => handleAction(app.id, 'approve')}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all duration-200 shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve Application
                          </button>
                          <button
                            onClick={() => handleAction(app.id, 'reject')}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl font-bold transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* All Assigned Applications */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <FileText className="h-7 w-7 text-blue-600" />
                All Assignments
              </h2>
              <p className="text-slate-500 mt-1">History of all your managed applications</p>
            </div>
            <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-sm">
              {assigned.length} Total
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assigned.map((app, index) => (
              <div
                key={`${app.id}-${index}`}
                className="group border border-slate-100 rounded-2xl p-6 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                {/* Decorative blur */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/10 transition-colors"></div>

                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                    <Building className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <div className="relative z-10">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-2 mb-1 group-hover:text-blue-700 transition-colors">
                    {app.internship?.title || 'Unknown Position'}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mb-4">{app.internship?.company || 'Unknown Company'}</p>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="h-3 w-3 text-slate-500" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 truncate">
                      {app.student?.name || 'Unknown Student'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

function getStatusBadge(status) {
  const styles = {
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    pending_mentor_approval: 'bg-amber-100 text-amber-800 border-amber-200',
    applied: 'bg-blue-100 text-blue-800 border-blue-200',
    interview_scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
    offered: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  };

  const labels = {
    approved: 'Approved',
    rejected: 'Rejected',
    pending_mentor_approval: 'Pending',
    applied: 'Applied',
    interview_scheduled: 'Interview Scheduled',
    offered: 'Offered'
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-bold border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {labels[status] || formatStatus(status)}
    </span>
  );
}

function formatStatus(status) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export default MentorDashboard;
