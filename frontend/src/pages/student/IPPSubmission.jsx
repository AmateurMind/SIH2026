import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, ArrowLeft, Link as LinkIcon, Loader2 } from 'lucide-react';
import ippService from '../../services/ippService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import toast from 'react-hot-toast';

const DOCUMENT_FIELDS = [
    {
        key: 'internshipReportUrl',
        label: 'Internship Report',
        required: true,
        helper: 'Upload a PDF or image (max 10MB) or provide a shareable link.'
    },
    {
        key: 'projectDocsUrl',
        label: 'Project Documentation',
        required: false,
        helper: 'Detailed architecture, design docs, or screenshots.'
    },
    {
        key: 'certificateUrl',
        label: 'Completion Certificate',
        required: false,
        helper: 'Signed certificate or acknowledgement letter.'
    },
    {
        key: 'offerLetterUrl',
        label: 'Offer / Internship Letter',
        required: false,
        helper: 'Initial offer or internship confirmation letter.'
    }
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Helper function to validate URL
const isValidUrl = (url) => {
    if (!url || !url.trim()) return true; // Empty is OK for optional fields
    try {
        const parsed = new URL(url.trim());
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
};

const buildInitialUploadState = () => DOCUMENT_FIELDS.reduce((acc, field) => {
    acc[field.key] = {
        uploading: false,
        fileName: '',
        fileSize: null,
        error: null,
        fileUrl: ''
    };
    return acc;
}, {});

const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileNameFromUrl = (url) => {
    if (!url) return '';
    try {
        const decoded = decodeURIComponent(new URL(url).pathname);
        const parts = decoded.split('/');
        return parts[parts.length - 1] || '';
    } catch (error) {
        return '';
    }
};

const IPPSubmission = () => {
    const { ippId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [ipp, setIpp] = useState(null);
    const fileInputRefs = useRef({});

    const [formData, setFormData] = useState({
        internshipReportUrl: '',
        projectDocsUrl: '',
        certificateUrl: '',
        offerLetterUrl: '',
        keyLearnings: [''],
        challenges: [''],
        achievements: [''],
        futureGoals: ''
    });

    const [uploadState, setUploadState] = useState(buildInitialUploadState);

    useEffect(() => {
        fetchIPP();
    }, [ippId]);

    const fetchIPP = async () => {
        try {
            const response = await ippService.getIPP(ippId);
            setIpp(response.data);

            // Pre-fill if data exists
            if (response.data.studentSubmission) {
                const sub = response.data.studentSubmission;
                setFormData({
                    internshipReportUrl: sub.internshipReport?.fileUrl || '',
                    projectDocsUrl: sub.projectDocumentation?.[0]?.fileUrl || '',
                    certificateUrl: sub.certificateUrl || '',
                    offerLetterUrl: sub.offerLetterUrl || '',
                    keyLearnings: sub.studentReflection?.keyLearnings || [''],
                    challenges: sub.studentReflection?.challenges || [''],
                    achievements: sub.studentReflection?.achievements || [''],
                    futureGoals: sub.studentReflection?.futureGoals || ''
                });

                setUploadState((prev) => {
                    const initial = buildInitialUploadState();
                    if (sub.internshipReport?.fileUrl) {
                        initial.internshipReportUrl.fileName = sub.internshipReport.fileName || getFileNameFromUrl(sub.internshipReport.fileUrl);
                        initial.internshipReportUrl.fileUrl = sub.internshipReport.fileUrl;
                    }
                    if (sub.projectDocumentation?.[0]?.fileUrl) {
                        initial.projectDocsUrl.fileName = sub.projectDocumentation[0].title || getFileNameFromUrl(sub.projectDocumentation[0].fileUrl);
                        initial.projectDocsUrl.fileUrl = sub.projectDocumentation[0].fileUrl;
                    }
                    if (sub.certificateUrl) {
                        initial.certificateUrl.fileName = getFileNameFromUrl(sub.certificateUrl);
                        initial.certificateUrl.fileUrl = sub.certificateUrl;
                    }
                    if (sub.offerLetterUrl) {
                        initial.offerLetterUrl.fileName = getFileNameFromUrl(sub.offerLetterUrl);
                        initial.offerLetterUrl.fileUrl = sub.offerLetterUrl;
                    }
                    return { ...prev, ...initial };
                });
            }
        } catch (error) {
            toast.error('Failed to fetch IPP details');
            navigate('/student/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleUrlChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setUploadState(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                error: null,
                fileUrl: value,
                fileName: value ? (getFileNameFromUrl(value) || prev[field].fileName) : ''
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

    const handleFileInputChange = async (fieldKey, label, event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))) {
            toast.error('Only PDF or image files are allowed');
            event.target.value = '';
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error('File size must be less than 10MB');
            event.target.value = '';
            return;
        }

        setUploadState(prev => ({
            ...prev,
            [fieldKey]: {
                ...prev[fieldKey],
                uploading: true,
                error: null
            }
        }));

        try {
            const response = await ippService.uploadDocument(ippId, file);
            setFormData(prev => ({ ...prev, [fieldKey]: response.fileUrl }));
            setUploadState(prev => ({
                ...prev,
                [fieldKey]: {
                    ...prev[fieldKey],
                    uploading: false,
                    fileName: file.name,
                    fileSize: file.size,
                    fileUrl: response.fileUrl,
                    error: null
                }
            }));
            toast.success(`${label} uploaded successfully`);
        } catch (error) {
            console.error('Upload error:', error);
            const message = error.response?.data?.error || 'Upload failed';
            setUploadState(prev => ({
                ...prev,
                [fieldKey]: {
                    ...prev[fieldKey],
                    uploading: false,
                    error: message
                }
            }));
            toast.error(message);
        } finally {
            if (fileInputRefs.current[fieldKey]) {
                fileInputRefs.current[fieldKey].value = '';
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required URL
        if (formData.internshipReportUrl && !isValidUrl(formData.internshipReportUrl)) {
            toast.error('Please enter a valid URL for Internship Report (must start with http:// or https://)');
            return;
        }

        // Validate optional URLs
        const optionalFields = ['projectDocsUrl', 'certificateUrl', 'offerLetterUrl'];
        for (const field of optionalFields) {
            if (formData[field] && !isValidUrl(formData[field])) {
                const fieldLabel = DOCUMENT_FIELDS.find(f => f.key === field)?.label || field;
                toast.error(`Please enter a valid URL for ${fieldLabel} (must start with http:// or https://)`);
                return;
            }
        }

        setSubmitting(true);

        try {
            const projectDocs = formData.projectDocsUrl
                ? [{
                    title: 'Main Project',
                    fileUrl: formData.projectDocsUrl
                }]
                : [];

            const submissionData = {
                internshipReport: {
                    fileUrl: formData.internshipReportUrl,
                    fileName: 'Internship Report'
                },
                projectDocumentation: projectDocs,
                certificateUrl: formData.certificateUrl,
                offerLetterUrl: formData.offerLetterUrl,
                studentReflection: {
                    keyLearnings: formData.keyLearnings.filter(i => i.trim()),
                    challenges: formData.challenges.filter(i => i.trim()),
                    achievements: formData.achievements.filter(i => i.trim()),
                    futureGoals: formData.futureGoals
                }
            };

            await ippService.submitStudentDocumentation(ippId, submissionData);
            toast.success('Documentation submitted successfully!');
            navigate('/student/dashboard');
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit documentation');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-[80px] pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Button variant="ghost" onClick={() => navigate(`/student/ipp/${ippId}`)} className="mb-6 text-gray-500 hover:text-gray-900 hover:bg-gray-100 pl-0">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to IPP Details
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Submit Your Work</h1>
                    <p className="text-gray-500 mt-2">Upload your internship documents and share your reflection.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Document Links */}
                    <Card className="bg-white border-gray-100 shadow-soft rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Upload className="h-5 w-5 text-primary-600" />
                                </div>
                                Document Links
                            </CardTitle>
                            <CardDescription className="text-gray-500">
                                Provide links to your documents. Ensure they are publicly accessible.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {DOCUMENT_FIELDS.map((field) => (
                                <div key={field.key} className="space-y-2">
                                    <Label htmlFor={field.key} className="text-gray-700 font-medium">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </Label>
                                    <div className="relative flex gap-3">
                                        <div className="relative flex-1">
                                            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id={field.key}
                                                placeholder="https://..."
                                                value={formData[field.key]}
                                                onChange={(e) => handleUrlChange(field.key, e.target.value)}
                                                className="pl-9 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                                                required={field.required}
                                            />
                                        </div>
                                        <input
                                            type="file"
                                            ref={(el) => { fileInputRefs.current[field.key] = el; }}
                                            className="hidden"
                                            accept=".pdf,image/*"
                                            onChange={(e) => handleFileInputChange(field.key, field.label, e)}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRefs.current[field.key]?.click()}
                                            disabled={uploadState[field.key].uploading}
                                            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl"
                                        >
                                            {uploadState[field.key].uploading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Upload className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {uploadState[field.key].fileName && (
                                        <p className="text-xs text-primary-600 font-medium">
                                            Attached: {uploadState[field.key].fileName}
                                            {uploadState[field.key].fileSize && ` (${formatFileSize(uploadState[field.key].fileSize)})`}
                                        </p>
                                    )}
                                    {uploadState[field.key].error && (
                                        <p className="text-xs text-red-500">{uploadState[field.key].error}</p>
                                    )}
                                    <p className="text-xs text-gray-400">{field.helper}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Student Reflection */}
                    <Card className="bg-white border-gray-100 shadow-soft rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                </div>
                                Student Reflection
                            </CardTitle>
                            <CardDescription className="text-gray-500">
                                Reflect on your internship experience.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Key Learnings */}
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Key Learnings</Label>
                                {formData.keyLearnings.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={item}
                                            onChange={(e) => handleArrayInput('keyLearnings', index, e.target.value)}
                                            placeholder="e.g., Learned React.js advanced patterns"
                                            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                                        />
                                        {formData.keyLearnings.length > 1 && (
                                            <Button type="button" variant="outline" size="icon" onClick={() => removeArrayField('keyLearnings', index)} className="border-gray-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl">
                                                &times;
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="ghost" size="sm" onClick={() => addArrayField('keyLearnings')} className="text-primary-600 hover:text-primary-700 hover:bg-blue-50">
                                    + Add Learning
                                </Button>
                            </div>

                            {/* Challenges */}
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Challenges Faced</Label>
                                {formData.challenges.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={item}
                                            onChange={(e) => handleArrayInput('challenges', index, e.target.value)}
                                            placeholder="e.g., Adapting to legacy codebase"
                                            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                                        />
                                        {formData.challenges.length > 1 && (
                                            <Button type="button" variant="outline" size="icon" onClick={() => removeArrayField('challenges', index)} className="border-gray-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl">
                                                &times;
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="ghost" size="sm" onClick={() => addArrayField('challenges')} className="text-primary-600 hover:text-primary-700 hover:bg-blue-50">
                                    + Add Challenge
                                </Button>
                            </div>

                            {/* Achievements */}
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Key Achievements</Label>
                                {formData.achievements.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={item}
                                            onChange={(e) => handleArrayInput('achievements', index, e.target.value)}
                                            placeholder="e.g., Optimized API response time by 20%"
                                            className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                                        />
                                        {formData.achievements.length > 1 && (
                                            <Button type="button" variant="outline" size="icon" onClick={() => removeArrayField('achievements', index)} className="border-gray-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl">
                                                &times;
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="ghost" size="sm" onClick={() => addArrayField('achievements')} className="text-primary-600 hover:text-primary-700 hover:bg-blue-50">
                                    + Add Achievement
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="futureGoals" className="text-gray-700 font-medium">Future Goals</Label>
                                <Input
                                    id="futureGoals"
                                    value={formData.futureGoals}
                                    onChange={(e) => setFormData(prev => ({ ...prev, futureGoals: e.target.value }))}
                                    placeholder="e.g., Pursue full-time backend role"
                                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pb-12">
                        <Button type="submit" size="lg" disabled={submitting} className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-blue-900/10 rounded-xl px-8">
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Documentation'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IPPSubmission;
