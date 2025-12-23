import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Plus, FileText, MoreVertical, Trash2, Edit,
    Eye, Copy, Calendar, Clock, Loader2
} from 'lucide-react';

const Dashboard = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const response = await axios.get('/resume-management/list');
            if (response.data.success) {
                setResumes(response.data.resumes);
            }
        } catch (error) {
            console.error('Error fetching resumes:', error);
            toast.error('Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateResume = () => {
        navigate('/student/resume/create');
    };

    const handleEditResume = (id) => {
        navigate(`/student/resume/edit/${id}`);
    };

    const handleDeleteResume = async (id) => {
        try {
            await axios.delete(`/resume-management/delete/${id}`);
            setResumes(resumes.filter(r => r._id !== id));
            toast.success('Resume deleted successfully');
            setShowDeleteModal(null);
        } catch (error) {
            console.error('Error deleting resume:', error);
            toast.error('Failed to delete resume');
        }
    };

    const copyPublicLink = (id) => {
        const url = `${window.location.origin}/resume/view/${id}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
                        <p className="text-gray-500 mt-1">Manage and organize your professional resumes</p>
                    </div>
                    <button
                        onClick={handleCreateResume}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        Create New Resume
                    </button>
                </div>

                {resumes.length === 0 ? (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Create your first professional resume with our AI-powered builder. Choose from multiple templates and customize to your needs.
                        </p>
                        <button
                            onClick={handleCreateResume}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Start Building
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map((resume) => (
                            <div key={resume._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                                {/* Preview Area (Placeholder) */}
                                <div
                                    className="h-48 bg-gray-100 rounded-t-xl border-b border-gray-100 relative overflow-hidden cursor-pointer"
                                    onClick={() => handleEditResume(resume._id)}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 group-hover:scale-105 transition-transform duration-500">
                                        <FileText size={48} />
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

                                    {/* Status Badge */}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${resume.isPublic
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                                            }`}>
                                            {resume.isPublic ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3
                                            className="font-semibold text-gray-900 truncate flex-1 cursor-pointer hover:text-blue-600"
                                            onClick={() => handleEditResume(resume._id)}
                                        >
                                            {resume.title || 'Untitled Resume'}
                                        </h3>
                                        <div className="relative ml-2">
                                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            <span>{new Date(resume.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            <span>{new Date(resume.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleEditResume(resume._id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                                        >
                                            <Edit size={14} /> Edit
                                        </button>

                                        {resume.isPublic && (
                                            <button
                                                onClick={() => copyPublicLink(resume._id)}
                                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Copy Public Link"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setShowDeleteModal(resume._id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Resume"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl animate-fadeIn">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Resume?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this resume? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteResume(showDeleteModal)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
