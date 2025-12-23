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
    // Modules = Specific Skills (e.g., Python, React, SQL)
    // Checkers = Competency Areas (e.g., Backend, Frontend, DSA)

    const toggleWeakness = (id: number) => {
        setWeaknesses(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
    };

    const activeAlerts = [0, 1, 2, 3].filter(areaId => {
        // Simple logic: if any connected skill is marked as weak, alert the area
        // 0: top left (Backend), 1: top right (DevOps), 2: bottom left (Frontend), 3: bottom right (System Design)
        if (areaId === 0 && (weaknesses.includes(0) || weaknesses.includes(1) || weaknesses.includes(4))) return true;
        if (areaId === 1 && (weaknesses.includes(1) || weaknesses.includes(4))) return true;
        if (areaId === 2 && (weaknesses.includes(2) || weaknesses.includes(4))) return true;
        if (areaId === 3 && (weaknesses.includes(3) || weaknesses.includes(4))) return true;
        return false;
    });

    return (
        <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border border-stone-200 my-8">
            <h3 className="font-serif text-xl mb-4 text-stone-800">Interactive: Skill Gap Analysis</h3>
            <p className="text-sm text-stone-500 mb-6 text-center max-w-md">
                Click the <strong>Skill Nodes</strong> to simulate a weak performance in a mock interview. Watch the AI Flagging System identify the competency gap.
            </p>

            <div className="relative w-64 h-64 bg-[#F5F4F0] rounded-lg border border-stone-200 p-4 flex flex-wrap justify-between content-between relative">
                {/* Grid Lines */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
                    <div className="w-2/3 h-2/3 border border-stone-400"></div>
                    <div className="absolute w-full h-[1px] bg-stone-400"></div>
                    <div className="absolute h-full w-[1px] bg-stone-400"></div>
                </div>

                {/* Competency Areas (Stabilizers) */}
                {[
                    { id: 0, x: '50%', y: '20%', label: 'DSA', color: 'bg-red-500' },
                    { id: 1, x: '20%', y: '50%', label: 'API', color: 'bg-amber-500' },
                    { id: 2, x: '80%', y: '50%', label: 'FE', color: 'bg-blue-500' },
                    { id: 3, x: '50%', y: '80%', label: 'DB', color: 'bg-green-500' },
                ].map(area => (
                    <motion.div
                        key={`area-${area.id}`}
                        className={`absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center text-white text-[10px] font-bold rounded-full shadow-sm transition-all duration-300 ${activeAlerts.includes(area.id) ? area.color + ' opacity-100 scale-110 ring-4 ring-offset-2 ring-stone-200' : 'bg-stone-300 opacity-40'}`}
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
                        className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-lg border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-200 z-10 ${weaknesses.includes(skill.id) ? 'bg-stone-800 border-stone-900 text-nobel-gold' : 'bg-white border-stone-300 hover:border-stone-500 text-stone-500'}`}
                        style={{ left: skill.x, top: skill.y }}
                    >
                        {skill.label}
                    </button>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs font-mono text-stone-500">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-stone-800"></div> Weak Skill</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Gap Detected</div>
            </div>

            <div className="mt-4 h-6 text-sm font-serif italic text-stone-600">
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
        <div className="flex flex-col items-center p-8 bg-[#F5F4F0] rounded-xl border border-stone-200 my-8">
            <h3 className="font-serif text-xl mb-4 text-stone-900">Application Workflow</h3>
            <p className="text-sm text-stone-600 mb-6 text-center max-w-md">
                Automated status tracking from initial application to final offer letter generation.
            </p>

            <div className="relative w-full max-w-lg h-56 bg-white rounded-lg shadow-inner overflow-hidden mb-6 border border-stone-200 flex items-center justify-center gap-4 md:gap-8 p-4">

                {/* Step 1: Apply */}
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-colors duration-500 ${step === 0 ? 'border-nobel-gold bg-nobel-gold/10' : 'border-stone-200 bg-stone-50'}`}>
                        <FileText size={20} className={step === 0 ? 'text-nobel-gold' : 'text-stone-300'} />
                    </div>
                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-stone-500">Apply</span>
                </div>

                <motion.div animate={{ opacity: step >= 1 ? 1 : 0.3 }}>→</motion.div>

                {/* Step 2: AI Screening */}
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-colors duration-500 ${step === 1 ? 'border-stone-800 bg-stone-900' : 'border-stone-200 bg-stone-50'}`}>
                        <Cpu size={20} className={step === 1 ? 'text-nobel-gold animate-pulse' : 'text-stone-300'} />
                    </div>
                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-stone-500">AI Screen</span>
                </div>

                <motion.div animate={{ opacity: step >= 2 ? 1 : 0.3 }}>→</motion.div>

                {/* Step 3: Interview */}
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-colors duration-500 ${step === 2 ? 'border-blue-500 bg-blue-50' : 'border-stone-200 bg-stone-50'}`}>
                        <Calendar size={20} className={step === 2 ? 'text-blue-600' : 'text-stone-300'} />
                    </div>
                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-stone-500">Interview</span>
                </div>

                <motion.div animate={{ opacity: step >= 3 ? 1 : 0.3 }}>→</motion.div>

                {/* Step 4: Offer */}
                <div className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-colors duration-500 ${step === 3 ? 'border-green-500 bg-green-50' : 'border-stone-200 bg-stone-50'}`}>
                        <CheckCircle size={20} className={step === 3 ? 'text-green-600' : 'text-stone-300'} />
                    </div>
                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-stone-500">Placed</span>
                </div>

            </div>

            <div className="flex gap-2">
                {[0, 1, 2, 3].map(s => (
                    <div key={s} className={`h-1 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-nobel-gold' : 'w-2 bg-stone-300'}`}></div>
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
        <div className="flex flex-col md:flex-row gap-8 items-center p-8 bg-stone-900 text-stone-100 rounded-xl my-8 border border-stone-800 shadow-lg">
            <div className="flex-1 min-w-[240px]">
                <h3 className="font-serif text-xl mb-2 text-nobel-gold">Placement Analytics</h3>
                <p className="text-stone-400 text-sm mb-4 leading-relaxed">
                    Compare the effectiveness of the CampusBuddy placement ecosystem against traditional manual placement cells.
                </p>
                <div className="flex gap-2 mt-6 flex-wrap">
                    {(['Salary', 'Placed %'] as const).map((d) => (
                        <button
                            key={d}
                            onClick={() => setView(d)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 border ${view === d ? 'bg-nobel-gold text-stone-900 border-nobel-gold' : 'bg-transparent text-stone-400 border-stone-700 hover:border-stone-500 hover:text-stone-200'}`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
                <div className="mt-6 font-mono text-xs text-stone-500 flex items-center gap-2">
                    <BarChart2 size={14} className="text-nobel-gold" />
                    <span>LIVE DASHBOARD PREVIEW</span>
                </div>
            </div>

            <div className="relative w-64 h-72 bg-stone-800/50 rounded-xl border border-stone-700/50 p-6 flex justify-around items-end">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none opacity-10">
                    <div className="w-full h-[1px] bg-stone-400"></div>
                    <div className="w-full h-[1px] bg-stone-400"></div>
                    <div className="w-full h-[1px] bg-stone-400"></div>
                    <div className="w-full h-[1px] bg-stone-400"></div>
                </div>

                {/* Market Bar */}
                <div className="w-20 flex flex-col justify-end items-center h-full z-10">
                    <div className="flex-1 w-full flex items-end justify-center relative mb-3">
                        <div className="absolute -top-6 w-full text-center text-xs font-mono text-stone-400 font-bold bg-stone-900/90 py-1 rounded backdrop-blur-sm border border-stone-700/50 shadow-sm">{currentData.avg} {currentData.suffix}</div>
                        <motion.div
                            className="w-full bg-stone-600 rounded-t-md border-t border-x border-stone-500/30"
                            initial={{ height: 0 }}
                            animate={{ height: `${(currentData.avg / maxVal) * 100}%` }}
                            transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        />
                    </div>
                    <div className="h-6 flex items-center text-[10px] font-bold text-stone-500 uppercase tracking-wider text-center">Manual Process</div>
                </div>

                {/* Nexus Bar */}
                <div className="w-20 flex flex-col justify-end items-center h-full z-10">
                    <div className="flex-1 w-full flex items-end justify-center relative mb-3">
                        <div className="absolute -top-6 w-full text-center text-xs font-mono text-nobel-gold font-bold bg-stone-900/90 py-1 rounded backdrop-blur-sm border border-nobel-gold/30 shadow-sm">{currentData.campusBuddy} {currentData.suffix}</div>
                        <motion.div
                            className="w-full bg-nobel-gold rounded-t-md shadow-[0_0_20px_rgba(197,160,89,0.25)] relative overflow-hidden"
                            initial={{ height: 0 }}
                            animate={{ height: Math.max(1, (currentData.campusBuddy / maxVal) * 100) + '%' }}
                            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.1 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20"></div>
                        </motion.div>
                    </div>
                    <div className="h-6 flex items-center text-[10px] font-bold text-nobel-gold uppercase tracking-wider text-center">CampusBuddy</div>
                </div>
            </div>
        </div>
    )
}