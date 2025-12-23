import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Mail, Phone, MapPin, Calendar, Award,
    FileText, Loader2, User, GraduationCap, Briefcase, BadgeCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [student, setStudent] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [pdfResumes, setPdfResumes] = useState([]);
    const [ipps, setIpps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudentProfile();
        fetchStudentResumes();
        fetchPdfResumes();
        fetchStudentIPPs();
    }, [id]);

    const fetchStudentProfile = async () => {
        try {
            const response = await axios.get(`/students/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setStudent(response.data.student || response.data);
        } catch (error) {
            console.error('Fetch student error:', error);
            toast.error('Failed to load student profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentResumes = async () => {
        try {
            const response = await axios.get(`/resume-management/student/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.data.success) {
                setResumes(response.data.resumes);
            }
        } catch (error) {
            console.error('Fetch resumes error:', error);
        }
    };

    const fetchPdfResumes = async () => {
        try {
            const response = await axios.get(`/students/${id}/pdf-resumes`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPdfResumes(response.data.resumes || []);
        } catch (error) {
            console.error('Fetch PDF resumes error:', error);
        }
    };

    const fetchStudentIPPs = async () => {
        try {
            const response = await axios.get(`/ipp/student/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const verifiedIPPs = (response.data.data || []).filter(
                ipp => ipp.status === 'verified' || ipp.status === 'published'
            );
            setIpps(verifiedIPPs);
        } catch (error) {
            console.error('Fetch IPPs error:', error);
        }
    };

    const handleViewResume = (resumeId) => {
        navigate(`/resume/view/${resumeId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Student Not Found</h2>
                    <button
                        onClick={() => navigate('/admin/students')}
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                        ← Back to Directory
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-blue-500 selection:text-white pb-20">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-[120px] pointer-events-none" />
            <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 pt-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/admin/students')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-sm mb-6 font-medium text-sm hover:shadow-md"
                >
                    <ArrowLeft size={16} />
                    Back to Directory
                </button>

                {/* Profile Header - Compact */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 mb-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-center md:items-start md:gap-6 relative z-10">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0 mb-4 md:mb-0">
                            {student.profilePicture ? (
                                <img
                                    src={student.profilePicture}
                                    alt={student.name}
                                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-xl shadow-slate-200"
                                />
                            ) : (
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-xl shadow-slate-200">
                                    <span className="text-3xl font-bold text-slate-300">
                                        {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">{student.name}</h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                                    <GraduationCap size={14} />
                                    {student.department}
                                </span>
                                {student.year && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                                        <Calendar size={14} />
                                        {student.year}
                                    </span>
                                )}
                            </div>

                            {/* Contact Info */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-slate-500 font-medium">
                                {student.email && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-1 bg-slate-100 rounded-full text-slate-500"><Mail size={12} /></div>
                                        <a href={`mailto:${student.email}`} className="hover:text-blue-600 transition-colors">
                                            {student.email}
                                        </a>
                                    </div>
                                )}
                                {student.phone && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-1 bg-slate-100 rounded-full text-slate-500"><Phone size={12} /></div>
                                        <a href={`tel:${student.phone}`} className="hover:text-blue-600 transition-colors">
                                            {student.phone}
                                        </a>
                                    </div>
                                )}
                                {student.address && (
                                    <div className="flex items-center gap-1.5">
                                        <div className="p-1 bg-slate-100 rounded-full text-slate-500"><MapPin size={12} /></div>
                                        <span>{student.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats - Compact */}
                        <div className="flex gap-3 mt-4 md:mt-0">
                            <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-3 text-center min-w-[80px] hover:shadow-md transition-shadow">
                                <div className="text-xl font-bold text-blue-600">{student.cgpa || 'N/A'}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CGPA</div>
                            </div>
                            <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-3 text-center min-w-[80px] hover:shadow-md transition-shadow">
                                <div className="text-xl font-bold text-purple-600">{resumes.length}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resumes</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN (Skills & PDF) - 4 Cols */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Skills Section */}
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 p-6 h-fit">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Award size={18} className="text-blue-600" />
                                Skills & Expertise
                            </h2>
                            {student.skills && student.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {student.skills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-full font-semibold text-xs shadow-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm italic">No skills added yet.</p>
                            )}
                        </div>

                        {/* PDF Resume Section - Compact */}
                        {pdfResumes.length > 0 && (
                            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <FileText size={18} className="text-blue-600" />
                                    PDF Resume
                                </h2>
                                <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:shadow-md transition-all bg-white">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <FileText size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-900 truncate text-sm">{pdfResumes[0].originalName}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {(pdfResumes[0].fileSize / 1024).toFixed(0)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={pdfResumes[0].filePath}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-bold"
                                    >
                                        View
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN (Passports & Resumes) - 8 Cols */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* IPP Passports Section */}
                        {ipps.length > 0 && (
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 backdrop-blur-md rounded-3xl shadow-sm border border-amber-100 p-6">
                                <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                                    <BadgeCheck size={18} className="text-amber-600" />
                                    Internship Passports ({ipps.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {ipps.map((ipp) => (
                                        <div
                                            key={ipp.ippId}
                                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 hover:shadow-lg hover:border-amber-200 transition-all cursor-pointer group"
                                            onClick={() => {
                                                const basePath = user?.role === 'recruiter' ? '/recruiter' : '/admin';
                                                navigate(`${basePath}/ipp/${ipp.ippId}/passport`);
                                            }}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">{ipp.internshipDetails?.role}</h3>
                                                    <p className="text-xs font-medium text-slate-500">{ipp.internshipDetails?.company}</p>
                                                </div>
                                                <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-md text-[10px] font-bold shadow-sm">
                                                    Grade {ipp.summary?.performanceGrade || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-50">
                                                <span className="text-slate-400 font-medium">
                                                    {new Date(ipp.internshipDetails?.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-amber-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                    Open Passport →
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resumes Section */}
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <FileText size={18} className="text-purple-600" />
                                    Resumes ({resumes.length})
                                </h2>
                                {resumes.length > 0 && (
                                    <button
                                        onClick={() => navigate(`/admin/students/${id}/resumes`)}
                                        className="text-blue-600 hover:text-blue-700 text-xs font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
                                    >
                                        View All
                                    </button>
                                )}
                            </div>

                            {resumes.length === 0 ? (
                                <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-sm font-medium">No resumes created yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {resumes.slice(0, 4).map((resume) => (
                                        <div
                                            key={resume._id}
                                            className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group"
                                            onClick={() => handleViewResume(resume._id)}
                                        >
                                            <div className="flex items-start justify-between mb-1.5">
                                                <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">{resume.title}</h3>
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${resume.isPublic
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                    }`}>
                                                    {resume.isPublic ? 'Public' : 'Private'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                                <span className="capitalize px-1.5 py-0.5 bg-slate-50 rounded-md border border-slate-100">{resume.template} Template</span>
                                                <span>•</span>
                                                <span>{new Date(resume.lastModified).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
