import React from 'react';
import { Award, Star, CheckCircle, Calendar, Building, Download } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

const IPPBadge = ({ ipp, showDownload = true }) => {
    const getGradeColor = (grade) => {
        const gradeColors = {
            'O': 'from-purple-500 to-purple-700',
            'A+': 'from-blue-500 to-blue-700',
            'A': 'from-green-500 to-green-700',
            'B+': 'from-teal-500 to-teal-700',
            'B': 'from-cyan-500 to-cyan-700',
            'C': 'from-yellow-500 to-yellow-700',
            'P': 'from-orange-500 to-orange-700',
            'F': 'from-red-500 to-red-700'
        };
        return gradeColors[grade] || 'from-gray-500 to-gray-700';
    };

    // Dynamic data from IPP prop
    const grade = ipp.summary?.performanceGrade || 'N/A';
    const rating = ipp.summary?.overallRating || 0;
    const gradientClass = getGradeColor(grade);
    const role = ipp.internshipDetails?.role || 'Intern';
    const company = ipp.internshipDetails?.company || 'Unknown Company';
    const performance = ipp.companyMentorEvaluation?.overallPerformance || 'Pending';
    const employability = ipp.summary?.employabilityScore || 0;

    // Format dates
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };
    const startDate = formatDate(ipp.internshipDetails?.startDate);
    const endDate = formatDate(ipp.internshipDetails?.endDate);
    const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : 'Dates pending';

    const location = ipp.internshipDetails ? `${ipp.internshipDetails.location} • ${ipp.internshipDetails.workMode}` : 'Location pending';
    const id = ipp.ippId || 'Pending ID';

    const handleDownload = () => {
        if (ipp.certificate?.certificateUrl) {
            // Static files are at root, so strip /api from the URL
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const backendUrl = apiUrl.replace(/\/api\/?$/, '');

            const fullUrl = ipp.certificate.certificateUrl.startsWith('http')
                ? ipp.certificate.certificateUrl
                : `${backendUrl}${ipp.certificate.certificateUrl}`;
            window.open(fullUrl, '_blank');
        }
    };

    return (
        <div className="relative group">
            {/* Badge Container */}
            <div className="relative w-full max-w-sm mx-auto">
                {/* Outer Glow */}
                <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} opacity-20 blur-2xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500`}></div>

                {/* Main Badge */}
                <Card className="relative bg-white border-2 border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden">
                    <CardContent className="p-0">
                        {/* Top Section - Gradient Header */}
                        <div className={`bg-gradient-to-r ${gradientClass} p-4 sm:p-6 text-white relative overflow-hidden`}>
                            {/* Decorative pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 left-0 w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                            </div>

                            {/* Header Content */}
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <Award className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                        <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">Internship Certificate</span>
                                    </div>
                                    <div className="animate-pulse">
                                        <div className="bg-white/20 p-1 sm:p-1.5 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Grade Badge */}
                                <div className="flex items-center justify-center mb-3 sm:mb-4">
                                    <div className="relative">
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                                            <div className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br ${gradientClass} rounded-full flex flex-col items-center justify-center`}>
                                                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{grade}</span>
                                                <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                                                    <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 fill-current text-yellow-300" />
                                                    <span className="text-xs sm:text-sm font-semibold text-white">{rating}/10</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Decorative rings */}
                                        <div className="absolute inset-0 border-2 sm:border-4 border-white/30 rounded-full animate-pulse"></div>
                                    </div>
                                </div>

                                {/* Role */}
                                <div className="text-center">
                                    <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-0.5 sm:mb-1 truncate px-2">{role}</h3>
                                    <p className="text-white/90 text-xs sm:text-sm font-medium truncate px-2">{company}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section - Details */}
                        <div className="p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-white">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                                <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-100 shadow-sm">
                                    <div className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5 sm:mb-1">Performance</div>
                                    <div className={`text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent truncate`}>
                                        {performance}
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-100 shadow-sm">
                                    <div className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5 sm:mb-1">Employability</div>
                                    <div className={`text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
                                        {employability}%
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{dateRange}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                    <Building className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{location}</span>
                                </div>
                            </div>

                            {/* Certificate ID */}
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-[10px] sm:text-xs text-gray-400 font-mono truncate">
                                        ID: {id}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-green-600 font-medium flex-shrink-0">
                                        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
                                        Verified
                                    </div>
                                </div>
                            </div>


                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Achievement Ribbon - Always Visible */}
            <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4">
                <div className={`bg-gradient-to-r from-green-600 to-green-500 text-white px-2.5 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg flex items-center gap-1 sm:gap-2 transform rotate-12`}>
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                    <span className="text-[10px] sm:text-xs font-bold">Certified</span>
                </div>
            </div>
        </div>
    );
};

export default IPPBadge;
