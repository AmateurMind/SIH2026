import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, CheckCircle, XCircle, Search, Filter, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const RecruiterApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [myInternshipIds, setMyInternshipIds] = useState(new Set());

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Get my internships to know which applications are relevant
                const internshipsRes = await axios.get('/internships/my-postings');
                const myInternships = Array.isArray(internshipsRes.data) ? internshipsRes.data : (internshipsRes.data.internships || []);
                const ids = new Set(myInternships.map(i => i.id));
                setMyInternshipIds(ids);

                // 2. Get all applications
                const appsRes = await axios.get('/applications');
                const allApps = appsRes.data.applications || [];

                // 3. Filter client-side
                const relevantApps = allApps.filter(app => ids.has(app.internshipId));
                setApplications(relevantApps);

            } catch (error) {
                console.error("Error fetching data:", error);
                // Don't show error toast on initial load if just empty, could be permissions or empty data
                // toast.error("Failed to load applications"); 
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleStatusUpdate = async (appId, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this application as ${newStatus}?`)) return;

        try {
            await axios.put(`/applications/${appId}/status`, { status: newStatus });

            // Update local state
            setApplications(prev => prev.map(app =>
                app.id === appId ? { ...app, status: newStatus } : app
            ));

            toast.success(`Application marked as ${newStatus}`);
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update status");
        }
    };

    // Filter by search
    const filteredApps = applications.filter(app =>
        app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.internship?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Applications</h1>
                    <p className="text-gray-600 mt-1">Review and manage student applications for your job postings.</p>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by student or job title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
                    </div>
                ) : filteredApps.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Student</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Job Title</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Applied Date</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredApps.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{app.student?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{app.student?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{app.internship?.title}</td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">
                                                {new Date(app.appliedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                                    ${app.status === 'offered' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-50 text-blue-700'}`}>
                                                    {app.status ? app.status.replace(/_/g, ' ').toUpperCase() : 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(app.id, 'offered')}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium"
                                                        title="Offer"
                                                    >
                                                        <CheckCircle size={14} /> Offer
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterApplications;
