import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, MapPin, DollarSign, Clock, Building, X } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const emptyForm = {
  id: '',
  title: '',
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
  companyDescription: '',
  requirements: '',
  benefits: '',
  recruiterNotes: ''
};

const RecruiterInternships = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchMyInternships();
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

  const fetchMyInternships = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/internships/my-postings');
      setInternships(res.data.internships || []);
    } catch (e) {
      toast.error('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({
      ...emptyForm,
      // Pre-fill company info from recruiter profile
      company: user.company || '',
      companyLogo: user.companyLogo || '',
      location: user.companyDetails?.location || ''
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const openEdit = (internship) => {
    setForm({
      id: internship.id,
      title: internship.title,
      description: internship.description || '',
      requiredSkills: (internship.requiredSkills || []).join(', '),
      preferredSkills: (internship.preferredSkills || []).join(', '),
      eligibleDepartments: (internship.eligibleDepartments || []).join(', '),
      minimumSemester: internship.minimumSemester || 4,
      minimumCGPA: internship.minimumCGPA || 6,
      stipend: internship.stipend || '',
      duration: internship.duration || '',
      location: internship.location || '',
      workMode: internship.workMode || 'On-site',
      applicationDeadline: internship.applicationDeadline ? internship.applicationDeadline.substring(0, 10) : '',
      startDate: internship.startDate ? internship.startDate.substring(0, 10) : '',
      endDate: internship.endDate ? internship.endDate.substring(0, 10) : '',
      maxApplications: internship.maxApplications || 50,
      companyDescription: internship.companyDescription || '',
      requirements: (internship.requirements || []).join('\n'),
      benefits: (internship.benefits || []).join('\n'),
      recruiterNotes: internship.recruiterNotes || ''
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const saveForm = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        company: user.company, // Always use recruiter's company
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
        maxApplications: Number(form.maxApplications),
        companyDescription: form.companyDescription,
        requirements: form.requirements.split('\n').map(r => r.trim()).filter(Boolean),
        benefits: form.benefits.split('\n').map(b => b.trim()).filter(Boolean),
        recruiterNotes: form.recruiterNotes
      };

      if (isEditing) {
        // For editing rejected proposals, resubmit them
        const currentInternship = internships.find(i => i.id === form.id);
        if (currentInternship?.status === 'rejected') {
          await axios.post('/internships/submit', payload);
          toast.success('Proposal resubmitted for approval');
        } else {
          await axios.put(`/internships/${form.id}`, payload);
          toast.success('Internship updated successfully');
        }
      } else {
        await axios.post('/internships/submit', payload);
        toast.success('Proposal submitted for admin approval');
      }
      setShowForm(false);
      await fetchMyInternships();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Save failed');
    }
  };

  const toggleStatus = async (internship) => {
    try {
      const newStatus = internship.status === 'active' ? 'inactive' : 'active';
      await axios.put(`/internships/${internship.id}`, { status: newStatus });
      toast.success(`Internship ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      await fetchMyInternships();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const confirmDelete = async (id) => {
    if (!window.confirm('Delete this internship posting? This action cannot be undone.')) return;
    try {
      await axios.delete(`/internships/${id}`);
      toast.success('Internship deleted successfully');
      await fetchMyInternships();
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
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Internship Submissions</h1>
            <p className="text-gray-500 mt-1">Submit and manage internship proposals for {user.company}</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center justify-center">
            <Plus className="h-4 w-4 mr-2" /> Submit New Proposal
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{internships.length}</div>
            <div className="text-sm text-gray-500">Total Submissions</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-amber-500">
              {internships.filter(i => i.status === 'submitted').length}
            </div>
            <div className="text-sm text-gray-500">Pending Approval</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {internships.filter(i => i.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">Approved & Active</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-red-500">
              {internships.filter(i => i.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-500">Rejected</div>
          </div>
        </div>

        {/* Internship List */}
        {internships.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No proposals submitted yet</h3>
            <p className="text-gray-500 mb-4">Start by submitting your first internship proposal for admin approval</p>
            <button onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" /> Submit First Proposal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship) => (
              <div key={internship.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm group hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors text-lg">
                      {internship.title}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      {internship.company}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${internship.status === 'active'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : internship.status === 'submitted'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : internship.status === 'rejected'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                    {internship.status === 'submitted' ? 'Pending' :
                      internship.status === 'rejected' ? 'Rejected' :
                        internship.status === 'active' ? 'Active' :
                          internship.status || 'Unknown'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {internship.location} • {internship.workMode}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    {internship.stipend}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {internship.duration}
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {internship.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(internship.requiredSkills || []).slice(0, 3).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200 font-medium">
                      {skill}
                    </span>
                  ))}
                  {internship.requiredSkills?.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-200">
                      +{internship.requiredSkills.length - 3} more
                    </span>
                  )}
                </div>

                {/* Admin feedback */}
                {(internship.adminNotes || internship.rejectionReason) && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded-r-lg">
                    <div className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Admin Feedback</div>
                    <div className="text-sm text-blue-700">
                      {internship.rejectionReason || internship.adminNotes}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-500 mb-4 pt-3 border-t border-gray-50">
                  <span className="font-semibold text-gray-900">{internship.currentApplications || 0}</span> applications received
                  {internship.status === 'submitted' && (
                    <span className="ml-2 text-amber-600 font-medium">• Awaiting review</span>
                  )}
                </div>

                <div className="flex gap-2">
                  {internship.status === 'submitted' ? (
                    <>
                      <button
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 cursor-not-allowed bg-gray-50"
                        disabled
                      >
                        <Pencil className="h-4 w-4 mr-1.5" /> Pending Review
                      </button>
                      <button
                        onClick={() => confirmDelete(internship.id)}
                        className="px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm"
                        title="Cancel submission"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : internship.status === 'rejected' ? (
                    <>
                      <button
                        onClick={() => openEdit(internship)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors shadow-sm font-medium"
                      >
                        <Pencil className="h-4 w-4 mr-1.5" /> Revise
                      </button>
                      <button
                        onClick={() => confirmDelete(internship.id)}
                        className="px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm"
                        title="Delete proposal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openEdit(internship)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors shadow-sm font-medium"
                      >
                        <Pencil className="h-4 w-4 mr-1.5" /> Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(internship)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors shadow-sm font-medium"
                      >
                        {internship.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        onClick={() => confirmDelete(internship.id)}
                        className="px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm"
                        title="Delete internship"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={handleModalClick}
          >
            <div
              className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col my-4 shadow-2xl border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-6 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    {isEditing ? 'Edit Internship Proposal' : 'Submit Internship Proposal'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Fill in the details below for admin approval.</p>
                </div>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                  onClick={() => setShowForm(false)}
                  title="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={saveForm} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Position Title *
                      </label>
                      <input
                        className="input-field text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                        placeholder="e.g., Software Engineering Intern"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Company
                      </label>
                      <input
                        className="input-field bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                        value={user.company}
                        disabled
                        title="Company is automatically set from your profile"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Job Description *
                    </label>
                    <textarea
                      className="input-field h-32 text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required
                      placeholder="Describe the internship role, responsibilities, and what the intern will learn..."
                    />
                  </div>

                  {/* Skills and Requirements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Required Skills * (comma separated)
                      </label>
                      <input
                        className="input-field text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        value={form.requiredSkills}
                        onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
                        required
                        placeholder="JavaScript, React, Node.js"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Preferred Skills (comma separated)
                      </label>
                      <input
                        className="input-field text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        value={form.preferredSkills}
                        onChange={(e) => setForm({ ...form, preferredSkills: e.target.value })}
                        placeholder="TypeScript, AWS, Docker"
                      />
                    </div>
                  </div>

                  {/* Eligibility */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Eligible Departments *
                      </label>
                      <input
                        className="input-field text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        value={form.eligibleDepartments}
                        onChange={(e) => setForm({ ...form, eligibleDepartments: e.target.value })}
                        required
                        placeholder="Computer Science, IT"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Minimum Semester
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        className="input-field text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        value={form.minimumSemester}
                        onChange={(e) => setForm({ ...form, minimumSemester: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Minimum CGPA
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className="input-field text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        value={form.minimumCGPA}
                        onChange={(e) => setForm({ ...form, minimumCGPA: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Compensation and Logistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Stipend
                      </label>
                      <input
                        className="input-field text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        value={form.stipend}
                        onChange={(e) => setForm({ ...form, stipend: e.target.value })}
                        placeholder="₹20,000/month"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Duration
                      </label>
                      <input
                        className="input-field text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        placeholder="6 months"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Max Applications
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="input-field text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        value={form.maxApplications}
                        onChange={(e) => setForm({ ...form, maxApplications: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Location and Work Mode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Location
                      </label>
                      <input
                        className="input-field text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="Mumbai, Delhi, Remote"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Work Mode
                      </label>
                      <select
                        className="input-field text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        value={form.workMode}
                        onChange={(e) => setForm({ ...form, workMode: e.target.value })}
                      >
                        <option value="On-site">On-site</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Application Deadline
                      </label>
                      <input
                        type="date"
                        className="input-field text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        value={form.applicationDeadline}
                        onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="input-field text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="input-field text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Company Description
                    </label>
                    <textarea
                      className="input-field h-24 text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                      value={form.companyDescription}
                      onChange={(e) => setForm({ ...form, companyDescription: e.target.value })}
                      placeholder="Brief description of your company..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Additional Requirements
                      </label>
                      <textarea
                        className="input-field h-24 text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                        value={form.requirements}
                        onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                        placeholder="Strong communication skills&#10;Ability to work in a team&#10;Problem-solving mindset"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Benefits Offered
                      </label>
                      <textarea
                        className="input-field h-24 text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                        value={form.benefits}
                        onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                        placeholder="Mentorship from senior developers&#10;Flexible working hours&#10;Certificate of completion&#10;Networking opportunities"
                      />
                    </div>
                  </div>

                  {/* Recruiter Notes */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Additional Notes for Admin (Optional)
                    </label>
                    <textarea
                      className="input-field h-24 text-gray-900 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                      value={form.recruiterNotes}
                      onChange={(e) => setForm({ ...form, recruiterNotes: e.target.value })}
                      placeholder="Any additional information for the placement cell to review..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button type="button" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors" onClick={() => setShowForm(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors shadow-sm">
                      {isEditing ? 'Update Proposal' : 'Submit for Approval'}
                    </button>
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

export default RecruiterInternships;