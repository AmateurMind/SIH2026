import React, { useState, useEffect, useCallback } from 'react';
import { Skill, GapAnalysis } from './types';
import { SkillGraph } from './components/SkillGraph';
import { AnalysisResult } from './components/AnalysisResult';
import { analyzeSkillGap } from './services/geminiService';
import { Network } from 'lucide-react';

const INITIAL_SKILLS: Skill[] = [
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

const App: React.FC = () => {
  const [weakSkills, setWeakSkills] = useState<Set<string>>(new Set());
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounced Analysis
  useEffect(() => {
    if (weakSkills.size === 0) {
        setAnalysis(null);
        return;
    }
    
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

  const toggleSkill = useCallback((id: string) => {
    setWeakSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4">
      
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg shadow-indigo-200">
                <Network size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SkillGap.AI</h1>
        </div>
        <p className="text-slate-500 text-sm">Tap the skills you are struggling with to generate a study plan.</p>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="grid lg:grid-cols-5 min-h-[500px]">
            
            {/* Left Panel: Interactive Graph */}
            <div className="lg:col-span-3 p-8 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/30 flex flex-col items-center justify-center relative">
                <SkillGraph 
                    skills={INITIAL_SKILLS} 
                    weakSkills={weakSkills} 
                    toggleSkill={toggleSkill} 
                />
                
                <div className="mt-4 flex gap-6 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div> Strong
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div> Gap
                    </div>
                </div>
            </div>

            {/* Right Panel: Results */}
            <div className="lg:col-span-2 p-8 bg-white flex flex-col">
                 <AnalysisResult 
                    analysis={analysis} 
                    loading={loading}
                    hasWeakness={weakSkills.size > 0}
                 />
            </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-slate-400">
        Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
};

export default App;