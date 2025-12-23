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

    const grade = ipp.summary?.performanceGrade || 'N/A';
    const rating = ipp.summary?.overallRating || 0;
    const gradientClass = getGradeColor(grade);

    const handleDownload = () => {
        if (ipp.certificate?.certificateUrl) {
            const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
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
                <Card className="relative bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden">
                    <CardContent className="p-0">
                        {/* Top Section - Gradient Header */}
                        <div className={`bg-gradient-to-r ${gradientClass} p-6 text-white relative overflow-hidden`}>
                            {/* Decorative pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                            </div>

                            {/* Header Content */}
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Award className="h-6 w-6" />
                                        <span className="text-sm font-medium uppercase tracking-wider">Internship Certificate</span>
                                    </div>
                                    {ipp.verification?.companyVerified && (
                                        <CheckCircle className="h-5 w-5 fill-current" />
                                    )}
                                </div>

                                {/* Grade Badge */}
                                <div className="flex items-center justify-center mb-4">
                                    <div className="relative">
                                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                                            <div className={`w-28 h-28 bg-gradient-to-br ${gradientClass} rounded-full flex flex-col items-center justify-center`}>
                                                <span className="text-4xl font-bold text-white">{grade}</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Star className="h-4 w-4 fill-current text-yellow-300" />
                                                    <span className="text-sm font-semibold text-white">{rating}/10</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Decorative rings */}
                                        <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-pulse"></div>
                                    </div>
                                </div>

                                {/* Role */}
                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-1">{ipp.internshipDetails?.role}</h3>
                                    <p className="text-white/90 text-sm font-medium">{ipp.internshipDetails?.company}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section - Details */}
                        <div className="p-6 bg-gradient-to-b from-[hsl(var(--muted))] to-[hsl(var(--card))]">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-[hsl(var(--card))] rounded-xl p-3 border border-[hsl(var(--border))] shadow-sm">
                                    <div className="text-xs text-[hsl(var(--muted-foreground))] font-medium mb-1">Performance</div>
                                    <div className={`text-lg font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
                                        {ipp.companyMentorEvaluation?.overallPerformance || 'N/A'}
                                    </div>
                                </div>
                                <div className="bg-[hsl(var(--card))] rounded-xl p-3 border border-[hsl(var(--border))] shadow-sm">
                                    <div className="text-xs text-[hsl(var(--muted-foreground))] font-medium mb-1">Employability</div>
                                    <div className={`text-lg font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
                                        {ipp.summary?.employabilityScore || 0}%
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {new Date(ipp.internshipDetails?.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {new Date(ipp.internshipDetails?.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                                    <Building className="h-4 w-4" />
                                    <span>{ipp.internshipDetails?.location} • {ipp.internshipDetails?.workMode}</span>
                                </div>
                            </div>

                            {/* Certificate ID */}
                            <div className="mt-6 pt-4 border-t border-[hsl(var(--border))]">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
                                        ID: {ipp.certificate?.certificateId || ipp.ippId}
                                    </div>
                                    {ipp.verification?.companyVerified && (
                                        <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                                            <CheckCircle className="h-3 w-3 fill-current" />
                                            Verified
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* QR Code (if available) */}
                            {ipp.certificate?.qrCode && (
                                <div className="mt-4 flex justify-center">
                                    <div className="bg-white p-2 rounded-lg border border-[hsl(var(--border))] shadow-sm">
                                        <img 
                                            src={ipp.certificate.qrCode} 
                                            alt="Verification QR Code" 
                                            className="w-24 h-24"
                                        />
                                        <div className="text-xs text-[hsl(var(--muted-foreground))] text-center mt-1">Scan to Verify</div>
                                    </div>
                                </div>
                            )}

                            {/* Download Button */}
                            {showDownload && ipp.certificate?.certificateUrl && (
                                <div className="mt-4">
                                    <Button 
                                        onClick={handleDownload}
                                        className={`w-full bg-gradient-to-r ${gradientClass} hover:opacity-90 text-white`}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Certificate
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Achievement Ribbon */}
            {(ipp.status === 'verified' || ipp.status === 'published') && (
                <div className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`bg-gradient-to-r ${gradientClass} text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transform rotate-12`}>
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-xs font-bold">Certified</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IPPBadge;
