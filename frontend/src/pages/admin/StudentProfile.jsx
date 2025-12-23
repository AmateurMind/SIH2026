import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Mail, Phone, MapPin, Calendar, Award,
    FileText, Loader2, User, GraduationCap, Briefcase, ExternalLink, Download, ChevronLeft, ChevronRight, X as XIcon
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [resumes, setResumes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showPdfViewer, setShowPdfViewer] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        fetchStudentProfile();
        fetchStudentResumes();
    }, [id]);

    const fetchStudentProfile = async () => {
        try {
            const response = await axios.get(`/students/${id}`);
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
            const response = await axios.get(`/resume-management/student/${id}`);
            if (response.data.success) {
                setResumes(response.data.resumes);
            }
        } catch (error) {
            console.error('Fetch resumes error:', error);
        }
    };

    const handleViewResume = (resumeId) => {
        navigate(`/resume/view/${resumeId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h2>
                    <button
                        onClick={() => navigate('/admin/students')}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        ← Back to Directory
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/admin/students')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Directory
                </button>

                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
                    <div className="flex items-start gap-6">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            {student.profilePicture ? (
                                <img
                                    src={student.profilePicture}
                                    alt={student.name}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-gray-100">
                                    <User className="w-16 h-16 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{student.name}</h1>
                            <div className="flex items-center gap-4 text-gray-600 mb-4">
                                <div className="flex items-center gap-2">
                                    <GraduationCap size={18} className="text-blue-600" />
                                    <span>{student.department}</span>
                                </div>
                                {student.year && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} className="text-green-600" />
                                        <span>{student.year}</span>
                                    </div>
                                )}
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2">
                                {student.email && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Mail size={16} className="text-blue-500" />
                                        <a href={`mailto:${student.email}`} className="hover:text-blue-600">
                                            {student.email}
                                        </a>
                                    </div>
                                )}
                                {student.phone && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Phone size={16} className="text-green-500" />
                                        <a href={`tel:${student.phone}`} className="hover:text-green-600">
                                            {student.phone}
                                        </a>
                                    </div>
                                )}
                                {student.address && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <MapPin size={16} className="text-red-500" />
                                        <span>{student.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-col gap-3">
                            <div className="bg-blue-50 rounded-lg p-4 text-center min-w-[120px]">
                                <div className="text-2xl font-bold text-blue-600">{student.cgpa || 'N/A'}</div>
                                <div className="text-xs text-gray-600">CGPA</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 text-center min-w-[120px]">
                                <div className="text-2xl font-bold text-purple-600">{resumes.length}</div>
                                <div className="text-xs text-gray-600">Resumes</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                {student.skills && student.skills.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Award size={24} className="text-blue-600" />
                            Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {student.skills.map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium text-sm"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Resumes Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FileText size={24} className="text-purple-600" />
                            Resumes ({resumes.length + (student.pdfResumes?.length || 0)})
                        </h2>
                        {resumes.length > 0 && (
                            <button
                                onClick={() => navigate(`/admin/students/${id}/resumes`)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                View All →
                            </button>
                        )}
                    </div>

                    {(resumes.length === 0 && (!student.pdfResumes || student.pdfResumes.length === 0)) ? (
                        <div className="text-center py-8 text-gray-500">
                            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                            <p>No resumes created yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Uploaded PDF Resumes */}
                            {student.pdfResumes?.map((pdf) => (
                                <div
                                    key={pdf._id || pdf.filename}
                                    className="border border-blue-100 bg-blue-50/30 rounded-lg p-4 hover:shadow-md transition-shadow relative group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText size={18} className="text-red-500 flex-shrink-0" />
                                            <h3 className="font-semibold text-gray-900 truncate" title={pdf.originalName || 'Resume.pdf'}>
                                                {pdf.originalName || 'Uploaded Resume.pdf'}
                                            </h3>
                                        </div>
                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 whitespace-nowrap flex-shrink-0">
                                            PDF
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 pl-1">
                                        <span>{pdf.fileSize ? (pdf.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown Size'}</span>
                                        <span>•</span>
                                        <span>{new Date(pdf.uploadedAt).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPdf(pdf);
                                                setShowPdfViewer(true);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                                        >
                                            <ExternalLink size={14} />
                                            View
                                        </button>
                                        <a
                                            href={pdf.filePath}
                                            download={pdf.originalName}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium shadow-sm"
                                        >
                                            <Download size={14} />
                                            Download
                                        </a>
                                    </div>
                                </div>
                            ))}

                            {/* Generated Resumes */}
                            {resumes.slice(0, 4).map((resume) => (
                                <div
                                    key={resume._id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleViewResume(resume._id)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-gray-900">{resume.title}</h3>
                                        <span className={`px-2 py-1 text-xs rounded-full ${resume.isPublic
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {resume.isPublic ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="capitalize">{resume.template} Template</span>
                                        <span>•</span>
                                        <span>Modified {new Date(resume.lastModified).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* PDF Viewer Modal */}
            {showPdfViewer && selectedPdf && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
                            <h3 className="text-lg font-bold text-gray-900 truncate max-w-md">
                                {selectedPdf.originalName || 'Resume.pdf'}
                            </h3>
                            <div className="flex items-center gap-4">
                                {numPages && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                                            disabled={pageNumber <= 1}
                                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <span className="text-sm text-gray-600 min-w-[80px] text-center">
                                            Page {pageNumber} of {numPages}
                                        </span>
                                        <button
                                            onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                                            disabled={pageNumber >= numPages}
                                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        setShowPdfViewer(false);
                                        setPageNumber(1);
                                        setNumPages(null);
                                        setSelectedPdf(null);
                                    }}
                                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XIcon size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-gray-100 flex justify-center py-6">
                            <div className="max-h-full">
                                <Document
                                    file={selectedPdf.filePath}
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
                                        width={Math.min(window.innerWidth * 0.7, 850)}
                                    />
                                </Document>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfile;
