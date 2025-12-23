import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Search,
    Filter,
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
    FileText,
    Building,
    User,
    Send,
    Copy,
    X,
    TrendingUp,
    ClipboardCheck
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import toast from 'react-hot-toast';
import axios from 'axios';

const IPPReviewDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ipps, setIpps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedIPP, setSelectedIPP] = useState(null);
    const [magicLink, setMagicLink] = useState('');
    const [mentorForm, setMentorForm] = useState({ mentorName: '', mentorEmail: '' });
    const [sendingRequest, setSendingRequest] = useState(false);
    const [expandedIppId, setExpandedIppId] = useState(null);

    useEffect(() => {
        fetchIPPs();
        const interval = setInterval(fetchIPPs, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchIPPs = async () => {
        try {
            const response = await axios.get('/ipp');
            if (response.data.success) {
                setIpps(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching IPPs:', error);
            toast.error('Failed to load IPPs');
        } finally {
            setLoading(false);
        }
    };

    const handleSendEvaluation = (ipp) => {
        setSelectedIPP(ipp);
        setShowModal(true);
        setMagicLink('');
        const companyMentor = ipp.companyMentorEvaluation || {};
        setMentorForm({
            mentorName: companyMentor.mentorName || 'Rajesh Kumar',
            mentorEmail: companyMentor.mentorEmail || 'rajesh.kumar@college.edu'
        });
    };

    const handleSubmitEvaluationRequest = async (e) => {
        e.preventDefault();
        setSendingRequest(true);

        try {
            const response = await axios.post(`/ipp/${selectedIPP.ippId}/send-evaluation-request`, {
                mentorName: mentorForm.mentorName,
                mentorEmail: mentorForm.mentorEmail
            });

            setMagicLink(response.data.magicLink);
            toast.success('Magic link generated successfully!');
        } catch (error) {
            console.error('Error sending evaluation request:', error);
            toast.error(error.response?.data?.error || 'Failed to generate magic link');
        } finally {
            setSendingRequest(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(magicLink);
        toast.success('Magic link copied to clipboard!');
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedIPP(null);
        setMagicLink('');
        setMentorForm({ mentorName: '', mentorEmail: '' });
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-800 border-gray-200',
            pending_mentor_eval: 'bg-amber-100 text-amber-800 border-amber-200',
            pending_student_submission: 'bg-sky-100 text-sky-800 border-sky-200',
            pending_faculty_approval: 'bg-purple-100 text-purple-800 border-purple-200',
            verified: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            published: 'bg-blue-100 text-blue-800 border-blue-200',
            rejected: 'bg-red-100 text-red-800 border-red-200'
        };

        const labels = {
            draft: 'Draft',
            pending_mentor_eval: 'Awaiting Mentor',
            pending_student_submission: 'Awaiting Student',
            pending_faculty_approval: 'Needs Review',
            verified: 'Verified',
            published: 'Published',
            rejected: 'Rejected'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold border whitespace-nowrap ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {labels[status] || status.replace(/_/g, ' ')}
            </span>
        );
    };

    const filteredIPPs = ipps.filter(ipp => {
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'pending' && ipp.status === 'pending_faculty_approval') ||
            (filterStatus === 'verified' && (ipp.status === 'verified' || ipp.status === 'published')) ||
            ipp.status === filterStatus;

        const matchesSearch =
            ipp.studentDetails?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ipp.internshipDetails?.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ipp.ippId?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const pendingCount = ipps.filter(ipp => ipp.status === 'pending_faculty_approval').length;
    const verifiedCount = ipps.filter(ipp => ipp.status === 'verified' || ipp.status === 'published').length;
    const totalCount = ipps.length;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-gray-500 text-lg">Loading IPP Reviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-2 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 px-2 sm:px-0">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
                                IPP Reviews
                            </h1>
                            <p className="text-gray-500 text-sm sm:text-lg">
                                Manage and approve internship passports
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Total</p>
                                <p className="text-2xl sm:text-4xl font-bold text-gray-900">{totalCount}</p>
                            </div>
                            <div className="bg-blue-50 p-3 sm:p-4 rounded-xl">
                                <ClipboardCheck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Pending</p>
                                <p className="text-2xl sm:text-4xl font-bold text-gray-900">{pendingCount}</p>
                            </div>
                            <div className="bg-purple-50 p-3 sm:p-4 rounded-xl">
                                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                            </div>
                        </div>

                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Verified</p>
                                <p className="text-2xl sm:text-4xl font-bold text-gray-900">{verifiedCount}</p>
                            </div>
                            <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl">
                                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Filters Bar */}
                    <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50">
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            {/* Search */}
                            <div className="relative w-full lg:w-96">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search..."
                                    className="pl-10 h-10 sm:h-12 text-sm bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                                <Button
                                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterStatus('all')}
                                    className={`flex-1 sm:flex-none ${filterStatus === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border-gray-200'}`}
                                >
                                    All
                                </Button>
                                <Button
                                    variant={filterStatus === 'pending' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterStatus('pending')}
                                    className={`flex-1 sm:flex-none ${filterStatus === 'pending' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border-gray-200'}`}
                                >
                                    Pending
                                </Button>
                                <Button
                                    variant={filterStatus === 'verified' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterStatus('verified')}
                                    className={`flex-1 sm:flex-none ${filterStatus === 'verified' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 border-gray-200'}`}
                                >
                                    Verified
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Responsive Table */}
                    <div className="w-full">
                        <table className="w-full table-fixed divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {/* ID: Small width */}
                                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-20 hidden sm:table-cell">
                                        IPP ID
                                    </th>

                                    {/* Student: Flexible width */}
                                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-auto">
                                        Student
                                    </th>

                                    {/* Internship: Hidden on mobile */}
                                    <th className="hidden md:table-cell px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">
                                        Internship
                                    </th>

                                    {/* Status: Fixed width */}
                                    <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-28 sm:w-36">
                                        Status
                                    </th>

                                    {/* Last Updated: Hidden on tablet/laptop */}
                                    <th className="hidden xl:table-cell px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">
                                        Updated
                                    </th>

                                    {/* Actions: Fixed width, right aligned */}
                                    <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-28 sm:w-40">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredIPPs.length > 0 ? (
                                    filteredIPPs.map((ipp) => (
                                        <tr key={ipp.ippId} className="hover:bg-gray-50">
                                            {/* ID Column */}
                                            <td className="px-3 py-3 align-middle hidden sm:table-cell">
                                                <div
                                                    className={`text-xs font-bold text-blue-600 cursor-pointer ${expandedIppId === ipp.ippId ? 'break-all' : 'truncate'}`}
                                                    title={ipp.ippId}
                                                    onClick={() => setExpandedIppId(expandedIppId === ipp.ippId ? null : ipp.ippId)}
                                                >
                                                    {ipp.ippId}
                                                </div>
                                            </td>

                                            {/* Student Column */}
                                            <td className="px-3 py-3 align-middle">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="h-8 w-8 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center hidden sm:flex">
                                                        <User className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-sm font-semibold text-gray-900 truncate" title={ipp.studentDetails?.name}>
                                                            {ipp.studentDetails?.name || 'Unknown'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate sm:hidden">
                                                            {ipp.ippId}
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate hidden sm:block">
                                                            {ipp.studentId}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Internship Column */}
                                            <td className="hidden md:table-cell px-3 py-3 align-middle">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                        {ipp.internshipDetails?.company}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {ipp.internshipDetails?.role}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status Column */}
                                            <td className="px-3 py-3 align-middle">
                                                {getStatusBadge(ipp.status)}
                                            </td>

                                            {/* Date Column */}
                                            <td className="hidden xl:table-cell px-3 py-3 align-middle">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(ipp.updatedAt).toLocaleDateString()}
                                                </div>
                                            </td>

                                            {/* Actions Column */}
                                            <td className="px-3 py-3 align-middle text-right">
                                                <div className="flex justify-end gap-1 sm:gap-2">
                                                    {ipp.status === 'pending_mentor_eval' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-blue-600 border-blue-200 hover:bg-blue-50 h-8 px-2"
                                                            onClick={() => handleSendEvaluation(ipp)}
                                                        >
                                                            <Send className="h-3.5 w-3.5 sm:mr-1.5" />
                                                            <span className="hidden sm:inline">Send</span>
                                                        </Button>
                                                    )}
                                                    {(ipp.status === 'verified' || ipp.status === 'published') && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-amber-500 hover:bg-amber-600 text-white border-none h-8 px-2"
                                                            onClick={() => {
                                                                const basePath = user?.role === 'recruiter' ? '/recruiter' : '/admin';
                                                                navigate(`${basePath}/ipp/${ipp.ippId}/passport`);
                                                            }}
                                                        >
                                                            <TrendingUp className="h-3.5 w-3.5 sm:mr-1.5" />
                                                            <span className="hidden sm:inline">Badge</span>
                                                        </Button>
                                                    )}
                                                    {ipp.status === 'pending_faculty_approval' && user?.role === 'admin' ? (
                                                        <Button
                                                            size="sm"
                                                            className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-2"
                                                            onClick={() => navigate(`/admin/ipp/${ipp.ippId}/review`)}
                                                        >
                                                            Review
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/admin/ipp/${ipp.ippId}/review`)}
                                                            className="text-gray-600 hover:bg-gray-100 h-8 px-2"
                                                        >
                                                            <Eye className="h-4 w-4 sm:mr-1.5" />
                                                            <span className="hidden sm:inline">View</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                            <p className="text-gray-900 text-base font-medium mb-1">
                                                No IPPs found
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Send Evaluation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-xl border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 bg-gray-50/50">
                            <div>
                                <CardTitle className="text-xl sm:text-2xl text-gray-900">
                                    Send Evaluation Request
                                </CardTitle>
                                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                                    IPP ID: <span className="font-mono text-blue-600 font-medium">{selectedIPP?.ippId}</span>
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={closeModal} className="text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                                <X className="h-6 w-6" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {!magicLink ? (
                                <form onSubmit={handleSubmitEvaluationRequest} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="mentorName" className="text-base font-semibold text-gray-900">
                                            Mentor Name *
                                        </Label>
                                        <Input
                                            id="mentorName"
                                            value={mentorForm.mentorName}
                                            onChange={(e) => setMentorForm({ ...mentorForm, mentorName: e.target.value })}
                                            placeholder="e.g. John Smith"
                                            className="h-12 text-base bg-white border-gray-200 text-gray-900 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="mentorEmail" className="text-base font-semibold text-gray-900">
                                            Mentor Email *
                                        </Label>
                                        <Input
                                            id="mentorEmail"
                                            type="email"
                                            value={mentorForm.mentorEmail}
                                            onChange={(e) => setMentorForm({ ...mentorForm, mentorEmail: e.target.value })}
                                            placeholder="john.smith@company.com"
                                            className="h-12 text-base bg-white border-gray-200 text-gray-900 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                        <p className="text-sm text-blue-700">
                                            <strong>Note:</strong> This will generate a magic link valid for 7 days.
                                            The mentor can use this link to submit their evaluation without creating an account.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={closeModal}
                                            className="flex-1 h-12 text-base border-gray-200 text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={sendingRequest}
                                            className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                        >
                                            {sendingRequest ? 'Generating...' : 'Generate Magic Link'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                        <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-600" />
                                        <span className="font-semibold text-base">Magic link generated successfully!</span>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold text-gray-900">Magic Link (Valid for 7 days)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={magicLink}
                                                readOnly
                                                className="font-mono text-sm h-12 bg-gray-50 border-gray-200 text-gray-600"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={copyToClipboard}
                                                className="h-12 px-4 border-gray-200 hover:bg-gray-50 text-gray-700"
                                            >
                                                <Copy className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Share this link with the company mentor to complete their evaluation.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => window.open(magicLink, '_blank')}
                                            className="flex-1 h-12 text-base border-gray-200 text-gray-700 hover:bg-gray-50"
                                        >
                                            Open Link
                                        </Button>
                                        <Button
                                            onClick={closeModal}
                                            className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                        >
                                            Done
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default IPPReviewDashboard;