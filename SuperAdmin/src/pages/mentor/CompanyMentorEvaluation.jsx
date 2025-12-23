import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, Building2, User, Calendar } from 'lucide-react';
import axios from 'axios';
import StarRating from '../../components/ipp/StarRating';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import toast from 'react-hot-toast';

const CompanyMentorEvaluation = () => {
    const { ippId } = useParams();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [ippData, setIppData] = useState(null);
    const [error, setError] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        mentorName: '',
        mentorEmail: '',
        mentorDesignation: '',
        technicalSkills: {
            domainKnowledge: 0,
            problemSolving: 0,
            codeQuality: 0,
            learningAgility: 0,
            toolProficiency: 0
        },
        softSkills: {
            punctuality: 0,
            teamwork: 0,
            communication: 0,
            leadership: 0,
            adaptability: 0,
            workEthic: 0
        },
        overallPerformance: 'Excellent',
        strengths: [''],
        areasForImprovement: [''],
        keyAchievements: [''],
        wouldRehire: true,
        recommendationLevel: 'Highly Recommended',
        detailedFeedback: ''
    });

    useEffect(() => {
        const fetchIPP = async () => {
            try {
                // In a real scenario, we might have a specific public endpoint for fetching basic details
                // without full auth, or we use the token to validate access first.
                // For now, we'll assume the magic link allows us to fetch the IPP context.
                // Since we don't have a specific "validate token" endpoint, we'll try to fetch public info
                // or just rely on the user filling the form.

                // NOTE: In a strict security model, we'd validate the token first.
                // Here we'll just load the page. If we needed pre-filled data, we'd need an endpoint.
                setLoading(false);

                // Pre-fill mentor details if available in query params (optional convenience)
                const emailParam = searchParams.get('email');
                const nameParam = searchParams.get('name');
                if (emailParam) {
                    setFormData(prev => ({ ...prev, mentorEmail: emailParam }));
                }
                if (nameParam) {
                    setFormData(prev => ({ ...prev, mentorName: nameParam }));
                }
            } catch (err) {
                setError('Invalid or expired evaluation link.');
                setLoading(false);
            }
        };

        fetchIPP();
    }, [ippId, token, searchParams]);

    const handleSkillChange = (category, skill, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [skill]: value
            }
        }));
    };

    const handleArrayInput = (field, index, value) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const addArrayField = (field) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeArrayField = (field, index) => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Basic validation
            if (!formData.mentorName || !formData.mentorEmail) {
                throw new Error('Please provide your name and email.');
            }

            // Submit evaluation using axios directly
            await axios.put(`/ipp/${ippId}/company-evaluation`, {
                token,
                evaluation: formData
            });

            toast.success('Evaluation submitted successfully!');
            navigate('/mentor/dashboard');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Failed to submit evaluation');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md border-red-200 shadow-lg bg-white">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle className="text-red-700">Access Denied</CardTitle>
                        <CardDescription className="text-gray-500">{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div>
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900">Internship Performance Evaluation</h1>
                        <p className="mt-2 text-gray-600">
                            Please evaluate the student's performance during their internship.
                            Your feedback is crucial for their academic grading and professional growth.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Mentor Details */}
                        <Card className="shadow-sm border-t-4 border-t-blue-600 bg-white border-gray-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-900">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Mentor Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="mentorName" className="text-gray-700">Full Name *</Label>
                                    <Input
                                        id="mentorName"
                                        value={formData.mentorName}
                                        onChange={(e) => setFormData({ ...formData, mentorName: e.target.value })}
                                        placeholder="e.g. John Smith"
                                        required
                                        className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mentorEmail" className="text-gray-700">Work Email *</Label>
                                    <Input
                                        id="mentorEmail"
                                        type="email"
                                        value={formData.mentorEmail}
                                        onChange={(e) => setFormData({ ...formData, mentorEmail: e.target.value })}
                                        placeholder="john@company.com"
                                        required
                                        className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="mentorDesignation" className="text-gray-700">Designation</Label>
                                    <Input
                                        id="mentorDesignation"
                                        value={formData.mentorDesignation}
                                        onChange={(e) => setFormData({ ...formData, mentorDesignation: e.target.value })}
                                        placeholder="e.g. Senior Software Engineer"
                                        className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Technical Skills */}
                        <Card className="shadow-sm bg-white border-gray-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-900">
                                    <Building2 className="h-5 w-5 text-purple-600" />
                                    Technical Skills Assessment
                                </CardTitle>
                                <CardDescription className="text-gray-500">Rate the intern's technical capabilities on a scale of 1-10</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {Object.entries(formData.technicalSkills).map(([key, value]) => (
                                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="space-y-1">
                                            <Label className="text-base capitalize text-gray-900">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </Label>
                                            <p className="text-xs text-gray-500">
                                                {key === 'domainKnowledge' && 'Understanding of core concepts and technologies'}
                                                {key === 'problemSolving' && 'Ability to debug and find solutions'}
                                                {key === 'codeQuality' && 'Readability, structure, and best practices'}
                                                {key === 'learningAgility' && 'Speed of picking up new tools/frameworks'}
                                                {key === 'toolProficiency' && 'Competence with IDEs, Git, etc.'}
                                            </p>
                                        </div>
                                        <StarRating
                                            value={value}
                                            onChange={(val) => handleSkillChange('technicalSkills', key, val)}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Soft Skills */}
                        <Card className="shadow-sm bg-white border-gray-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-900">
                                    <User className="h-5 w-5 text-green-600" />
                                    Soft Skills & Professionalism
                                </CardTitle>
                                <CardDescription className="text-gray-500">Rate the intern's professional behavior on a scale of 1-10</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {Object.entries(formData.softSkills).map(([key, value]) => (
                                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="space-y-1">
                                            <Label className="text-base capitalize text-gray-900">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </Label>
                                        </div>
                                        <StarRating
                                            value={value}
                                            onChange={(val) => handleSkillChange('softSkills', key, val)}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Qualitative Feedback */}
                        <Card className="shadow-sm bg-white border-gray-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-900">
                                    <Calendar className="h-5 w-5 text-orange-600" />
                                    Qualitative Feedback
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Key Strengths</Label>
                                    {formData.strengths.map((strength, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <Input
                                                value={strength}
                                                onChange={(e) => handleArrayInput('strengths', index, e.target.value)}
                                                placeholder="e.g. Fast learner"
                                                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                                            />
                                            {formData.strengths.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => removeArrayField('strengths', index)}
                                                    className="text-red-500 hover:text-red-700 border-gray-200 hover:bg-red-50"
                                                >
                                                    X
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button type="button" variant="ghost" onClick={() => addArrayField('strengths')} className="text-sm text-blue-600 hover:bg-blue-50">
                                        + Add Strength
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700">Areas for Improvement</Label>
                                    {formData.areasForImprovement.map((area, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <Input
                                                value={area}
                                                onChange={(e) => handleArrayInput('areasForImprovement', index, e.target.value)}
                                                placeholder="e.g. Needs to improve documentation"
                                                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                                            />
                                            {formData.areasForImprovement.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => removeArrayField('areasForImprovement', index)}
                                                    className="text-red-500 hover:text-red-700 border-gray-200 hover:bg-red-50"
                                                >
                                                    X
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button type="button" variant="ghost" onClick={() => addArrayField('areasForImprovement')} className="text-sm text-blue-600 hover:bg-blue-50">
                                        + Add Area
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="detailedFeedback" className="text-gray-700">Detailed Feedback / Remarks</Label>
                                    <textarea
                                        id="detailedFeedback"
                                        className="flex min-h-[120px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
                                        value={formData.detailedFeedback}
                                        onChange={(e) => setFormData({ ...formData, detailedFeedback: e.target.value })}
                                        placeholder="Please provide any additional context about the intern's performance..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Would you rehire this intern?</Label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                                <input
                                                    type="radio"
                                                    checked={formData.wouldRehire === true}
                                                    onChange={() => setFormData({ ...formData, wouldRehire: true })}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                Yes
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                                <input
                                                    type="radio"
                                                    checked={formData.wouldRehire === false}
                                                    onChange={() => setFormData({ ...formData, wouldRehire: false })}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                No
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Recommendation Level</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
                                            value={formData.recommendationLevel}
                                            onChange={(e) => setFormData({ ...formData, recommendationLevel: e.target.value })}
                                        >
                                            <option value="Highly Recommended">Highly Recommended</option>
                                            <option value="Recommended">Recommended</option>
                                            <option value="Recommended with Reservations">Recommended with Reservations</option>
                                            <option value="Not Recommended">Not Recommended</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end pt-6 pb-12">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={submitting}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting Evaluation...
                                    </>
                                ) : (
                                    'Submit Evaluation'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CompanyMentorEvaluation;