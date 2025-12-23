/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, BarChart2, AlertTriangle, Code, CheckCircle, FileText, Calendar, Users, Briefcase } from 'lucide-react';

// --- SKILL ASSESSMENT MATRIX ---
export const SurfaceCodeDiagram: React.FC = () => {
    // Grid of Skill Nodes
    const [weaknesses, setWeaknesses] = useState<number[]>([]);

    // Adjacency logic simulated for visual effect
    const toggleWeakness = (id: number) => {
        setWeaknesses(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
    };

    const activeAlerts = [0, 1, 2, 3].filter(areaId => {
        if (areaId === 0 && (weaknesses.includes(0) || weaknesses.includes(1) || weaknesses.includes(4))) return true;
        if (areaId === 1 && (weaknesses.includes(1) || weaknesses.includes(4))) return true;
        if (areaId === 2 && (weaknesses.includes(2) || weaknesses.includes(4))) return true;
        if (areaId === 3 && (weaknesses.includes(3) || weaknesses.includes(4))) return true;
        return false;
    });

    return (
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg border border-slate-100 my-8">
            <h3 className="font-bold text-xl mb-4 text-slate-800">Interactive: Skill Gap Analysis</h3>
            <p className="text-sm text-slate-500 mb-6 text-center max-w-md">
                Click the <strong>Skill Nodes</strong> to simulate a weak performance in a mock interview. Watch the AI Flagging System identify the competency gap.
            </p>

            <div className="relative w-64 h-64 bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-wrap justify-between content-between relative">
                {/* Grid Lines */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
                    <div className="w-2/3 h-2/3 border border-slate-400"></div>
                    <div className="absolute w-full h-[1px] bg-slate-400"></div>
                    <div className="absolute h-full w-[1px] bg-slate-400"></div>
                </div>

                {/* Competency Areas (Stabilizers) */}
                {[
                    { id: 0, x: '50%', y: '20%', label: 'DSA', color: 'bg-rose-500' },
                    { id: 1, x: '20%', y: '50%', label: 'API', color: 'bg-amber-500' },
                    { id: 2, x: '80%', y: '50%', label: 'FE', color: 'bg-blue-500' },
                    { id: 3, x: '50%', y: '80%', label: 'DB', color: 'bg-emerald-500' },
                ].map(area => (
                    <motion.div
                        key={`area-${area.id}`}
                        className={`absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center text-white text-[10px] font-bold rounded-full shadow-lg transition-all duration-300 z-20 ${activeAlerts.includes(area.id) ? area.color + ' opacity-100 scale-110 ring-4 ring-offset-2 ring-white' : 'bg-slate-300 opacity-40'}`}
                        style={{ left: area.x, top: area.y }}
                    >
                        {activeAlerts.includes(area.id) ? "FLAG" : area.label}
                    </motion.div>
                ))}

                {/* Specific Skills (Qubits) */}
                {[
                    { id: 0, x: '20%', y: '20%', label: 'Py' },
                    { id: 1, x: '80%', y: '20%', label: 'JS' },
                    { id: 4, x: '50%', y: '50%', label: 'Arch' }, // Center
                    { id: 2, x: '20%', y: '80%', label: 'SQL' },
                    { id: 3, x: '80%', y: '80%', label: 'React' },
                ].map(skill => (
                    <button
                        key={`skill-${skill.id}`}
                        onClick={() => toggleWeakness(skill.id)}
                        className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-lg border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-200 z-10 ${weaknesses.includes(skill.id) ? 'bg-slate-800 border-slate-900 text-white' : 'bg-white border-slate-200 hover:border-blue-400 text-slate-500 hover:text-blue-500'}`}
                        style={{ left: skill.x, top: skill.y }}
                    >
                        {skill.label}
                    </button>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs font-mono text-slate-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-800"></div> Weak Skill</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Gap Detected</div>
            </div>

            <div className="mt-4 h-6 text-sm font-medium italic text-slate-600">
                {weaknesses.length === 0 ? "Candidate Profile Strong." : `AI Recommendation: Review ${activeAlerts.length} Modules.`}
            </div>
        </div>
    );
};

// --- PLACEMENT PIPELINE DIAGRAM ---
export const TransformerDecoderDiagram: React.FC = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep(s => (s + 1) % 4);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center p-8 bg-slate-900 rounded-2xl border border-slate-800 my-8 shadow-2xl">
            <h3 className="font-bold text-xl mb-4 text-white">Application Workflow</h3>
            <p className="text-sm text-slate-400 mb-6 text-center max-w-md">
                Automated status tracking from initial application to final offer letter generation.
            </p>

            <div className="relative w-full max-w-lg h-56 bg-slate-800 rounded-xl overflow-hidden mb-6 border border-slate-700 flex items-center justify-center gap-4 md:gap-8 p-4">

                {/* Step 1: Apply */}
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-colors duration-500 ${step === 0 ? 'border-blue-500 bg-blue-500/20' : 'border-slate-700 bg-slate-800'}`}>
                        <FileText size={20} className={step === 0 ? 'text-blue-400' : 'text-slate-600'} />
                    </div>
                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-slate-500">Apply</span>
                </div>

                <motion.div animate={{ opacity: step >= 1 ? 1 : 0.3 }} className="text-slate-600">→</motion.div>

                {/* Step 2: AI Screening */}
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-colors duration-500 ${step === 1 ? 'border-purple-500 bg-purple-500/20' : 'border-slate-700 bg-slate-800'}`}>
                        <Cpu size={20} className={step === 1 ? 'text-purple-400 animate-pulse' : 'text-slate-600'} />
                    </div>
                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-slate-500">AI Screen</span>
                </div>

                <motion.div animate={{ opacity: step >= 2 ? 1 : 0.3 }} className="text-slate-600">→</motion.div>

                {/* Step 3: Interview */}
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-colors duration-500 ${step === 2 ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-700 bg-slate-800'}`}>
                        <Calendar size={20} className={step === 2 ? 'text-indigo-400' : 'text-slate-600'} />
                    </div>
                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-slate-500">Interview</span>
                </div>

                <motion.div animate={{ opacity: step >= 3 ? 1 : 0.3 }} className="text-slate-600">→</motion.div>

                {/* Step 4: Offer */}
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-colors duration-500 ${step === 3 ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-700 bg-slate-800'}`}>
                        <CheckCircle size={20} className={step === 3 ? 'text-emerald-400' : 'text-slate-600'} />
                    </div>
                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-slate-500">Placed</span>
                </div>

            </div>

            <div className="flex gap-2">
                {[0, 1, 2, 3].map(s => (
                    <div key={s} className={`h-1 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'}`}></div>
                ))}
            </div>
        </div>
    );
};

// --- PLACEMENT STATISTICS CHART ---
export const PerformanceMetricDiagram: React.FC = () => {
    const [view, setView] = useState<'Salary' | 'Placed %'>('Salary');

    // Values represent Average Salary in LPA (Lakhs Per Annum)
    const data = {
        'Salary': { avg: 4.5, campusBuddy: 9.8, suffix: 'LPA' },
        'Placed %': { avg: 60, campusBuddy: 94, suffix: '%' },
    };

    const currentData = data[view];
    const maxVal = view === 'Salary' ? 12 : 100;

    return (
        <div className="flex flex-col md:flex-row gap-8 items-center p-8 bg-white text-slate-800 rounded-2xl my-8 border border-slate-200 shadow-xl">
            <div className="flex-1 min-w-[240px]">
                <h3 className="font-bold text-xl mb-2 text-blue-600">Placement Analytics</h3>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                    Compare the effectiveness of the CampusBuddy placement ecosystem against traditional manual placement cells.
                </p>
                <div className="flex gap-2 mt-6 flex-wrap">
                    {(['Salary', 'Placed %'] as const).map((d) => (
                        <button
                            key={d}
                            onClick={() => setView(d)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${view === d ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'}`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
                <div className="mt-6 font-mono text-xs text-slate-400 flex items-center gap-2">
                    <BarChart2 size={14} className="text-blue-500" />
                    <span>LIVE DASHBOARD PREVIEW</span>
                </div>
            </div>

            <div className="relative w-64 h-72 bg-slate-50 rounded-xl border border-slate-100 p-6 flex justify-around items-end">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="w-full h-[1px] bg-slate-300"></div>
                    <div className="w-full h-[1px] bg-slate-300"></div>
                    <div className="w-full h-[1px] bg-slate-300"></div>
                    <div className="w-full h-[1px] bg-slate-300"></div>
                </div>

                {/* Market Bar */}
                <div className="w-20 flex flex-col justify-end items-center h-full z-10">
                    <div className="flex-1 w-full flex items-end justify-center relative mb-3">
                        <div className="absolute -top-8 w-full text-center text-xs font-mono text-slate-500 font-bold py-1">{currentData.avg} {currentData.suffix}</div>
                        <motion.div
                            className="w-full bg-slate-300 rounded-t-md"
                            initial={{ height: 0 }}
                            animate={{ height: `${(currentData.avg / maxVal) * 100}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        />
                    </div>
                    <div className="h-6 flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Manual</div>
                </div>

                {/* Nexus Bar */}
                <div className="w-20 flex flex-col justify-end items-center h-full z-10">
                    <div className="flex-1 w-full flex items-end justify-center relative mb-3">
                        <div className="absolute -top-8 w-full text-center text-xs font-mono text-blue-600 font-bold py-1 scale-110">{currentData.campusBuddy} {currentData.suffix}</div>
                        <motion.div
                            className="w-full bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-md shadow-lg shadow-blue-500/30 relative overflow-hidden"
                            initial={{ height: 0 }}
                            animate={{ height: Math.max(1, (currentData.campusBuddy / maxVal) * 100) + '%' }}
                            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.1 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20"></div>
                        </motion.div>
                    </div>
                    <div className="h-6 flex items-center text-[10px] font-bold text-blue-600 uppercase tracking-wider text-center">CampusBuddy</div>
                </div>
            </div>
        </div>
    )
}