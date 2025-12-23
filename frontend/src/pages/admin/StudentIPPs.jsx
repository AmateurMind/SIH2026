import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Briefcase, Building, Calendar, FileText, Loader2, ExternalLink } from 'lucide-react';
import ippService from '../../services/ippService';
import toast from 'react-hot-toast';
import IPPStatusBadge from '../../components/ipp/IPPStatusBadge';

const StudentIPPs = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [ipps, setIpps] = useState([]);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    // Detect current role from URL path
    const getCurrentRole = () => {
        if (location.pathname.startsWith('/admin')) return 'admin';
        if (location.pathname.startsWith('/mentor')) return 'mentor';
        if (location.pathname.startsWith('/recruiter')) return 'recruiter';
        return 'admin';
    };

    const currentRole = getCurrentRole();

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch student info
            try {
                const studentResponse = await axios.get(`/students/${id}`);
                setStudent(studentResponse.data.student || studentResponse.data);
            } catch (error) {
                console.error('Error fetching student:', error);
            }

            // Fetch IPPs
            const ippResponse = await ippService.getStudentIPPs(id);
            console.log('IPP Response:', ippResponse);
            // Handle different response structures
            let ippsData = [];
            if (ippResponse.data && Array.isArray(ippResponse.data)) {
                ippsData = ippResponse.data;
            } else if (ippResponse.count !== undefined && ippResponse.count > 0 && ippResponse.data) {
                ippsData = Array.isArray(ippResponse.data) ? ippResponse.data : [];
            } else if (Array.isArray(ippResponse)) {
                ippsData = ippResponse;
            }
            console.log('Setting IPPs:', ippsData);
            setIpps(ippsData);
        } catch (error) {
            console.error('Error fetching IPPs:', error);
            toast.error('Failed to load internship passports');
        } finally {
            setLoading(false);
        }
    };

    const handleViewIPP = (ippId) => {
        console.log('handleViewIPP called with:', { ippId, currentRole });
        if (!ippId) {
            toast.error('Invalid IPP ID');
            console.error('IPP ID is missing');
            return;
        }
        // Navigate to a shared IPP view route that works for all roles
        const targetPath = `/${currentRole}/ipp/${ippId}`;
        console.log('Navigating to:', targetPath);
        navigate(targetPath);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6 pb-24 md:pb-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-4 sm:mb-6">
                    <button
                        onClick={() => navigate(`/${currentRole}/students`)}
                        className="flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        Back to Directory
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                            <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                            Internship Performance Passports
                        </h1>
                        {student && (
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                {student.name} • {student.department}
                            </p>
                        )}
                    </div>
                </div>

                {/* IPPs List */}
                {ipps.length === 0 ? (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 sm:p-12 text-center">
                        <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Passports Found</h3>
                        <p className="text-sm text-gray-500">
                            This student hasn't created any internship performance passports yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {ipps.map((ipp) => (
                            <div
                                key={ipp.ippId}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-4 sm:p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                                            {ipp.internshipDetails?.role || 'Internship Role'}
                                        </h3>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <Building className="w-4 h-4" />
                                            {ipp.internshipDetails?.company || 'Company'}
                                        </p>
                                    </div>
                                    <IPPStatusBadge status={ipp.status || 'pending'} />
                                </div>

                                <div className="space-y-2 mb-4">
                                    {ipp.internshipDetails?.startDate && (
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {new Date(ipp.internshipDetails.startDate).toLocaleDateString()} - {' '}
                                                {ipp.internshipDetails.endDate
                                                    ? new Date(ipp.internshipDetails.endDate).toLocaleDateString()
                                                    : 'Ongoing'}
                                            </span>
                                        </div>
                                    )}
                                    {ipp.internshipDetails?.location && (
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                            <FileText className="w-4 h-4" />
                                            <span>{ipp.internshipDetails.location}</span>
                                        </div>
                                    )}
                                    {ipp.summary?.performanceGrade && (
                                        <div className="inline-flex items-center px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-semibold">
                                            Grade: {ipp.summary.performanceGrade}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Button clicked, IPP:', ipp);
                                        const ippId = ipp.ippId || ipp._id || ipp.id;
                                        console.log('Extracted IPP ID:', ippId);
                                        if (ippId) {
                                            handleViewIPP(ippId);
                                        } else {
                                            toast.error('IPP ID not found');
                                            console.error('IPP object:', ipp);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 sm:py-2.5 px-4 rounded-lg transition-colors text-sm sm:text-base"
                                >
                                    View Passport
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentIPPs;
