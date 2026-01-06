import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Building, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ippService from '../../services/ippService';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import IPPStatusBadge from '../../components/ipp/IPPStatusBadge';
import toast from 'react-hot-toast';

const StudentIPPDashboard = () => {
    const { user } = useAuth();
    const [ipps, setIpps] = useState([]);
    const [eligibleInternships, setEligibleInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(null);

    useEffect(() => {
        fetchData();
    }, [user.id]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch existing IPPs
            const ippsResponse = await ippService.getStudentIPPs(user.id);
            setIpps(ippsResponse.data);

            // 2. Fetch applications to find eligible internships
            // We want applications that are 'accepted' but don't have an IPP yet
            const appsResponse = await axios.get('/applications');
            const applications = appsResponse.data.applications || [];

            // Create a Set of internship IDs that already have an IPP
            const existingIppInternshipIds = new Set(ippsResponse.data.map(ipp => ipp.internshipId));

            const eligible = applications.filter(app =>
                (app.status === 'accepted' || app.status === 'offered' || app.status === 'hired' || app.status === 'completed') &&
                // Check if directly linked in app data
                (!app.ippId || app.ippStatus === 'pending_creation' || app.ippStatus === 'not_applicable') &&
                // EXTRA CHECK: Verify we don't already have an IPP for this internship
                !existingIppInternshipIds.has(app.internshipId)
            );

            setEligibleInternships(eligible);

        } catch (error) {
            console.error('Error fetching IPP data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateIPP = async (application) => {
        try {
            setCreating(application.id);

            const response = await ippService.createIPP({
                studentId: user.id,
                internshipId: application.internshipId,
                applicationId: application.id
            });

            toast.success('IPP initialized successfully!');

            // Refresh data
            fetchData();

        } catch (error) {
            console.error('Error creating IPP:', error);
            toast.error(error.response?.data?.error || 'Failed to create IPP');
        } finally {
            setCreating(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-[30px] pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Internship Performance Passports</h1>
                        <p className="mt-2 text-slate-600">Manage your verified internship credentials and performance reports.</p>
                    </div>
                </div>

                {/* Eligible Internships Section */}
                {eligibleInternships.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                                <Plus className="h-5 w-5 text-blue-600" />
                            </div>
                            Start New Passport
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {eligibleInternships.map((app) => (
                                <Card key={app.id} className="bg-white border-slate-100 shadow-soft hover:shadow-soft-hover transition-all duration-300 rounded-2xl overflow-hidden group">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div className="bg-blue-50 p-2.5 rounded-xl group-hover:bg-blue-100 transition-colors">
                                                <Building className="h-6 w-6 text-blue-600" />
                                            </div>
                                        </div>
                                        <CardTitle className="mt-4 text-lg font-bold text-slate-900">{app.internship?.title || 'Internship'}</CardTitle>
                                        <CardDescription className="text-slate-600">{app.internship?.company || 'Company'}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-slate-600 mb-6">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                <span>Accepted on {new Date(app.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleCreateIPP(app)}
                                            disabled={creating === app.id}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 shadow-sm"
                                        >
                                            {creating === app.id ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Initializing...
                                                </>
                                            ) : (
                                                'Initialize IPP'
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Active IPPs Section */}
                <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        My Passports
                    </h2>

                    {ipps.length === 0 ? (
                        <Card className="bg-white border-slate-200 border-dashed shadow-sm rounded-2xl">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="bg-slate-50 p-4 rounded-full mb-4">
                                    <FileText className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">No Passports Yet</h3>
                                <p className="text-slate-600 mt-1 max-w-sm">
                                    Once you complete an internship, you can create a passport to get verified credentials and certificates.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {ipps.map((ipp) => {
                                // Status Logic
                                const isStep1Complete = true; // Application always done if IPP exists
                                const isStep2Active = ipp.status === 'pending_mentor_eval';
                                const isStep2Complete = ['pending_student_submission', 'verified', 'published'].includes(ipp.status);
                                const isStep3Active = ipp.status === 'pending_student_submission';
                                const isStep3Complete = ['verified', 'published'].includes(ipp.status);

                                // Helper Text
                                let statusHelpText = '';
                                let helpTextType = 'neutral';
                                if (ipp.status === 'pending_mentor_eval') {
                                    statusHelpText = 'Waiting for Company Mentor to submit evaluation.';
                                    helpTextType = 'waiting';
                                } else if (ipp.status === 'pending_student_submission') {
                                    statusHelpText = 'Mentor evaluation complete. Action Required: Submit your final report.';
                                    helpTextType = 'action';
                                } else if (['verified', 'published'].includes(ipp.status)) {
                                    statusHelpText = 'Passport verified and complete. Certificate generated.';
                                    helpTextType = 'success';
                                } else if (ipp.status === 'draft') {
                                    statusHelpText = 'Passport initialized.';
                                }

                                return (
                                    <div key={ipp.ippId}>
                                        <Card className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group">
                                            <CardContent className="p-0">
                                                {/* Card Header Section */}
                                                <div className="p-6 pb-4">
                                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                                        <div className="flex gap-5">
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${['verified', 'published'].includes(ipp.status) ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                                <Building className="h-7 w-7" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-3 flex-wrap mb-1">
                                                                    <h3 className="text-xl font-bold text-slate-900">
                                                                        {ipp.internshipDetails?.role || 'Intern Role'}
                                                                    </h3>
                                                                    <IPPStatusBadge status={ipp.status} />
                                                                </div>
                                                                <p className="text-slate-600 font-medium text-base">
                                                                    {ipp.internshipDetails?.company || 'Company Name'}
                                                                </p>
                                                                <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                                                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                                                        <span className="text-slate-600">{new Date(ipp.createdAt).toLocaleDateString()}</span>
                                                                    </span>
                                                                    <span className="font-mono text-xs text-slate-400">ID: {ipp.ippId}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Action Button */}
                                                        <div className="flex items-center">
                                                            <Link to={ipp.status === 'pending_student_submission' ? `/student/ipp/${ipp.ippId}/submit` : `/student/ipp/${ipp.ippId}`}>
                                                                <Button
                                                                    className={`rounded-xl shadow-none transition-all ${ipp.status === 'pending_student_submission'
                                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white px-6'
                                                                        : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                                                                        }`}
                                                                >
                                                                    {ipp.status === 'pending_student_submission' ? 'Complete Submission' : 'View Details'}
                                                                    <ChevronRight className={`ml-2 h-4 w-4 ${ipp.status === 'pending_student_submission' ? '' : 'text-slate-400'}`} />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>


                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            })
                            }
                        </div>
                    )}
                </section>
            </div >
        </div >
    );
};

export default StudentIPPDashboard;
