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
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Work Experience</h3>
                <button
                    onClick={addExperience}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                    <Plus size={16} /> Add Experience
                </button>
            </div>

            {experience.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-2">No experience added yet</p>
                    <button
                        onClick={addExperience}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Add Your First Role
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {experience.map((exp, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 text-gray-400">
                                <GripVertical size={16} className="cursor-move" />
                                <span className="text-sm font-medium">Role {index + 1}</span>
                            </div>
                            <button
                                onClick={() => removeExperience(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Remove role"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Job Title</label>
                                <input
                                    type="text"
                                    value={exp.jobTitle}
                                    onChange={(e) => handleChange(index, 'jobTitle', e.target.value)}
                                    placeholder="Software Engineer"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Company</label>
                                <div className="relative">
                                    <Building size={14} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => handleChange(index, 'company', e.target.value)}
                                        placeholder="Google"
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Start Date</label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={exp.startDate}
                                        onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                                        placeholder="MM/YYYY"
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">End Date</label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={exp.endDate}
                                        onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                                        placeholder={exp.current ? 'Present' : 'MM/YYYY'}
                                        disabled={exp.current}
                                        className={`w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${exp.current ? 'bg-gray-50 text-gray-400' : ''
                                            }`}
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="checkbox"
                                        id={`current-${index}`}
                                        checked={exp.current}
                                        onChange={(e) => handleChange(index, 'current', e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`current-${index}`} className="text-xs text-gray-600 cursor-pointer">
                                        I currently work here
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Location</label>
                                <div className="relative">
                                    <MapPin size={14} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={exp.location}
                                        onChange={(e) => handleChange(index, 'location', e.target.value)}
                                        placeholder="City, Country"
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                                    {onAiEnhance && (
                                        <button
                                            onClick={() => onAiEnhance(index, exp.description)}
                                            className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                        >
                                            ✨ Enhance with AI
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={exp.description}
                                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                                    placeholder="Describe your responsibilities and achievements..."
                                    rows={4}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
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
