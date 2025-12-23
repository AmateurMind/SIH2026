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
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Skills</h3>
                {onAiSuggest && (
                    <button
                        onClick={onAiSuggest}
                        className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        <Sparkles size={16} /> Suggest Skills
                    </button>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a skill (e.g. React, Python, Leadership)"
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                    <button
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        Add
                    </button>
                </div>

                {skillList.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {skillList.map((skill, index) => (
                            <div
                                key={index}
                                className="group flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                <span>{skill}</span>
                                <button
                                    onClick={() => handleRemoveSkill(skill)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No skills added yet. Add skills to highlight your expertise.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillsForm;
