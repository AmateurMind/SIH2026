import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Building,
    Calendar,
    Award,
    CheckCircle,
    Star,
    User,
    FileText,
    Download,
    ExternalLink,
    Briefcase
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import IPPBadge from '../../components/ipp/IPPBadge';
import toast from 'react-hot-toast';
import axios from 'axios';

// Star Rating Component
const StarRating = ({ value, max = 10, size = 16 }) => {
    return (
        <div className="flex gap-0.5 items-center">
            {[...Array(max)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-${size/4} w-${size/4} ${i < value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                    style={{ width: size, height: size }}
                />
            ))}
            <span className="ml-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">{value}/{max}</span>
        </div>
    );
};

const StudentIPPPassport = () => {
    const { ippId, studentId } = useParams();
    const navigate = useNavigate();
    const [ipp, setIpp] = useState(null);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [ippId, studentId]);

    const fetchData = async () => {
        try {
            // If ippId is provided, fetch that specific IPP
            if (ippId) {
                const response = await axios.get(`/ipp/${ippId}`);
                setIpp(response.data.data || response.data);
            }
            // If studentId is provided, fetch student's IPPs
            if (studentId) {
                const [studentRes, ippsRes] = await Promise.all([
                    axios.get(`/students/${studentId}`),
                    axios.get(`/ipp/student/${studentId}`)
                ]);
                setStudent(studentRes.data);
                // Get the first verified IPP or the most recent one
                const ipps = ippsRes.data.data || [];
                const verifiedIPP = ipps.find(i => i.status === 'verified' || i.status === 'published') || ipps[0];
                setIpp(verifiedIPP);
            }
        } catch (error) {
            console.error('Error fetching IPP data:', error);
            toast.error('Failed to load IPP passport');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[hsl(var(--primary))] border-t-transparent"></div>
                    <p className="text-[hsl(var(--muted-foreground))] text-lg">Loading Passport...</p>
                </div>
            </div>
        );
    }

    if (!ipp) {
        return (
            <div className="min-h-screen bg-[hsl(var(--background))] p-8">
                <Button variant="ghost" onClick={handleBack} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Card className="max-w-md mx-auto">
                    <CardContent className="text-center p-12">
                        <Award className="h-16 w-16 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
                        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2">No IPP Found</h2>
                        <p className="text-[hsl(var(--muted-foreground))]">
                            This student doesn't have a verified Internship Performance Passport yet.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isVerified = ipp.status === 'verified' || ipp.status === 'published';

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <Button variant="ghost" onClick={handleBack} className="mb-6 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
                            Internship Performance Passport
                        </h1>
                        {isVerified && (
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" /> Verified
                            </span>
                        )}
                    </div>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        ID: {ipp.ippId}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Internship Details */}
                        <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
                            <CardHeader className="border-b border-[hsl(var(--border))]">
                                <CardTitle className="flex items-center gap-3 text-[hsl(var(--foreground))]">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Briefcase className="h-5 w-5 text-blue-400" />
                                    </div>
                                    Internship Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Role</p>
                                        <p className="font-semibold text-[hsl(var(--foreground))]">{ipp.internshipDetails?.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Company</p>
                                        <p className="font-semibold text-[hsl(var(--foreground))]">{ipp.internshipDetails?.company}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Duration</p>
                                        <p className="font-semibold text-[hsl(var(--foreground))]">
                                            {new Date(ipp.internshipDetails?.startDate).toLocaleDateString()} - {new Date(ipp.internshipDetails?.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1">Location</p>
                                        <p className="font-semibold text-[hsl(var(--foreground))]">
                                            {ipp.internshipDetails?.location} ({ipp.internshipDetails?.workMode})
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Company Evaluation */}
                        {ipp.companyMentorEvaluation && (
                            <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
                                <CardHeader className="border-b border-[hsl(var(--border))]">
                                    <CardTitle className="flex items-center gap-3 text-[hsl(var(--foreground))]">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        Company Mentor Evaluation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    {/* Mentor Info */}
                                    <div className="flex items-center gap-3 p-3 bg-[hsl(var(--muted))] rounded-lg">
                                        <User className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
                                        <div>
                                            <p className="font-semibold text-[hsl(var(--foreground))]">{ipp.companyMentorEvaluation.mentorName}</p>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{ipp.companyMentorEvaluation.mentorDesignation || 'Company Mentor'}</p>
                                        </div>
                                    </div>

                                    {/* Technical Skills */}
                                    <div>
                                        <h4 className="font-semibold text-[hsl(var(--foreground))] mb-4">Technical Skills</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {Object.entries(ipp.companyMentorEvaluation.technicalSkills || {}).map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center bg-[hsl(var(--muted))] p-3 rounded-lg">
                                                    <span className="text-sm font-medium capitalize text-[hsl(var(--foreground))]">
                                                        {key.replace(/([A-Z])/g, ' $1')}
                                                    </span>
                                                    <StarRating value={value} size={14} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Soft Skills */}
                                    <div>
                                        <h4 className="font-semibold text-[hsl(var(--foreground))] mb-4">Soft Skills</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {Object.entries(ipp.companyMentorEvaluation.softSkills || {}).map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center bg-[hsl(var(--muted))] p-3 rounded-lg">
                                                    <span className="text-sm font-medium capitalize text-[hsl(var(--foreground))]">
                                                        {key.replace(/([A-Z])/g, ' $1')}
                                                    </span>
                                                    <StarRating value={value} size={14} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Feedback */}
                                    {ipp.companyMentorEvaluation.detailedFeedback && (
                                        <div className="bg-[hsl(var(--muted))] p-4 rounded-lg">
                                            <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">Mentor Feedback</h4>
                                            <p className="text-[hsl(var(--muted-foreground))] italic">
                                                "{ipp.companyMentorEvaluation.detailedFeedback}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Recommendation */}
                                    <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                        <Award className="h-8 w-8 text-emerald-400" />
                                        <div>
                                            <p className="text-sm text-emerald-400">Recommendation</p>
                                            <p className="font-bold text-emerald-300">{ipp.companyMentorEvaluation.recommendationLevel}</p>
                                        </div>
                                        {ipp.companyMentorEvaluation.wouldRehire && (
                                            <div className="ml-auto px-3 py-1 bg-emerald-500/20 rounded-full">
                                                <span className="text-xs font-medium text-emerald-300">Would Rehire ✓</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Student Submission */}
                        {ipp.studentSubmission && (
                            <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
                                <CardHeader className="border-b border-[hsl(var(--border))]">
                                    <CardTitle className="flex items-center gap-3 text-[hsl(var(--foreground))]">
                                        <div className="p-2 bg-purple-500/10 rounded-lg">
                                            <FileText className="h-5 w-5 text-purple-400" />
                                        </div>
                                        Student Submission
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {/* Key Learnings */}
                                    {ipp.studentSubmission.studentReflection?.keyLearnings?.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-[hsl(var(--foreground))] mb-3">Key Learnings</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {ipp.studentSubmission.studentReflection.keyLearnings.map((item, i) => (
                                                    <span key={i} className="bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-lg text-sm font-medium">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Future Goals */}
                                    {ipp.studentSubmission.studentReflection?.futureGoals && (
                                        <div>
                                            <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">Future Goals</h4>
                                            <p className="text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] p-3 rounded-lg">
                                                {ipp.studentSubmission.studentReflection.futureGoals}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Badge */}
                    <div className="space-y-6">
                        {/* Achievement Badge */}
                        {isVerified && (
                            <IPPBadge ipp={ipp} showDownload={true} />
                        )}

                        {/* Quick Stats */}
                        {!isVerified && (
                            <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
                                <CardContent className="p-6 text-center">
                                    <Award className="h-12 w-12 mx-auto mb-3 text-[hsl(var(--muted-foreground))]" />
                                    <h3 className="font-semibold text-[hsl(var(--foreground))] mb-2">Pending Verification</h3>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        The badge will be displayed once the IPP is verified.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentIPPPassport;
