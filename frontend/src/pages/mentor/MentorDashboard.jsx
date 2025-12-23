import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Users, FileText, CheckCircle, Clock, AlertCircle, Calendar, Eye, X as XIcon, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MentorDashboard = () => {
    const { user } = useAuth();
    const [pendingApps, setPendingApps] = useState([]);
    const [historyApps, setHistoryApps] = useState([]);
    const [loadingApps, setLoadingApps] = useState(true);

    // PDF Viewer State
    const [showPdfViewer, setShowPdfViewer] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                // Fetch ALL applications for this mentor (filtered by backend based on role)
                const res = await axios.get('/applications');
                if (res.data && res.data.applications) {
                    const allApps = res.data.applications;

                    const pending = allApps.filter(app => app.status === 'pending_mentor_approval');
                    // Filter for history: approved, reject, or other statuses that imply mentor action happened
                    // We exclude 'applied' if mentor hasn't acted, but usually 'pending_mentor_approval' is the start state for mentor.
                    const history = allApps.filter(app => app.status !== 'pending_mentor_approval' && app.status !== 'applied');

                    setPendingApps(pending);
                    setHistoryApps(history);
                }
            } catch (err) {
                console.error('Error fetching applications:', err);
                // Fallback attempt if /applications fails (though standard generic route should work)
                try {
                    const resPending = await axios.get('/applications/pending/mentor');
                    if (resPending.data) setPendingApps(resPending.data.applications || []);
                } catch (e) { }
            } finally {
                setLoadingApps(false);
            }
        };

        fetchApps();
    }, []);

    const handleApprove = async (appId) => {
        if (!window.confirm('Are you sure you want to approve this application?')) return;
        try {
            await axios.put(`/applications/${appId}/status`, { status: 'approved' });
            // Move from pending to history locally
            const approvedApp = pendingApps.find(app => app.id === appId);
            if (approvedApp) {
                setPendingApps(prev => prev.filter(app => app.id !== appId));
                setHistoryApps(prev => [{ ...approvedApp, status: 'approved' }, ...prev]);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to approve application');
        }
    };

    const handleReject = async (appId) => {
        const feedback = window.prompt('Please provide a reason for rejection:');
        if (feedback === null) return; // Cancelled

        try {
            await axios.put(`/applications/${appId}/status`, { status: 'rejected', feedback });
            // Move from pending to history locally
            const rejectedApp = pendingApps.find(app => app.id === appId);
            if (rejectedApp) {
                setPendingApps(prev => prev.filter(app => app.id !== appId));
                setHistoryApps(prev => [{ ...rejectedApp, status: 'rejected', mentorFeedback: feedback }, ...prev]);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to reject application');
        }
    };

    // Hardcoded stats for demo
    const stats = [
        { label: 'Assigned Students', value: '42', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Approvals', value: pendingApps.length.toString(), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Evaluations Completed', value: '156', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Flagged Reports', value: '3', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6 pb-24 md:pb-6">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back, Professor {user?.name}</p>
                    </div>
                    {/* <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200">
                        Academic Year 2025-2026
                    </div> */}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-2 sm:mb-4">
                                <div className={`${stat.bg} p-2 sm:p-3 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`${stat.color} w-4 h-4 sm:w-6 sm:h-6`} />
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">{stat.value}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Pending Application Approvals */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-3 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-sm sm:text-lg font-bold text-gray-900">Pending Approvals</h2>
                                <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full">
                                    {pendingApps.length}
                                </span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {loadingApps ? (
                                    <div className="p-4 sm:p-6 text-center text-gray-500 text-sm">Loading...</div>
                                ) : pendingApps.length === 0 ? (
                                    <div className="p-4 sm:p-6 text-center text-gray-500 text-sm">No pending applications</div>
                                ) : (
                                    pendingApps.map((app) => (
                                        <div key={app.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors flex flex-col gap-3">
                                            <div className="flex items-start gap-3 sm:gap-4">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs sm:text-sm flex-shrink-0">
                                                    {app.student?.name?.charAt(0) || 'S'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{app.student?.name || 'Unknown Student'}</h4>
                                                    <p className="text-xs text-gray-500 mb-1 truncate">Applied for {app.internship?.title || 'Internship'} at {app.internship?.company || 'Company'}</p>
                                                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded w-fit border border-gray-100">
                                                        <span className="flex items-center gap-1" title="CGPA">
                                                            <GraduationCap className="w-3 h-3 text-blue-500" />
                                                            <span className="hidden xs:inline">{app.student?.cgpa || 'N/A'}</span>
                                                            <span className="xs:hidden">{app.student?.cgpa || '-'}</span>
                                                        </span>
                                                        <span className="w-px h-3 bg-gray-300"></span>
                                                        <span title="Semester">Sem {app.student?.semester || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 pl-11 sm:pl-14">
                                                {/* Resume Button */}
                                                {(app.student?.pdfResumes?.[0] || app.student?.resumeLink) && (
                                                    <button
                                                        onClick={() => {
                                                            const pdf = app.student.pdfResumes?.[0];
                                                            if (pdf) {
                                                                setSelectedPdf(pdf);
                                                                setShowPdfViewer(true);
                                                            } else if (app.student.resumeLink) {
                                                                window.open(app.student.resumeLink, '_blank');
                                                            }
                                                        }}
                                                        className="text-xs bg-blue-50 text-blue-600 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-100"
                                                        title="View Resume"
                                                    >
                                                        <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                        <span className="hidden sm:inline">View Resume</span>
                                                        <span className="sm:hidden">Resume</span>
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleApprove(app.id)}
                                                    className="text-xs bg-green-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(app.id)}
                                                    className="text-xs bg-white text-red-600 border border-red-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>


                        {/* Application History */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-3 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-sm sm:text-lg font-bold text-gray-900">Application History</h2>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {loadingApps ? (
                                    <div className="p-4 sm:p-6 text-center text-gray-500 text-sm">Loading...</div>
                                ) : historyApps.length === 0 ? (
                                    <div className="p-4 sm:p-6 text-center text-gray-500 text-sm">No application history found</div>
                                ) : (
                                    historyApps.map((app) => (
                                        <div key={app.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors flex items-center gap-3 sm:gap-4">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${app.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {app.status === 'rejected' ? <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{app.student?.name || 'Unknown Student'}</h4>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {app.internship?.title} • {app.status === 'rejected' ? 'Rejected' : 'Approved'}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${app.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                                    }`}>
                                                    {app.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>


                    </div>

                    {/* Quick Access / Notifications */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                            <h2 className="text-sm sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
                                <Link
                                    to="/mentor/students"
                                    className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors font-medium text-gray-700 flex items-center gap-2 sm:gap-3 text-xs sm:text-base"
                                >
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                                    <span className="truncate">My Students</span>
                                </Link>
                                <button
                                    onClick={() => alert('Feature coming soon')}
                                    className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors font-medium text-gray-700 flex items-center gap-2 sm:gap-3 text-xs sm:text-base"
                                >
                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                                    <span className="truncate">Evaluations</span>
                                </button>
                                <button
                                    onClick={() => alert('Feature coming soon')}
                                    className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors font-medium text-gray-700 flex items-center gap-2 sm:gap-3 text-xs sm:text-base"
                                >
                                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                                    <span className="truncate">Flag Issue</span>
                                </button>
                                <Link
                                    to="/mentor/calendar"
                                    className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors font-medium text-gray-700 flex items-center gap-2 sm:gap-3 text-xs sm:text-base"
                                >
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                                    <span className="truncate">Calendar</span>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-teal-900 to-emerald-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                            <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2">Upcoming Deadline</h3>
                            <p className="text-teal-100 text-xs sm:text-sm mb-3 sm:mb-4">Initial Project Proposals (IPP) approval deadline is approaching.</p>
                            <div className="flex items-center gap-2 text-xs font-mono bg-white/10 p-2 rounded-lg w-fit">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Oct 15, 2025</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* PDF Viewer Modal */}
                {showPdfViewer && selectedPdf && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
                        <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-6xl h-[95vh] sm:h-[90vh] shadow-2xl flex flex-col">
                            <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-200 flex-shrink-0 gap-2">
                                <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate flex-1 min-w-0">
                                    {selectedPdf.originalName || 'Resume.pdf'}
                                </h3>
                                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
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
                                            setSelectedPdf(null);
                                        }}
                                        className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <XIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto bg-gray-100 flex justify-center py-3 sm:py-6">
                                <div className="max-h-full">
                                    <Document
                                        file={selectedPdf.filePath}
                                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                        onLoadError={(error) => {
                                            console.error('Error loading PDF:', error);
                                            alert('Failed to load PDF');
                                        }}
                                        loading={
                                            <div className="flex items-center justify-center p-8">
                                                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
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
                )}
            </div>
        </div>
    );
};

export default MentorDashboard;
