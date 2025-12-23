import React from 'react';
import { Loader2, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';

export const AnalysisResult = ({ analysis, loading, hasWeakness }) => {
    if (!hasWeakness) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Identify Your Gaps</h3>
                <p className="max-w-xs text-sm">Tap on the skills (circles) connected to your target role where you feel least confident.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Analyzing skill matrix...</p>
                <p className="text-xs text-slate-400 mt-2">Connecting to Gemini AI</p>
            </div>
        );
    }

    if (!analysis) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Strong': return 'text-green-600 bg-green-50 border-green-100';
            case 'Moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
            case 'Critical': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header Status */}
            <div className={`p-4 rounded-xl border flex items-start gap-4 ${getStatusColor(analysis.status)}`}>
                {analysis.status === 'Strong' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
                <div>
                    <h4 className="font-bold text-lg mb-1">{analysis.status} Impact</h4>
                    <p className="text-sm opacity-90 leading-relaxed">{analysis.summary}</p>
                </div>
            </div>

            {/* Missing Concepts */}
            <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Concepts Missing</h5>
                <div className="flex flex-wrap gap-2">
                    {analysis.missingConcepts.map((concept, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full border border-slate-200">
                            {concept}
                        </span>
                    ))}
                </div>
            </div>

            {/* Recommendation */}
            <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold">
                    <BookOpen className="w-4 h-4" />
                    <h3>Immediate Focus</h3>
                </div>
                <p className="text-indigo-900 text-sm leading-relaxed mb-3">
                    {analysis.recommendedFocus}
                </p>
                <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(analysis.recommendedFocus + " tutorial")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                    Watch Tutorials
                </a>
            </div>
        </div>
    );
};
