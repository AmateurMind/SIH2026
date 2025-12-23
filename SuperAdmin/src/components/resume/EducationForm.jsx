import React from 'react';
import { Plus, Trash2, GripVertical, Calendar, GraduationCap, BookOpen } from 'lucide-react';

const EducationForm = ({ education, onChange }) => {
    const handleChange = (index, field, value) => {
        const newEducation = [...education];
        newEducation[index] = { ...newEducation[index], [field]: value };
        onChange(newEducation);
    };

    const addEducation = () => {
        onChange([
            ...education,
            {
                institution: '',
                degree: '',
                fieldOfStudy: '',
                startDate: '',
                endDate: '',
                gpa: '',
                description: ''
            }
        ]);
    };

    const removeEducation = (index) => {
        const newEducation = education.filter((_, i) => i !== index);
        onChange(newEducation);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Education</h3>
                <button
                    onClick={addEducation}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                    <Plus size={16} /> Add Education
                </button>
            </div>

            {education.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-2">No education added yet</p>
                    <button
                        onClick={addEducation}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Add Education
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {education.map((edu, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2 text-gray-400">
                                <GripVertical size={16} className="cursor-move" />
                                <span className="text-sm font-medium">Education {index + 1}</span>
                            </div>
                            <button
                                onClick={() => removeEducation(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Remove education"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Institution</label>
                                <div className="relative">
                                    <Building size={14} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={edu.institution}
                                        onChange={(e) => handleChange(index, 'institution', e.target.value)}
                                        placeholder="University Name"
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Degree</label>
                                <div className="relative">
                                    <GraduationCap size={14} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) => handleChange(index, 'degree', e.target.value)}
                                        placeholder="Bachelor's, Master's, etc."
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Field of Study</label>
                                <div className="relative">
                                    <BookOpen size={14} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={edu.fieldOfStudy}
                                        onChange={(e) => handleChange(index, 'fieldOfStudy', e.target.value)}
                                        placeholder="Computer Science"
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
                                        value={edu.startDate}
                                        onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                                        placeholder="YYYY"
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">End Date (or Expected)</label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        value={edu.endDate}
                                        onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                                        placeholder="YYYY"
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">GPA (Optional)</label>
                                <input
                                    type="text"
                                    value={edu.gpa}
                                    onChange={(e) => handleChange(index, 'gpa', e.target.value)}
                                    placeholder="3.8/4.0"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper component for icons used in placeholders
const Building = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <line x1="9" y1="22" x2="9" y2="22.01"></line>
        <line x1="15" y1="22" x2="15" y2="22.01"></line>
        <line x1="12" y1="22" x2="12" y2="22.01"></line>
        <line x1="12" y1="2" x2="12" y2="22"></line>
        <line x1="4" y1="10" x2="20" y2="10"></line>
        <line x1="4" y1="14" x2="20" y2="14"></line>
        <line x1="4" y1="18" x2="20" y2="18"></line>
    </svg>
);

export default EducationForm;
