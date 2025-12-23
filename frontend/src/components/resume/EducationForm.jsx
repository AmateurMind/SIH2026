import React from 'react';
import { Plus, Trash2, GripVertical, Calendar, GraduationCap, BookOpen, Building } from 'lucide-react';

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
        <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">Education</h3>
                <button
                    onClick={addEducation}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:text-primary-800 transition-colors bg-primary-50 px-2 py-1 rounded-lg hover:bg-primary-100 border border-primary-200"
                >
                    <Plus size={14} /> Add Education
                </button>
            </div>

            {education.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-2 text-xs">No education added yet</p>
                    <button
                        onClick={addEducation}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Add Education
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {education.map((edu, index) => (
                    <div
                        key={index}
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2 text-gray-500">
                                <GripVertical size={14} className="cursor-move" />
                                <span className="text-xs font-medium">Education {index + 1}</span>
                            </div>
                            <button
                                onClick={() => removeEducation(index)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                title="Remove education"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-[10px] font-medium text-gray-600 uppercase">Institution</label>
                                <div className="relative">
                                    <Building size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={edu.institution}
                                        onChange={(e) => handleChange(index, 'institution', e.target.value)}
                                        placeholder="University Name"
                                        className="w-full pl-8 pr-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600 uppercase">Degree</label>
                                <div className="relative">
                                    <GraduationCap size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) => handleChange(index, 'degree', e.target.value)}
                                        placeholder="Bachelor's, Master's, etc."
                                        className="w-full pl-8 pr-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600 uppercase">Field of Study</label>
                                <div className="relative">
                                    <BookOpen size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={edu.fieldOfStudy}
                                        onChange={(e) => handleChange(index, 'fieldOfStudy', e.target.value)}
                                        placeholder="Computer Science"
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
                                        value={edu.startDate}
                                        onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                                        placeholder="YYYY"
                                        className="w-full pl-8 pr-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600 uppercase">End Date (or Expected)</label>
                                <div className="relative">
                                    <Calendar size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={edu.endDate}
                                        onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                                        placeholder="YYYY"
                                        className="w-full pl-8 pr-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-medium text-gray-600 uppercase">GPA (Optional)</label>
                                <input
                                    type="text"
                                    value={edu.gpa}
                                    onChange={(e) => handleChange(index, 'gpa', e.target.value)}
                                    placeholder="3.8/4.0"
                                    className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EducationForm;
