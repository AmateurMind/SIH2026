import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Download, Printer, AlertCircle, Loader2 } from 'lucide-react';
import ResumePreview from '../components/resume/ResumePreview';

const PublicResume = () => {
    const { resumeId } = useParams();
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPublicResume();
    }, [resumeId]);

    const fetchPublicResume = async () => {
        try {
            const response = await axios.get(`/resume-management/public/${resumeId}`);
            if (response.data.success) {
                setResume(response.data.resume);
            }
        } catch (err) {
            console.error('Error fetching public resume:', err);
            if (err.response && err.response.status === 403) {
                setError('This resume is private.');
            } else if (err.response && err.response.status === 404) {
                setError('Resume not found.');
            } else {
                setError('Failed to load resume. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <a
                        href="/"
                        className="inline-block px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col print:bg-white">
            {/* Header (Hidden in Print) */}
            <header className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm print:hidden sticky top-0 z-30">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="font-bold text-xl text-gray-800">
                        {resume.personalInfo?.fullName}'s Resume
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Printer size={18} />
                        <span className="hidden sm:inline">Print / Download PDF</span>
                    </button>
                </div>
            </header>

            {/* Resume Display */}
            <main className="flex-1 p-8 print:p-0 overflow-auto">
                <div className="max-w-[8.5in] mx-auto shadow-2xl print:shadow-none">
                    <ResumePreview
                        resumeData={resume}
                        template={resume.template}
                        accentColor={resume.accentColor}
                    />
                </div>
            </main>

            <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { background: white; }
          header { display: none !important; }
          main { padding: 0 !important; overflow: visible !important; }
        }
      `}</style>
        </div>
    );
};

export default PublicResume;
