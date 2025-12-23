import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Copy, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import toast from 'react-hot-toast';
import axios from 'axios';

const SendEvaluationRequest = () => {
    const { ippId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [magicLink, setMagicLink] = useState('');
    const [formData, setFormData] = useState({
        mentorName: '',
        mentorEmail: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`/ipp/${ippId}/send-evaluation-request`, {
                mentorName: formData.mentorName,
                mentorEmail: formData.mentorEmail
            });

            setMagicLink(response.data.magicLink);
            toast.success('Evaluation request sent! Magic link generated.');
        } catch (error) {
            console.error('Error sending evaluation request:', error);
            toast.error(error.response?.data?.error || 'Failed to send evaluation request');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(magicLink);
        toast.success('Magic link copied to clipboard!');
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-blue-600" />
                        Send Evaluation Request
                    </CardTitle>
                    <CardDescription>
                        Generate a magic link for the company mentor to evaluate this internship.
                        The link will be valid for 7 days.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!magicLink ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="mentorName">Mentor Name *</Label>
                                <Input
                                    id="mentorName"
                                    value={formData.mentorName}
                                    onChange={(e) => setFormData({ ...formData, mentorName: e.target.value })}
                                    placeholder="e.g. John Smith"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mentorEmail">Mentor Email *</Label>
                                <Input
                                    id="mentorEmail"
                                    type="email"
                                    value={formData.mentorEmail}
                                    onChange={(e) => setFormData({ ...formData, mentorEmail: e.target.value })}
                                    placeholder="john.smith@company.com"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? 'Generating Link...' : 'Generate Magic Link'}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">Magic link generated successfully!</span>
                            </div>

                            <div className="space-y-2">
                                <Label>Magic Link (Valid for 7 days)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={magicLink}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={copyToClipboard}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Share this link with the company mentor to complete their evaluation.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(magicLink, '_blank')}
                                    className="flex-1"
                                >
                                    Open Link
                                </Button>
                                <Button
                                    onClick={() => navigate(-1)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="mt-6 bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <h4 className="font-medium text-blue-900 mb-2">For Testing:</h4>
                    <p className="text-sm text-blue-800">
                        IPP ID: <code className="bg-blue-100 px-2 py-1 rounded">{ippId}</code>
                    </p>
                    <p className="text-sm text-blue-700 mt-2">
                        Once you generate the magic link, you can open it directly to test the mentor evaluation form.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default SendEvaluationRequest;
