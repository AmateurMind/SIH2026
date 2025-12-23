import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Building, Calendar, Award, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ippService from '../../services/ippService';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import IPPStatusBadge from '../../components/ipp/IPPStatusBadge';
import StarRating from '../../components/ipp/StarRating';
import LoadingSpinner from '../../components/LoadingSpinner';
import IPPBadge from '../../components/ipp/IPPBadge';

// Helper function to validate URL
const isValidUrl = (url) => {
    if (!url || !url.trim()) return false;
    try {
        const parsed = new URL(url.trim());
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
};

// Helper function to get full URL for backend-served files
const getFullUrl = (url) => {
    if (!url || !url.trim()) return null;
    const trimmedUrl = url.trim();

    // If already a full URL, validate and return
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        return isValidUrl(trimmedUrl) ? trimmedUrl : null;
    }

    // If it's a relative path starting with /, prepend backend URL
    if (trimmedUrl.startsWith('/')) {
        // Use environment variable for backend URL
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        // Strip /api if present to get the base URL for static files
        const backendUrl = apiUrl.replace(/\/api\/?$/, '');
        return `${backendUrl}${trimmedUrl}`;
    }

    // Invalid URL format
    return null;
};

const IPPDetail = () => {
    const { ippId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [ipp, setIpp] = useState(null);
    const [loading, setLoading] = useState(true);

    // Determine current role from location pathname
    const getCurrentRole = () => {
        const pathname = location.pathname;
        if (pathname.startsWith('/student/')) return 'student';
        if (pathname.startsWith('/mentor/')) return 'mentor';
        if (pathname.startsWith('/admin/')) return 'admin';
        if (pathname.startsWith('/recruiter/')) return 'recruiter';
        return user?.role || 'student';
    };

    const currentRole = getCurrentRole();
    const isStudent = currentRole === 'student';

    useEffect(() => {
        const fetchIPP = async () => {
            try {
                // Validate IPP ID format
                if (!ippId || ippId.length < 3 || !ippId.includes('-')) {
                    console.error('Invalid IPP ID format:', ippId);
                    setLoading(false);
                    return;
                }

                const response = await ippService.getIPP(ippId);
                setIpp(response.data);
            } catch (error) {
                console.error('Error fetching IPP:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchIPP();
    }, [ippId]);



    if (loading) return <div className="flex justify-center p-8 sm:p-12"><LoadingSpinner /></div>;
    if (!ipp) return (
        <div className="text-center p-6 sm:p-12 pb-20 md:pb-12">
            <div className="max-w-md mx-auto">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">IPP Not Found</h2>
                <p className="text-sm sm:text-base text-gray-500 mb-4">The requested Internship Performance Passport could not be found or has an invalid ID.</p>
                <p className="text-xs sm:text-sm text-gray-400 mb-4">IPP ID: <code className="bg-gray-100 px-2 py-1 rounded text-gray-600 text-xs">{ippId}</code></p>
                <Button onClick={() => {
                    if (isStudent) {
                        navigate('/student/dashboard');
                    } else {
                        navigate(`/${currentRole}/students`);
                    }
                }} className="text-sm sm:text-base">Return to Dashboard</Button>
            </div>
        </div>
    );

    const reportUrl = ipp.studentSubmission?.internshipReport?.fileUrl?.trim();
    const certificateUrl = (ipp.studentSubmission?.certificateUrl || ipp.certificate?.certificateUrl || '').trim();

    // Get valid full URLs (handles both full URLs and relative backend paths)
    const validReportUrl = getFullUrl(reportUrl);
    const validCertificateUrl = getFullUrl(certificateUrl);

    return (
        <div className="min-h-screen bg-gray-50 pt-4 sm:pt-[30px] pb-20 md:pb-12 px-3 sm:px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <Button variant="ghost" onClick={() => {
                    if (isStudent) {
                        navigate('/student/internship-passports');
                    } else if (ipp?.studentId) {
                        navigate(`/${currentRole}/students/${ipp.studentId}/ipps`);
                    } else {
                        navigate(`/${currentRole}/students`);
                    }
                }} className="mb-4 sm:mb-6 text-gray-500 hover:text-gray-900 hover:bg-gray-100 pl-0 text-sm sm:text-base">
                    <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Back
                </Button>

                {/* Header */}
                <div className="bg-white shadow-soft border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{ipp.internshipDetails?.role}</h1>
                                <IPPStatusBadge status={ipp.status} />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-500 font-medium">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{ipp.internshipDetails?.company}</span>
                                </div>
                                <span className="hidden sm:inline text-gray-300">|</span>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                                    <span className="text-xs sm:text-base">
                                        {new Date(ipp.internshipDetails?.startDate).toLocaleDateString()} - {new Date(ipp.internshipDetails?.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {ipp.status === 'published' && (
                            <div className="text-center sm:text-right bg-blue-50 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-blue-100">
                                <div className="text-xs sm:text-sm text-primary-700 font-medium mb-1">Overall Rating</div>
                                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-600">{ipp.summary?.overallRating}/10</div>
                                <div className="text-xs sm:text-sm font-bold text-green-600 mt-1">Grade: {ipp.summary?.performanceGrade}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">

                        {/* Company Evaluation Section */}
                        {ipp.companyMentorEvaluation ? (
                            <Card className="bg-white border-gray-100 shadow-soft rounded-xl sm:rounded-2xl overflow-hidden">
                                <CardHeader className="border-b border-gray-50 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-900 text-base sm:text-lg lg:text-xl">
                                        <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
                                            <Building className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                                        </div>
                                        <span className="text-sm sm:text-base lg:text-xl">Company Mentor Evaluation</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 sm:space-y-6 lg:space-y-8 pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
                                    <div>
                                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                            <span className="w-0.5 sm:w-1 h-4 sm:h-5 bg-primary-600 rounded-full"></span>
                                            Technical Skills
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                                            {Object.entries(ipp.companyMentorEvaluation.technicalSkills || {}).map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center bg-gray-50 border border-gray-100 p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl">
                                                    <span className="text-xs sm:text-sm font-medium capitalize text-gray-700 truncate pr-2">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                    <StarRating value={value} readOnly size={16} className="flex-shrink-0" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                            <span className="w-0.5 sm:w-1 h-4 sm:h-5 bg-primary-600 rounded-full"></span>
                                            Soft Skills
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                                            {Object.entries(ipp.companyMentorEvaluation.softSkills || {}).map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center bg-gray-50 border border-gray-100 p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl">
                                                    <span className="text-xs sm:text-sm font-medium capitalize text-gray-700 truncate pr-2">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                    <StarRating value={value} readOnly size={16} className="flex-shrink-0" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {ipp.companyMentorEvaluation.detailedFeedback && (
                                        <div className="bg-blue-50 border border-blue-100 p-4 sm:p-6 rounded-xl">
                                            <h4 className="text-xs sm:text-sm font-bold text-primary-800 mb-2 sm:mb-3 uppercase tracking-wide">Mentor Feedback</h4>
                                            <p className="text-sm sm:text-base text-gray-700 italic leading-relaxed">"{ipp.companyMentorEvaluation.detailedFeedback}"</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-white border-gray-200 border-dashed shadow-sm rounded-xl sm:rounded-2xl">
                                <CardContent className="py-8 sm:py-12 text-center text-gray-500 px-4">
                                    <Clock className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm sm:text-base font-medium">Waiting for Company Mentor Evaluation</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Student Submission Section */}
                        {ipp.studentSubmission ? (
                            <Card className="bg-white border-gray-100 shadow-soft rounded-xl sm:rounded-2xl overflow-hidden">
                                <CardHeader className="border-b border-gray-50 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-gray-900 text-base sm:text-lg lg:text-xl">
                                        <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg">
                                            <Award className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                                        </div>
                                        <span className="text-sm sm:text-base lg:text-xl">My Reflection & Work</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Key Learnings</h4>
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                            {ipp.studentSubmission.studentReflection?.keyLearnings?.map((item, i) => (
                                                <span key={i} className="bg-purple-50 text-purple-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-purple-100">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                                        <div className="p-3 sm:p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Internship Report</div>
                                            {validReportUrl ? (
                                                <a href={validReportUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-700 font-medium hover:underline truncate flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                                                    View Document <ArrowLeft className="h-3 w-3 rotate-135 flex-shrink-0" />
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-xs sm:text-sm">{reportUrl ? 'Invalid URL provided' : 'Not provided'}</span>
                                            )}
                                        </div>
                                        <div className="p-3 sm:p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Certificate</div>
                                            {validCertificateUrl ? (
                                                <div className="flex flex-col gap-1.5 sm:gap-2">
                                                    <a
                                                        href={validCertificateUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary-600 hover:text-primary-700 font-medium hover:underline truncate flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                                                        download
                                                    >
                                                        Download Certificate <ArrowLeft className="h-3 w-3 rotate-135 flex-shrink-0" />
                                                    </a>
                                                    <a
                                                        href={`${validCertificateUrl}?disposition=inline`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs sm:text-sm text-gray-600 hover:text-gray-700 underline"
                                                    >
                                                        View in New Tab
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs sm:text-sm">{certificateUrl ? 'Invalid URL provided' : 'Not available yet'}</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-white border-gray-200 border-dashed shadow-sm rounded-xl sm:rounded-2xl">
                                <CardContent className="py-8 sm:py-12 text-center text-gray-500 px-4">
                                    <Clock className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm sm:text-base font-medium">Pending Student Submission</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Timeline/Status */}
                    <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-24">
                        <Card className="bg-white border-gray-100 shadow-soft rounded-xl sm:rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-gray-50 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                                <CardTitle className="text-base sm:text-lg font-bold text-gray-900">Verification Status</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
                                <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                                    {/* Company Verification */}
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className={`mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 ${ipp.verification?.companyVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
                                            {ipp.verification?.companyVerified ? (
                                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                            ) : (
                                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-xs sm:text-sm font-semibold ${ipp.verification?.companyVerified ? 'text-gray-900' : 'text-gray-500'}`}>
                                                Company Mentor Evaluation
                                            </h4>
                                            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                                                {ipp.verification?.companyVerified
                                                    ? `Verified on ${new Date(ipp.verification.companyVerifiedAt).toLocaleDateString()}`
                                                    : 'Awaiting mentor evaluation'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Student Submission */}
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className={`mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 ${ipp.studentSubmission?.submittedAt ? 'bg-green-100' : 'bg-gray-100'}`}>
                                            {ipp.studentSubmission?.submittedAt ? (
                                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                            ) : (
                                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-xs sm:text-sm font-semibold ${ipp.studentSubmission?.submittedAt ? 'text-gray-900' : 'text-gray-500'}`}>
                                                Student Documentation
                                            </h4>
                                            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                                                {ipp.studentSubmission?.submittedAt
                                                    ? `Submitted on ${new Date(ipp.studentSubmission.submittedAt).toLocaleDateString()}`
                                                    : 'Awaiting your submission'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Certificate Generated */}
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className={`mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 ${ipp.certificate?.generatedAt ? 'bg-green-100' : 'bg-gray-100'}`}>
                                            {ipp.certificate?.generatedAt ? (
                                                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                            ) : (
                                                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-xs sm:text-sm font-semibold ${ipp.certificate?.generatedAt ? 'text-gray-900' : 'text-gray-500'}`}>
                                                Certificate Generated
                                            </h4>
                                            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                                                {ipp.certificate?.generatedAt
                                                    ? `Generated on ${new Date(ipp.certificate.generatedAt).toLocaleDateString()}`
                                                    : 'Pending completion'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Summary */}
                                {(ipp.status === 'verified' || ipp.status === 'published') && (
                                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-green-600">
                                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm font-semibold">IPP Complete & Verified</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Achievement Badge - Always Visible (Static) */}
                        <div className="mt-4 sm:mt-6">
                            <IPPBadge ipp={ipp} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IPPDetail;
