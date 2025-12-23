import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Filter, CheckCircle, Loader2, FileText, Building, Calendar, XCircle, PlayCircle } from 'lucide-react';

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        filterApplications();
    }, [searchQuery, statusFilter, applications]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/applications');
            if (response.data && response.data.applications) {
                setApplications(response.data.applications);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const filterApplications = () => {
        let result = [...applications];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(app =>
                app.student?.name?.toLowerCase().includes(query) ||
                app.internship?.title?.toLowerCase().includes(query) ||
                app.internship?.company?.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(app => app.status === statusFilter);
        }

        // Sort by most recent
        result.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

        setFilteredApplications(result);
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        if (!confirm(`Are you sure you want to mark this application as ${newStatus}?`)) {
            return;
        }

        try {
            const response = await axios.put(`/applications/${applicationId}/status`, {
                status: newStatus
            });

            if (response.data && response.data.application) {
                toast.success(`Application marked as ${newStatus}`);
                // Update local state
                setApplications(prev => prev.map(app =>
                    app.id === applicationId ? { ...app, status: newStatus } : app
                ));
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'hired':
            case 'ongoing':
            case 'accepted': return 'bg-blue-100 text-blue-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'pending_mentor_approval': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FileText className="text-blue-600" size={32} />
                        Internship Applications
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage student internship applications and track their progress
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by student, role, or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter size={20} className="text-gray-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending_mentor_approval">Pending Mentor</option>
                                <option value="applied">Applied</option>
                                <option value="hired">Hired</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Student</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Internship</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Applied Date</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredApplications.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No applications found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredApplications.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                        {app.student?.name?.charAt(0) || 'S'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{app.student?.name || 'Unknown Student'}</div>
                                                        <div className="text-sm text-gray-500">{app.student?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{app.internship?.title || 'Unknown Role'}</div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Building size={14} />
                                                        {app.internship?.company || 'Unknown Company'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Calendar size={16} />
                                                    {formatDate(app.appliedAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusBadgeColor(app.status)}`}>
                                                    {app.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Offer / Reject actions for new applications */}
                                                    {(app.status === 'applied' || app.status === 'pending_mentor_approval') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(app.id, 'offered')}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                                                                title="Offer"
                                                            >
                                                                <CheckCircle size={14} /> Offer
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                                                                title="Reject"
                                                            >
                                                                <XCircle size={14} /> Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Complete action for active internships */}
                                                    {['offered', 'hired', 'ongoing', 'accepted', 'approved'].includes(app.status) && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'completed')}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                                                            title="Mark as Completed"
                                                        >
                                                            <CheckCircle size={14} /> Complete
                                                        </button>
                                                    )}

                                                    {/* Status badges for terminal states */}
                                                    {app.status === 'completed' && (
                                                        <span className="text-green-600 flex items-center justify-end gap-1 font-medium text-sm">
                                                            <CheckCircle size={16} /> Completed
                                                        </span>
                                                    )}
                                                    {app.status === 'rejected' && (
                                                        <span className="text-red-600 flex items-center justify-end gap-1 font-medium text-sm">
                                                            <XCircle size={16} /> Rejected
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminApplications;
