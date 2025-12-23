import React from 'react';
import { Plus, Trash2, GripVertical, Calendar, MapPin, Building } from 'lucide-react';

const ExperienceForm = ({ experience, onChange, onAiEnhance }) => {
    const handleChange = (index, field, value) => {
        const newExperience = [...experience];
        newExperience[index] = { ...newExperience[index], [field]: value };
        onChange(newExperience);
    };

    const addExperience = () => {
        onChange([
            ...experience,
            {
                company: '',
                jobTitle: '',
                startDate: '',
                endDate: '',
                current: false,
                location: '',
                description: ''
            }
        ]);
    };

    const removeExperience = (index) => {
        const newExperience = experience.filter((_, i) => i !== index);
        onChange(newExperience);
    };

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">Work Experience</h3>
                <button
                    onClick={addExperience}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:text-primary-800 transition-colors bg-primary-50 px-2 py-1 rounded-lg hover:bg-primary-100 border border-primary-200"
                >
                    <Plus size={14} /> Add Experience
                </button>
            </div>

            {experience.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-2 text-xs">No experience added yet</p>
                    <button
                        onClick={addExperience}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Add Your First Role
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {experience.map((exp, index) => (
                    <div
                        key={index}
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2 text-gray-500">
                                <GripVertical size={14} className="cursor-move" />
                                <span className="text-xs font-medium">Role {index + 1}</span>
                            </div>
                            <button
                                onClick={() => removeExperience(index)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                title="Remove role"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600 uppercase">Job Title</label>
                                <input
                                    type="text"
                                    value={exp.jobTitle}
                                    onChange={(e) => handleChange(index, 'jobTitle', e.target.value)}
                                    placeholder="Software Engineer"
                                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600 uppercase">Company</label>
                                <div className="relative">
                                    <Building size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => handleChange(index, 'company', e.target.value)}
                                        placeholder="Google"
                                        className="w-full pl-8 pr-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600 uppercase">Start Date</label>
                                <div className="relative">
                                    <Calendar size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={exp.startDate}
                                        onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                                        placeholder="MM/YYYY"
                                        className="w-full pl-8 pr-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600 uppercase">End Date</label>
                                <div className="relative">
                                    <Calendar size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={exp.endDate}
                                        onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                                        placeholder={exp.current ? 'Present' : 'MM/YYYY'}
                                        disabled={exp.current}
                                        className={`w-full pl-8 pr-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400 ${exp.current ? 'opacity-50 bg-gray-50' : ''
                                            }`}
                                    />
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <input
                                        type="checkbox"
                                        id={`current-${index}`}
                                        checked={exp.current}
                                        onChange={(e) => handleChange(index, 'current', e.target.checked)}
                                        className="rounded text-primary-600 focus:ring-primary-500 w-3.5 h-3.5 border-gray-300"
                                    />
                                    <label htmlFor={`current-${index}`} className="text-[10px] text-gray-600 cursor-pointer">
                                        I currently work here
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <label className="text-[10px] font-medium text-gray-600 uppercase">Location</label>
                                <div className="relative">
                                    <MapPin size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={exp.location}
                                        onChange={(e) => handleChange(index, 'location', e.target.value)}
                                        placeholder="City, Country"
                                        className="w-full pl-8 pr-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 md:col-span-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-medium text-gray-600 uppercase">Description</label>
                                    {onAiEnhance && (
                                        <button
                                            onClick={() => onAiEnhance(index, exp.description)}
                                            className="text-[10px] font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors"
                                        >
                                            ✨ Enhance with AI
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={exp.description}
                                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                                    placeholder="Describe your responsibilities and achievements..."
                                    rows={3}
                                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExperienceForm;
