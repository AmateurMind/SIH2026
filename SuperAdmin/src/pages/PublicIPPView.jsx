import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Award,
    Building,
    Calendar,
    Download,
    ExternalLink,
    FileText,
    GraduationCap,
    Star,
    User,
    CheckCircle,
    TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import axios from 'axios';

const PublicIPPView = () => {
    const { ippId } = useParams();
    const [ipp, setIpp] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPublicIPP();
    }, [ippId]);

    const fetchPublicIPP = async () => {
        try {
            const response = await axios.get(`/api/ipp/public/${ippId}`);
            setIpp(response.data.data);
        } catch (error) {
            console.error('Error fetching public IPP:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!ipp) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center p-8">
                        <div className="text-6xl mb-4">📄</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">IPP Not Found</h2>
                        <p className="text-gray-600">This Internship Performance Passport may not be public or doesn't exist.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardContent className="p-8">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <Award className="h-8 w-8 text-blue-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Internship Performance Passport
                            </h1>
                            <p className="text-gray-600">ID: {ipp.ippId}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">{ipp.summary?.overallRating || 'N/A'}</div>
                                <div className="text-sm text-gray-600">Overall Rating</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">{ipp.summary?.performanceGrade || 'N/A'}</div>
                                <div className="text-sm text-gray-600">Grade</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">{ipp.summary?.employabilityScore || 'N/A'}</div>
                                <div className="text-sm text-gray-600">Employability Score</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Student & Internship Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                Student Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg">{ipp.studentDetails?.name}</h3>
                                <p className="text-gray-600">{ipp.studentDetails?.department}</p>
                                <p className="text-sm text-gray-500">Student ID: {ipp.studentId}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5 text-green-600" />
                                Internship Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg">{ipp.internshipDetails?.role}</h3>
                                <p className="text-gray-600">{ipp.internshipDetails?.company}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {new Date(ipp.internshipDetails?.startDate).toLocaleDateString()} -
                                        {new Date(ipp.internshipDetails?.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Company Evaluation */}
                {ipp.companyMentorEvaluation && (
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Company Mentor Evaluation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-sm text-gray-600">
                                Evaluated by {ipp.companyMentorEvaluation.mentorName} ({ipp.companyMentorEvaluation.mentorDesignation})
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium mb-3">Technical Skills</h4>
                                    <div className="space-y-2">
                                        {Object.entries(ipp.companyMentorEvaluation.technicalSkills || {}).map(([skill, rating]) => (
                                            <div key={skill} className="flex justify-between items-center">
                                                <span className="text-sm capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
                                                <div className="flex gap-1">
                                                    {[...Array(10)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-3">Soft Skills</h4>
                                    <div className="space-y-2">
                                        {Object.entries(ipp.companyMentorEvaluation.softSkills || {}).map(([skill, rating]) => (
                                            <div key={skill} className="flex justify-between items-center">
                                                <span className="text-sm capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
                                                <div className="flex gap-1">
                                                    {[...Array(10)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {ipp.companyMentorEvaluation.detailedFeedback && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Mentor Feedback</h4>
                                    <p className="text-gray-700 italic">"{ipp.companyMentorEvaluation.detailedFeedback}"</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Student Submission */}
                {ipp.studentSubmission && (
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-purple-600" />
                                Student Work & Reflection
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {ipp.studentSubmission.studentReflection?.keyLearnings?.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-3">Key Learnings</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {ipp.studentSubmission.studentReflection.keyLearnings.map((learning, i) => (
                                            <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                {learning}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {ipp.studentSubmission.studentReflection?.futureGoals && (
                                <div>
                                    <h4 className="font-medium mb-2">Future Career Goals</h4>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded">
                                        {ipp.studentSubmission.studentReflection.futureGoals}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Badges */}
                {ipp.badges && ipp.badges.length > 0 && (
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-yellow-600" />
                                Achievements & Badges
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ipp.badges.map((badge, i) => (
                                    <div key={i} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                                        <div className="text-2xl mb-2">{badge.badgeIcon || '🏆'}</div>
                                        <h4 className="font-medium text-yellow-900">{badge.badgeName}</h4>
                                        <p className="text-sm text-yellow-700 mt-1">{badge.earnedCriteria}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Footer */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardContent className="text-center p-6">
                        <p className="text-gray-600 mb-4">
                            This Internship Performance Passport was issued on {new Date(ipp.publishedAt).toLocaleDateString()}
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button variant="outline" className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Download PDF
                            </Button>
                            <Button variant="outline" className="flex items-center gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Share Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PublicIPPView;