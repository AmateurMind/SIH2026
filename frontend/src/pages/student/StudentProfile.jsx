import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { openResumeSecurely } from '../../utils/resumeViewer';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Building, Calendar, Award, Phone, MapPin, FileText, Code, Camera, Edit2, Save, X as XIcon, Upload, Trash2, ExternalLink, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

// Set worker path for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const StudentProfile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const { isSignedIn, getToken } = useClerkAuth();
  const [edit, setEdit] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfResumes, setPdfResumes] = useState([]);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [form, setForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
    semester: user?.semester || 1,
    cgpa: user?.cgpa || 0,
    skills: (user?.skills || []).join(', '),
    resumeLink: user?.resumeLink || '',
    phone: user?.phone || '',
    address: user?.address || '',
    profilePicture: user?.profilePicture || ''
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    setUploading(true);
    try {
      const res = await axios.post('/students/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm({ ...form, profilePicture: res.data.imageUrl });
      setUser({ ...user, profilePicture: res.data.imageUrl });
      toast.success('Profile picture uploaded');
    } catch (e) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    // Initialize pdfResumes from user object if available
    if (user?.pdfResumes && user.pdfResumes.length > 0 && pdfResumes.length === 0) {
      setPdfResumes(user.pdfResumes);
    }
    // Also try to fetch fresh data when user is properly authenticated
    if (user && isSignedIn) {
      fetchPdfResumes();
    }
  }, [user, isSignedIn]);

  // Update form when user data changes (e.g., after backend sync)
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        department: user.department || '',
        semester: user.semester || 1,
        cgpa: user.cgpa || 0,
        skills: (user.skills || []).join(', '),
        resumeLink: user.resumeLink || '',
        phone: user.phone || '',
        address: user.address || '',
        profilePicture: user.profilePicture || ''
      });
    }
  }, [user]);

  const fetchPdfResumes = async () => {
    try {
      const res = await axios.get('/students/my-pdf-resumes');
      setPdfResumes(res.data.resumes || []);
    } catch (error) {
      console.error('Failed to fetch PDF resumes:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Token is handled by interceptor

    const formData = new FormData();
    formData.append('pdfResume', file);

    setUploadingPdf(true);
    try {
      const uploadRes = await axios.post('/students/upload-pdf-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Resume uploaded successfully');

      // Use the returned resume data directly instead of fetching again
      if (uploadRes.data.resume) {
        setPdfResumes([uploadRes.data.resume]);
      } else {
        // Fallback: fetch again
        const res = await axios.get('/students/my-pdf-resumes');
        setPdfResumes(res.data.resumes || []);
      }
      setShowUploadModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleDeletePdfResume = async (resumeId) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      await axios.delete(`/students/pdf-resume/${resumeId}`);
      toast.success('Resume deleted successfully');
      setPdfResumes([]); // Clear locally since we only allow 1 resume
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const semesterNum = Number(form.semester);
    const cgpaNum = Number(form.cgpa);
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.department.trim()) { toast.error('Department is required'); return; }
    if (Number.isNaN(semesterNum) || semesterNum < 1 || semesterNum > 8) { toast.error('Semester must be between 1 and 8'); return; }
    if (Number.isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) { toast.error('CGPA must be between 0 and 10'); return; }
    try {
      const payload = {
        name: form.name,
        department: form.department,
        semester: semesterNum,
        cgpa: cgpaNum,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        resumeLink: form.resumeLink,
        phone: form.phone,
        address: form.address,
        profilePicture: form.profilePicture
      };
      const res = await axios.put('/students/profile', payload);
      toast.success('Profile updated');
      setUser(res.data.student || res.data);
      setEdit(false);
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[68px] pb-20 md:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Manage your personal information and academic details</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {!edit ? (
              <>
                <button
                  onClick={() => setEdit(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-200 transition-all shadow-sm text-sm sm:text-base"
                >
                  <Edit2 size={16} />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-all font-medium text-sm sm:text-base"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setEdit(false)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-all text-sm sm:text-base flex-1 sm:flex-initial"
                >
                  <XIcon size={16} />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={save}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all text-sm sm:text-base flex-1 sm:flex-initial"
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 sm:p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-20 sm:h-24 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100"></div>

              <div className="relative flex flex-col items-center text-center mt-4">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-white shadow-md">
                    <img
                      src={form.profilePicture || user.profilePicture}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-2 border-gray-100"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=random`;
                      }}
                    />
                  </div>
                  {edit && (
                    <label className="absolute bottom-0 right-0 p-1.5 sm:p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg border-2 border-white">
                      <Camera size={14} className="sm:w-4 sm:h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {edit ? (
                  <div className="mt-4 w-full space-y-3">
                    <Input
                      value={form.name}
                      onChange={(v) => setForm({ ...form, name: v })}
                      placeholder="Full Name"
                      className="text-center font-bold text-base sm:text-lg"
                    />
                    <Input
                      value={form.department}
                      onChange={(v) => setForm({ ...form, department: v })}
                      placeholder="Department"
                      className="text-center text-sm"
                    />
                  </div>
                ) : (
                  <div className="mt-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words px-2">{user.name}</h2>
                    <p className="text-blue-600 font-medium text-sm sm:text-base break-words px-2">{user.department || 'Department Not Set'}</p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1 break-all px-2">{user.email}</p>
                  </div>
                )}

                <div className="mt-6 w-full space-y-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <Phone size={16} className="sm:w-[18px] sm:h-[18px] text-blue-600" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                      {edit ? (
                        <input
                          type="text"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full bg-transparent border-b border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-blue-500 px-0 py-0.5"
                          placeholder="+1 234 567 890"
                        />
                      ) : (
                        <p className="text-gray-900 text-sm font-medium truncate">{user.phone || 'Not set'}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <MapPin size={16} className="sm:w-[18px] sm:h-[18px] text-purple-600" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Location</p>
                      {edit ? (
                        <input
                          type="text"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          className="w-full bg-transparent border-b border-gray-300 text-gray-900 text-sm focus:outline-none focus:border-blue-500 px-0 py-0.5"
                          placeholder="City, Country"
                        />
                      ) : (
                        <p className="text-gray-900 text-sm font-medium truncate">{user.address || 'Not set'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Academic Info and Skills - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Academic Info */}
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoCard
                    label="Semester"
                    value={edit ? form.semester : user.semester}
                    icon={<Calendar size={18} />}
                    edit={edit}
                    type="number"
                    onChange={(v) => setForm({ ...form, semester: v })}
                    min={1} max={8}
                  />
                  <InfoCard
                    label="CGPA"
                    value={edit ? form.cgpa : user.cgpa}
                    icon={<Award size={18} />}
                    edit={edit}
                    type="number"
                    onChange={(v) => setForm({ ...form, cgpa: v })}
                    step="0.01" min={0} max={10}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Code className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
                  Skills
                </h3>
                {edit ? (
                  <div className="h-[calc(100%-3rem)]">
                    <label className="text-sm text-gray-500 mb-2 block">Skills (comma separated)</label>
                    <textarea
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      className="w-full h-[calc(100%-2rem)] bg-white border border-gray-200 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                      placeholder="Java, Python, React, Node.js..."
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 content-start">
                    {(user.skills || []).length > 0 ? (
                      user.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm italic">No skills added yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Resume Section */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="text-orange-500 w-4 h-4 sm:w-5 sm:h-5" />
                Resume & Documents
              </h3>

              {/* Check both pdfResumes state and user.pdfResumes from backend */}
              {(pdfResumes.length > 0 || (user?.pdfResumes && user.pdfResumes.length > 0)) ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all group">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="p-2 sm:p-3 bg-red-100 rounded-lg flex-shrink-0">
                      <FileText className="text-red-500 sm:w-6 sm:h-6" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {(pdfResumes[0] || user.pdfResumes[0]).originalName || 'Resume.pdf'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded on {new Date((pdfResumes[0] || user.pdfResumes[0]).uploadedAt).toLocaleDateString()}
                        {(pdfResumes[0] || user.pdfResumes[0]).fileSize && ` • ${((pdfResumes[0] || user.pdfResumes[0]).fileSize / 1024).toFixed(1)} KB`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => setShowPdfViewer(true)}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium flex-1 sm:flex-initial"
                      title="View Resume"
                    >
                      <ExternalLink size={16} />
                      <span>View</span>
                    </button>
                    <a
                      href={(pdfResumes[0] || user.pdfResumes[0])?.filePath}
                      download={(pdfResumes[0] || user.pdfResumes[0])?.originalName || 'resume.pdf'}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium flex-1 sm:flex-initial"
                      title="Download Resume"
                    >
                      <Upload size={16} className="rotate-180" />
                      <span>Download</span>
                    </a>
                    <button
                      onClick={() => handleDeletePdfResume((pdfResumes[0] || user.pdfResumes[0])._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Delete Resume"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all gap-3 group"
                >
                  <div className="p-4 bg-gray-50 rounded-full group-hover:scale-110 transition-transform">
                    <Upload size={24} className="text-blue-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Upload Resume (PDF)</p>
                    <p className="text-xs text-gray-400 mt-1">Max file size: 10MB</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div >

      {/* Upload Modal */}
      {
        showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeIn">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Resume</h3>
              <div className="mb-6">
                <label className="block w-full cursor-pointer group">
                  <div className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all gap-3">
                    <Upload size={32} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <p className="font-medium">Click to select PDF</p>
                    <p className="text-xs text-gray-400">Max 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfUpload}
                    disabled={uploadingPdf}
                    className="hidden"
                  />
                </label>
              </div>
              {uploadingPdf && (
                <div className="mb-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploadingPdf}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* PDF Viewer Modal */}
      {
        showPdfViewer && (pdfResumes[0] || user?.pdfResumes?.[0]) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] sm:h-[95vh] shadow-2xl flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate max-w-full sm:max-w-md">
                  {(pdfResumes[0] || user.pdfResumes[0]).originalName || 'Resume.pdf'}
                </h3>
                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                  {numPages && (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                        disabled={pageNumber <= 1}
                        className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <span className="text-xs sm:text-sm text-gray-600 min-w-[60px] sm:min-w-[80px] text-center">
                        {pageNumber}/{numPages}
                      </span>
                      <button
                        onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                        disabled={pageNumber >= numPages}
                        className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setShowPdfViewer(false);
                      setPageNumber(1);
                      setNumPages(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    <XIcon size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-gray-100 flex justify-center py-4 sm:py-6 px-2 sm:px-4">
                <div className="max-h-full">
                  <Document
                    file={(pdfResumes[0] || user.pdfResumes[0]).filePath}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    onLoadError={(error) => {
                      console.error('Error loading PDF:', error);
                      toast.error('Failed to load PDF');
                    }}
                    loading={
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="shadow-lg"
                      width={Math.min(window.innerWidth * (window.innerWidth < 640 ? 0.9 : 0.7), 850)}
                    />
                  </Document>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

const InfoCard = ({ label, value, icon, edit, type = 'text', onChange, ...props }) => (
  <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors group">
    <div className="flex items-center gap-2 sm:gap-3 mb-2">
      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:text-blue-700 transition-colors flex-shrink-0">
        {icon}
      </div>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
    {edit ? (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm sm:text-base text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        {...props}
      />
    ) : (
      <p className="text-base sm:text-lg font-semibold text-gray-900 pl-1">{value !== undefined && value !== null && value !== '' ? value : '-'}</p>
    )}
  </div>
);

const Input = ({ value, onChange, placeholder, className = '' }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full bg-transparent border-b border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 px-1 py-1 placeholder-gray-400 transition-colors ${className}`}
  />
);

export default StudentProfile;
