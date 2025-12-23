import React from 'react';
import { GapAnalysis } from '../types';
import { Loader2, Zap, Target, BookOpen } from 'lucide-react';

interface AnalysisResultProps {
  analysis: GapAnalysis | null;
  loading: boolean;
  hasWeakness: boolean;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, loading, hasWeakness }) => {
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400 min-h-[300px]">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
        <p className="text-sm font-medium uppercase tracking-widest">Analyzing Gaps...</p>
      </div>
    );
  }

  if (!hasWeakness) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 min-h-[300px] text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-green-600" fill="currentColor" />
        </div>
        <h3 className="text-slate-800 font-bold text-xl mb-2">Ready to Interview</h3>
        <p className="text-slate-500 max-w-xs leading-relaxed">
          Select the nodes on the left to simulate skill gaps you might have.
        </p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="h-full flex flex-col animate-fade-in justify-center">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Assessment</h3>
            <span className={`
                px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                ${analysis.status === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : 
                  analysis.status === 'Moderate' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                  'bg-green-50 text-green-600 border-green-100'}
            `}>
                {analysis.status} Risk
            </span>
        </div>
        <p className="text-xl font-medium text-slate-800 leading-snug">
            {analysis.summary}
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h4 className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">
                <Target size={14} /> Recommended Focus
            </h4>
            <p className="text-slate-700 font-medium">{analysis.recommendedFocus}</p>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                <BookOpen size={14} /> Missing Concepts
            </h4>
            <div className="flex flex-wrap gap-2">
                {analysis.missingConcepts.map((concept, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-slate-200 text-sm text-slate-600">
                        {concept}
                    </span>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};