import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, Building2, MapPin, DollarSign, Calendar, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminInternships = () => {
    const navigate = useNavigate();
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('submitted'); // submitted, active, rejected

    useEffect(() => {
        fetchInternships();
    }, [filter]);

    const fetchInternships = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/internships?status=${filter}`);
            setInternships(response.data.internships);
        } catch (error) {
            console.error('Fetch internships error:', error);
            toast.error('Failed to fetch internships');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axios.put(`/internships/${id}/approve`);
            toast.success('Internship approved successfully');
            fetchInternships();
        } catch (error) {
            console.error('Approve error:', error);
            toast.error('Failed to approve internship');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Please enter a reason for rejection:');
        if (!reason) return;

        try {
            await axios.put(`/internships/${id}/reject`, { rejectionReason: reason });
            toast.success('Internship rejected');
            fetchInternships();
        } catch (error) {
            console.error('Reject error:', error);
            toast.error('Failed to reject internship');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Internship Management</h1>
                        <p className="text-slate-500 text-sm">Review and manage job postings</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 w-fit">
                    {['submitted', 'active', 'rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'submitted' ? 'Pending' : f})
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto"></div>
                            <p className="text-slate-500 mt-2">Loading internships...</p>
                        </div>
                    ) : internships.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                            <BriefcaseOff className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-slate-900">No {filter} internships found</h3>
                            <p className="text-slate-500">There are no internships to show in this category.</p>
                        </div>
                    ) : (
                        internships.map((internship) => (
                            <div key={internship.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row gap-6 justify-between">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-slate-900">{internship.title}</h3>
                                                    {internship.status === 'submitted' && (
                                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-100 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> Pending Review
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                    <Building2 className="w-4 h-4" />
                                                    {internship.company}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" />
                                                {internship.location} ({internship.workMode})
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <DollarSign className="w-4 h-4" />
                                                {internship.stipend}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                {internship.duration}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {internship.requiredSkills.map((skill, index) => (
                                                <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-row md:flex-col gap-3 justify-center md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[160px]">
                                        {filter === 'submitted' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(internship.id)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium w-full"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(internship.id)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 rounded-lg transition-colors text-sm font-medium w-full"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {/* View Details button placeholder - could open modal */}
                                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium w-full">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// Missing Icon Component
const BriefcaseOff = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <rect width="20" height="14" x="2" y="6" rx="2" />
        <path d="m2 6 20 14" />
        <path d="m22 6-20 14" />
    </svg>
);

// Import additional icons that might be missing
import { CheckCircle2, XCircle as XCircleIcon } from 'lucide-react';

export default AdminInternships;
