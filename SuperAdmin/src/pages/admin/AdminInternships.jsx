import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, MapPin, DollarSign, Clock, Building, X, MoreHorizontal, Check, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = {
  id: '',
  title: '',
  company: '',
  companyLogo: '',
  description: '',
  requiredSkills: '',
  preferredSkills: '',
  eligibleDepartments: '',
  minimumSemester: 4,
  minimumCGPA: 6,
  stipend: '',
  duration: '',
  location: '',
  workMode: 'On-site',
  applicationDeadline: '',
  startDate: '',
  endDate: '',
  maxApplications: 50,
};

const AdminInternships = () => {
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState([]);
  const [pending, setPending] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchInternships();
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showForm) {
        setShowForm(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showForm]);

  const handleModalClick = (e) => {
    // Close modal if clicking on backdrop
    if (e.target === e.currentTarget) {
      setShowForm(false);
    }
  };

  const fetchInternships = async () => {
    setLoading(true);
    try {
      let allRes;
      try {
        allRes = await axios.get('/internships');
      } catch (errPrimary) {
        // Fallback: try explicitly requesting active internships
        try {
          allRes = await axios.get('/internships?status=active');
        } catch (errFallback) {
          console.error('Admin internships load error:', errFallback?.response?.data || errFallback?.message);
          toast.error(errFallback?.response?.data?.error || 'Failed to load internships');
          allRes = { data: { internships: [] } };
        }
      }

      let pendingRes;
      try {
        pendingRes = await axios.get('/internships/pending');
      } catch (errPending) {
        console.warn('Pending submissions load failed:', errPending?.response?.data || errPending?.message);
        pendingRes = { data: { internships: [] } };
      }

      setInternships(allRes.data.internships || []);
      setPending(pendingRes.data.internships || []);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setShowForm(true);
  };

  const openEdit = (i) => {
    setForm({
      id: i.id,
      title: i.title,
      company: i.company,
      companyLogo: i.companyLogo || '',
      description: i.description || '',
      requiredSkills: (i.requiredSkills || []).join(', '),
      preferredSkills: (i.preferredSkills || []).join(', '),
      eligibleDepartments: (i.eligibleDepartments || []).join(', '),
      minimumSemester: i.minimumSemester || 4,
      minimumCGPA: i.minimumCGPA || 6,
      stipend: i.stipend || '',
      duration: i.duration || '',
      location: i.location || '',
      workMode: i.workMode || 'On-site',
      applicationDeadline: i.applicationDeadline ? i.applicationDeadline.substring(0, 10) : '',
      startDate: i.startDate ? i.startDate.substring(0, 10) : '',
      endDate: i.endDate ? i.endDate.substring(0, 10) : '',
      maxApplications: i.maxApplications || 50,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const saveForm = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        company: form.company,
        companyLogo: form.companyLogo,
        description: form.description,
        requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: form.preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
        eligibleDepartments: form.eligibleDepartments.split(',').map(s => s.trim()).filter(Boolean),
        minimumSemester: Number(form.minimumSemester),
        minimumCGPA: Number(form.minimumCGPA),
        stipend: form.stipend,
        duration: form.duration,
        location: form.location,
        workMode: form.workMode,
        applicationDeadline: form.applicationDeadline ? new Date(form.applicationDeadline).toISOString() : undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        maxApplications: Number(form.maxApplications)
      };
      if (isEditing) {
        await axios.put(`/internships/${form.id}`, payload);
        toast.success('Internship updated');
      } else {
        await axios.post('/internships', payload);
        toast.success('Internship created');
      }
      setShowForm(false);
      await fetchInternships();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Save failed');
    }
  };

  const toggleStatus = async (i) => {
    try {
      const newStatus = i.status === 'active' ? 'inactive' : 'active';
      await axios.put(`/internships/${i.id}`, { status: newStatus });
      toast.success(`Internship ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      await fetchInternships();
    } catch (e) {
      toast.error('Failed to toggle status');
    }
  };

  const confirmDelete = async (id) => {
    if (!window.confirm('Delete this internship?')) return;
    try {
      await axios.delete(`/internships/${id}`);
      toast.success('Internship deleted');
      await fetchInternships();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-50 to-slate-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
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
                Internships
              </h1>
              <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
                Manage internship listings and approvals.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center transition-all text-sm font-bold hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 mr-2" /> New Internship
            </button>
          </div>
        </div>

        {pending.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-2 w-2 rounded-full bg-amber-500 ring-4 ring-amber-500/20"></div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Pending Review ({pending.length})</h2>
            </div>
            <div className="space-y-4">
              {pending.map((p) => (
                <div key={p.id} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 pointer-events-none">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">Pending Review</span>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{p.title}</h3>
                      <div className="text-sm font-medium text-slate-500 mt-1">{p.company} • Submitted by {p.submittedBy} on {new Date(p.submittedAt).toLocaleString()}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Notes</label>
                        <textarea
                          className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20 h-24 p-4 text-sm resize-none font-medium transition-shadow outline-none"
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add notes for the recruiter..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejection Reason</label>
                        <textarea
                          className="w-full rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-blue-500/20 h-24 p-4 text-sm resize-none font-medium transition-shadow outline-none"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Required if rejecting..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-50">
                      <button
                        onClick={async () => { if (!rejectionReason) { return toast.error('Enter rejection reason'); } try { await axios.put(`/internships/${p.id}/reject`, { rejectionReason, adminNotes }); toast.success('Rejected'); setAdminNotes(''); setRejectionReason(''); fetchInternships(); } catch (e) { toast.error(e.response?.data?.error || 'Reject failed') } }}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-100 rounded-xl transition-all text-sm font-bold shadow-sm"
                      >
                        Reject
                      </button>
                      <button
                        onClick={async () => { try { await axios.put(`/internships/${p.id}/approve`, { adminNotes }); toast.success('Approved'); setAdminNotes(''); setRejectionReason(''); fetchInternships(); } catch (e) { toast.error(e.response?.data?.error || 'Approve failed') } }}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/10 transition-all text-sm font-bold"
                      >
                        Approve & Publish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Internships */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Listings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((i) => (
            <div key={i.id} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 truncate text-lg tracking-tight group-hover:text-blue-600 transition-colors">{i.title}</h3>
                  <p className="text-sm text-slate-500 flex items-center mt-1 font-medium">
                    {i.company}
                  </p>
                </div>
                {i.companyLogo ? (
                  <img src={i.companyLogo} alt={i.company} className="h-12 w-12 rounded-xl object-cover border border-slate-100 shadow-sm" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                    <Building size={20} />
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-slate-600 font-medium">
                  <MapPin className="h-4 w-4 mr-2.5 text-slate-400" />
                  {i.location} <span className="mx-1.5 text-slate-300">•</span> {i.workMode}
                </div>
                <div className="flex items-center text-sm text-slate-600 font-medium">
                  <DollarSign className="h-4 w-4 mr-2.5 text-slate-400" />
                  {i.stipend}
                </div>
                <div className="flex items-center text-sm text-slate-600 font-medium">
                  <Clock className="h-4 w-4 mr-2.5 text-slate-400" />
                  {i.duration}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${i.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  i.status === 'submitted' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    i.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                      'bg-slate-50 text-slate-600 border border-slate-100'
                  }`}>
                  {i.status === 'submitted' ? 'Pending' :
                    i.status === 'rejected' ? 'Rejected' :
                      i.status === 'active' ? 'Active' :
                        i.status || 'active'}
                </span>
                {(i.requiredSkills || []).slice(0, 2).map((s) => (
                  <span key={s} className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full text-[11px] font-bold border border-slate-100">{s}</span>
                ))}
                {i.requiredSkills?.length > 2 && (
                  <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-full text-[11px] font-bold border border-slate-100">+{i.requiredSkills.length - 2}</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex gap-1">
                  <button onClick={() => openEdit(i)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => toggleStatus(i)} className={`p-2 rounded-lg transition-colors ${i.status === 'active' ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={i.status === 'active' ? 'Deactivate' : 'Activate'}>
                    {i.status === 'active' ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button onClick={() => confirmDelete(i.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => openEdit(i)}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center"
                >
                  Details <MoreHorizontal className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-8 z-[9999] overflow-y-auto"
            onClick={handleModalClick}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl shadow-slate-900/20 border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-6 flex-shrink-0 bg-slate-50/50 rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{isEditing ? 'Edit Internship' : 'New Internship'}</h2>
                  <p className="text-sm text-slate-500 mt-1">Fill in the details below to {isEditing ? 'update' : 'create'} a listing.</p>
                </div>
                <button
                  type="button"
                  className="p-2 hover:bg-slate-200/50 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                  onClick={() => setShowForm(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <form onSubmit={saveForm} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Title</label>
                    <input className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Senior Frontend Engineer" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Company</label>
                    <input className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-sm" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required placeholder="e.g. Acme Corp" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Company Logo URL</label>
                    <input className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-sm" value={form.companyLogo} onChange={(e) => setForm({ ...form, companyLogo: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Description</label>
                    <textarea className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm h-32 resize-none font-medium outline-none transition-all placeholder:text-slate-400 shadow-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the role and responsibilities..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Required Skills</label>
                    <input className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-sm" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} placeholder="React, Node.js, ..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Preferred Skills</label>
                    <input className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-sm" value={form.preferredSkills} onChange={(e) => setForm({ ...form, preferredSkills: e.target.value })} placeholder="TypeScript, AWS, ..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Eligible Departments</label>
                    <input className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-sm" value={form.eligibleDepartments} onChange={(e) => setForm({ ...form, eligibleDepartments: e.target.value })} placeholder="Computer Science, IT, ..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Min. Semester</label>
                    <input type="number" className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-sm" value={form.minimumSemester} onChange={(e) => setForm({ ...form, minimumSemester: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Min. CGPA</label>
                    <input type="number" step="0.1" className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-sm" value={form.minimumCGPA} onChange={(e) => setForm({ ...form, minimumCGPA: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Stipend</label>
                    <input className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-sm" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} placeholder="e.g. ₹15,000/month" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Duration</label>
                    <input className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-sm" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 6 months" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Location</label>
                    <input className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-sm" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bangalore" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Work Mode</label>
                    <select className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all cursor-pointer shadow-sm" value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })}>
                      <option>On-site</option>
                      <option>Remote</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Deadline</label>
                    <input type="date" className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all cursor-pointer shadow-sm" value={form.applicationDeadline} onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Start Date</label>
                    <input type="date" className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all cursor-pointer shadow-sm" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">End Date</label>
                    <input type="date" className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all cursor-pointer shadow-sm" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Max Applications</label>
                    <input type="number" className="w-full rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 py-3 px-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-sm" value={form.maxApplications} onChange={(e) => setForm({ ...form, maxApplications: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-3 pt-6 border-t border-slate-100 mt-2">
                    <button type="button" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-bold shadow-sm" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm font-bold">{isEditing ? 'Update Listing' : 'Create Listing'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInternships;
