import React, { useState } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';

const SkillsForm = ({ skills, onChange, onAiSuggest }) => {
    const [newSkill, setNewSkill] = useState('');

    const handleAddSkill = () => {
        if (newSkill.trim()) {
            const currentSkills = Array.isArray(skills) ? skills : [];
            if (!currentSkills.includes(newSkill.trim())) {
                onChange([...currentSkills, newSkill.trim()]);
            }
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        const currentSkills = Array.isArray(skills) ? skills : [];
        onChange(currentSkills.filter(skill => skill !== skillToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const skillList = Array.isArray(skills) ? skills : [];

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">Skills</h3>
                {onAiSuggest && (
                    <button
                        onClick={onAiSuggest}
                        className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        <Sparkles size={14} /> Suggest Skills
                    </button>
                )}
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a skill (e.g. React, Python, Leadership)"
                        className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                    />
                    <button
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                        className="px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                    >
                        Add
                    </button>
                </div>

                {skillList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {skillList.map((skill, index) => (
                            <div
                                key={index}
                                className="group flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                            >
                                <span>{skill}</span>
                                <button
                                    onClick={() => handleRemoveSkill(skill)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500 text-xs">
                        No skills added yet. Add skills to highlight your expertise.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillsForm;
