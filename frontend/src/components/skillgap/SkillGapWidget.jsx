import React, { useState, useEffect, useCallback } from 'react';
import { Network } from 'lucide-react';
import { SkillGraph } from './SkillGraph';
import { AnalysisResult } from './AnalysisResult';
import { analyzeSkillGap } from '../../skillgap-ai/services/geminiService';

const INITIAL_SKILLS = [
    { id: 'py', label: 'Python', category: 'core' },
    { id: 'dsa', label: 'DSA', category: 'core' },
    { id: 'js', label: 'JS', category: 'frontend' },
    { id: 'api', label: 'API', category: 'backend' },
    { id: 'arch', label: 'Arch', category: 'core' },
    { id: 'fe', label: 'Frontend', category: 'frontend' },
    { id: 'sql', label: 'SQL', category: 'data' },
    { id: 'db', label: 'DB', category: 'data' },
    { id: 'react', label: 'React', category: 'frontend' },
];

const SkillGapWidget = () => {
    const [weakSkills, setWeakSkills] = useState(new Set());
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    // Debounced Analysis
    useEffect(() => {
        if (weakSkills.size === 0) {
            setAnalysis(null);
            return;
        }

        // Debug Logging
        console.log(`[SkillGap] Active Keys (Weak Skills): ${weakSkills.size}`, Array.from(weakSkills));

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const result = await analyzeSkillGap(INITIAL_SKILLS, Array.from(weakSkills));
                setAnalysis(result);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [weakSkills]);

    const toggleSkill = useCallback((id) => {
        setWeakSkills(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
                console.log(`[SkillGap] Removed key: ${id}`);
            } else {
                newSet.add(id);
                console.log(`[SkillGap] Added key: ${id}`);
            }
            return newSet;
        });
    }, []);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg">
                            <Network size={18} />
                        </span>
                        <h2 className="text-xl font-bold text-gray-900">SkillGap AI</h2>
                    </div>
                    <p className="text-sm text-gray-500">Tap skills to identify gaps</p>
                </div>
                {analysis && (
                    <div className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                        AI Active
                    </div>
                )}
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-5 gap-6 flex-1 min-h-[400px]">
                {/* Interactive Graph */}
                <div className="lg:col-span-3 bg-slate-50/50 rounded-xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-4 left-4 z-10 flex gap-4 text-xs font-semibold text-slate-400 uppercase tracking-widest pointer-events-none">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-slate-300"></div> Strong
                        </div>
                    </div>
                    <SkillGraph
                        skills={INITIAL_SKILLS}
                        weakSkills={weakSkills}
                        toggleSkill={toggleSkill}
                    />
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-2">
                    <AnalysisResult
                        analysis={analysis}
                        loading={loading}
                        hasWeakness={weakSkills.size > 0}
                    />
                </div>
            </div>


        </div>
    );
};

export default SkillGapWidget;
