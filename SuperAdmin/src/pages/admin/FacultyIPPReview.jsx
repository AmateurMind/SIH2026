import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Building,
    User,
    FileText,
    Award,
    Calendar,
    ArrowLeft,
    ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Reusing the StarRating component logic or importing if available
// Since this is a separate repo/app, we might need to recreate it or import from a shared location if configured.
// For simplicity, I'll create a local version here.
const StarRating = ({ value, max = 10, size = 20 }) => {
    return (
        <div className="flex gap-0.5">
            {[...Array(max)].map((_, i) => (
                <svg
                    key={i}
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    fill={i < value ? "#FBBF24" : "none"}
                    stroke={i < value ? "#FBBF24" : "#D1D5DB"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </div>
    );
};

const FacultyIPPReview = () => {
    const { ippId } = useParams();
    const navigate = useNavigate();
    const [ipp, setIpp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const { user } = useAuth();

    // Assessment Form State
    const [assessment, setAssessment] = useState({
        status: 'approved', // approved or rejected
        comments: '',
        performanceGrade: 'A',
        overallRating: 8
    });

    useEffect(() => {
        fetchIPP();
    }, [ippId]);

    const fetchIPP = async () => {
        try {
            const response = await axios.get(`/ipp/${ippId}`);
            setIpp(response.data);
        } catch (error) {
            console.error('Error fetching IPP:', error);
            toast.error('Failed to load IPP details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await axios.put(`/ipp/${ippId}/faculty-assessment`, {
                assessment: {
                    facultyId: user?.id || user?._id,
                    facultyName: user?.name || 'Faculty Admin',
                    approvalStatus: assessment.status,
                    comments: assessment.comments,
                    performanceGrade: assessment.performanceGrade,
                    overallRating: parseInt(assessment.overallRating)
                }
            });

            toast.success(`IPP ${assessment.status === 'approved' ? 'Approved' : 'Rejected'} Successfully`);
            navigate('/admin/ipp-reviews');
        } catch (error) {
            console.error('Error submitting assessment:', error);
            toast.error('Failed to submit assessment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12">Loading...</div>;
    if (!ipp) return <div className="text-center p-12">IPP not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <Button variant="ghost" onClick={() => navigate('/admin/dashboard')} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Faculty Review Portal</h1>
                    <p className="text-gray-600 mt-1">Review internship performance and approve passport.</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">Student</div>
                    <div className="text-lg font-semibold">{ipp.studentDetails?.name}</div>
                    <div className="text-sm text-gray-500">{ipp.studentDetails?.department}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Evidence (Company Eval & Student Work) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Company Evaluation */}
                    <Card>
                        <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                                <Building className="h-5 w-5" />
                                Company Mentor Evaluation
                            </CardTitle>
                            <CardDescription>
                                Evaluated by {ipp.companyMentorEvaluation?.mentorName} ({ipp.companyMentorEvaluation?.mentorDesignation})
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {ipp.companyMentorEvaluation ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium mb-3 text-sm uppercase tracking-wide text-gray-500">Technical Skills</h4>
                                            <div className="space-y-3">
                                                {Object.entries(ipp.companyMentorEvaluation.technicalSkills || {}).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between items-center">
                                                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                        <StarRating value={value} size={14} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-3 text-sm uppercase tracking-wide text-gray-500">Soft Skills</h4>
                                            <div className="space-y-3">
                                                {Object.entries(ipp.companyMentorEvaluation.softSkills || {}).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between items-center">
                                                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                        <StarRating value={value} size={14} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <h4 className="font-medium text-gray-900 mb-2">Mentor Feedback</h4>
                                        <p className="text-gray-700 italic">"{ipp.companyMentorEvaluation.detailedFeedback}"</p>
                                        <div className="mt-4 flex gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Recommendation:</span>
                                                <span className="ml-2 font-medium text-gray-900">{ipp.companyMentorEvaluation.recommendationLevel}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Rehire:</span>
                                                <span className="ml-2 font-medium text-gray-900">{ipp.companyMentorEvaluation.wouldRehire ? 'Yes' : 'No'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                                    <p>Pending Company Evaluation</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Student Submission */}
                    <Card>
                        <CardHeader className="bg-purple-50/50 border-b border-purple-100">
                            <CardTitle className="flex items-center gap-2 text-purple-800">
                                <User className="h-5 w-5" />
                                Student Submission
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {ipp.studentSubmission ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <div className="font-medium text-sm">Internship Report</div>
                                                    <div className="text-xs text-gray-500">PDF Document</div>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={ipp.studentSubmission.internshipReport?.fileUrl} target="_blank" rel="noreferrer">
                                                    View <ExternalLink className="ml-2 h-3 w-3" />
                                                </a>
                                            </Button>
                                        </div>
                                        <div className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <Award className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <div className="font-medium text-sm">Certificate</div>
                                                    <div className="text-xs text-gray-500">Proof of Completion</div>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={ipp.studentSubmission.certificateUrl} target="_blank" rel="noreferrer">
                                                    View <ExternalLink className="ml-2 h-3 w-3" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2 text-sm uppercase tracking-wide text-gray-500">Key Learnings</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {ipp.studentSubmission.studentReflection?.keyLearnings?.map((item, i) => (
                                                <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm border border-purple-100">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2 text-sm uppercase tracking-wide text-gray-500">Future Goals</h4>
                                        <p className="text-gray-700 bg-gray-50 p-3 rounded border border-gray-100">
                                            {ipp.studentSubmission.studentReflection?.futureGoals}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                                    <p>Pending Student Submission</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Faculty Assessment Form */}
                <div className="space-y-6">
                    <Card className="sticky top-24 shadow-lg border-t-4 border-t-indigo-600">
                        <CardHeader>
                            <CardTitle className="text-indigo-900">Faculty Assessment</CardTitle>
                            <CardDescription>Final review and grading</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Approval Status</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${assessment.status === 'approved' ? 'bg-green-50 border-green-500 text-green-700' : 'hover:bg-gray-50'}`}>
                                            <input
                                                type="radio"
                                                name="status"
                                                value="approved"
                                                checked={assessment.status === 'approved'}
                                                onChange={(e) => setAssessment({ ...assessment, status: e.target.value })}
                                                className="sr-only"
                                            />
                                            <CheckCircle className={`h-6 w-6 mb-2 ${assessment.status === 'approved' ? 'text-green-600' : 'text-gray-400'}`} />
                                            <span className="font-medium">Approve</span>
                                        </label>

                                        <label className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all ${assessment.status === 'rejected' ? 'bg-red-50 border-red-500 text-red-700' : 'hover:bg-gray-50'}`}>
                                            <input
                                                type="radio"
                                                name="status"
                                                value="rejected"
                                                checked={assessment.status === 'rejected'}
                                                onChange={(e) => setAssessment({ ...assessment, status: e.target.value })}
                                                className="sr-only"
                                            />
                                            <XCircle className={`h-6 w-6 mb-2 ${assessment.status === 'rejected' ? 'text-red-600' : 'text-gray-400'}`} />
                                            <span className="font-medium">Reject</span>
                                        </label>
                                    </div>
                                </div>

                                {assessment.status === 'approved' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="grade">Performance Grade</Label>
                                            <select
                                                id="grade"
                                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                value={assessment.performanceGrade}
                                                onChange={(e) => setAssessment({ ...assessment, performanceGrade: e.target.value })}
                                            >
                                                <option value="O">O (Outstanding)</option>
                                                <option value="A+">A+ (Excellent)</option>
                                                <option value="A">A (Very Good)</option>
                                                <option value="B+">B+ (Good)</option>
                                                <option value="B">B (Above Average)</option>
                                                <option value="C">C (Average)</option>
                                                <option value="P">P (Pass)</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="rating">Overall Rating (1-10)</Label>
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    id="rating"
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={assessment.overallRating}
                                                    onChange={(e) => setAssessment({ ...assessment, overallRating: e.target.value })}
                                                    className="w-20"
                                                />
                                                <div className="text-sm text-gray-500">
                                                    / 10 Points
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="comments">Faculty Comments</Label>
                                    <textarea
                                        id="comments"
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Enter your assessment comments here..."
                                        value={assessment.comments}
                                        onChange={(e) => setAssessment({ ...assessment, comments: e.target.value })}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className={`w-full ${assessment.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : `Confirm ${assessment.status === 'approved' ? 'Approval' : 'Rejection'}`}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default FacultyIPPReview;
