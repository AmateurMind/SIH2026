import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, FileText, Loader2, Download, Eye, Calendar, Palette } from 'lucide-react';

const StudentResumes = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudentResumes();
    }, [id]);

    const fetchStudentResumes = async () => {
        try {
            const response = await axios.get(`/resume-management/student/${id}`);

            if (response.data.success) {
                setStudent(response.data.student);
                setResumes(response.data.resumes);
            }
        } catch (error) {
            console.error('Fetch resumes error:', error);
            toast.error('Failed to load student resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleViewResume = (resumeId) => {
        navigate(`/resume/view/${resumeId}`);
    };

    const handleDownloadPDF = (resumeId, title) => {
        // Open in new tab for printing/downloading
        window.open(`/resume/view/${resumeId}`, '_blank');
        toast.success('Opening resume in new tab. Use browser print to save as PDF.');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(`/admin/students/${id}`)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Profile
                    </button>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                    {student?.name}'s Resumes
                                </h1>
                                <p className="text-gray-600">
                                    {student?.department} • {student?.email}
                                </p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 text-center min-w-[100px]">
                                <div className="text-3xl font-bold text-purple-600">{resumes.length}</div>
                                <div className="text-xs text-gray-600">Total Resumes</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumes List */}
                {resumes.length === 0 ? (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resumes Found</h3>
                        <p className="text-gray-500">
                            This student hasn't created any resumes yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {resumes.map((resume) => (
                            <div
                                key={resume._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{resume.title}</h3>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${resume.isPublic
                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                }`}>
                                                {resume.isPublic ? 'Public' : 'Private'}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Palette size={16} className="text-blue-500" />
                                                <span className="capitalize">{resume.template} Template</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border-2 border-white shadow"
                                                    style={{ backgroundColor: resume.accentColor }}
                                                />
                                                <span>{resume.accentColor}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-green-500" />
                                                <span>
                                                    Modified {new Date(resume.lastModified).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                v{resume.version}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleViewResume(resume._id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        <Eye size={18} />
                                        View Resume
                                    </button>
                                    <button
                                        onClick={() => handleDownloadPDF(resume._id, resume.title)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                    >
                                        <Download size={18} />
                                        Download PDF
                                    </button>
                                </div>

                                {/* Metadata */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span>Created {new Date(resume.createdAt).toLocaleDateString()}</span>
                                    {resume.isPublic && (
                                        <span className="text-green-600 font-medium">
                                            ✓ Publicly accessible
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentResumes;
