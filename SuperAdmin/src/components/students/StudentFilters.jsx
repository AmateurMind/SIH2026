import React from 'react';
import { X, Filter } from 'lucide-react';

const StudentFilters = ({ filters, onFilterChange, onClearFilters, departments = [], semesters = [], availableSkills = [] }) => {
    const handleDepartmentChange = (e) => {
        onFilterChange({ ...filters, department: e.target.value });
    };

    const handleSemesterChange = (e) => {
        onFilterChange({ ...filters, semester: e.target.value });
    };

    const handleSkillToggle = (skill) => {
        const currentSkills = filters.skills ? filters.skills.split(',') : [];
        const skillIndex = currentSkills.indexOf(skill);

        let newSkills;
        if (skillIndex > -1) {
            newSkills = currentSkills.filter(s => s !== skill);
        } else {
            newSkills = [...currentSkills, skill];
        }

        onFilterChange({ ...filters, skills: newSkills.join(',') });
    };

    const isSkillSelected = (skill) => {
        if (!filters.skills) return false;
        return filters.skills.split(',').includes(skill);
    };

    const hasActiveFilters = filters.department || filters.semester || filters.skills;

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-blue-400" />
                    <h3 className="font-semibold text-white">Filters</h3>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                    >
                        <X size={14} />
                        Clear All
                    </button>
                )}
            </div>

            {/* Department Filter */}
            <div className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Department
                </label>
                <select
                    value={filters.department || ''}
                    onChange={handleDepartmentChange}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none text-sm text-white"
                >
                    <option value="" className="bg-slate-900">All Departments</option>
                    {departments.map((dept) => (
                        <option key={dept} value={dept} className="bg-slate-900">
                            {dept}
                        </option>
                    ))}
                </select>
            </div>

            {/* Semester Filter */}
            <div className="mb-5">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Semester
                </label>
                <select
                    value={filters.semester || ''}
                    onChange={handleSemesterChange}
                    className="w-full px-3 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none text-sm text-white"
                >
                    <option value="" className="bg-slate-900">All Semesters</option>
                    {semesters.map((sem) => (
                        <option key={sem.value} value={sem.value} className="bg-slate-900">
                            {sem.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Skills Filter */}
            {availableSkills.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Skills
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {availableSkills.map((skill) => (
                            <button
                                key={skill}
                                onClick={() => handleSkillToggle(skill)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${isSkillSelected(skill)
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {skill}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="mt-5 pt-5 border-t border-white/10">
                    <p className="text-xs text-slate-500 mb-2">Active Filters:</p>
                    <div className="flex flex-wrap gap-2">
                        {filters.department && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs rounded-full flex items-center gap-1">
                                {filters.department}
                                <button
                                    onClick={() => onFilterChange({ ...filters, department: '' })}
                                    className="hover:text-white transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                        {filters.semester && (
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs rounded-full flex items-center gap-1">
                                Semester {filters.semester}
                                <button
                                    onClick={() => onFilterChange({ ...filters, semester: '' })}
                                    className="hover:text-white transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                        {filters.skills && filters.skills.split(',').map((skill) => (
                            <span
                                key={skill}
                                className="px-2 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs rounded-full flex items-center gap-1"
                            >
                                {skill}
                                <button
                                    onClick={() => handleSkillToggle(skill)}
                                    className="hover:text-white transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentFilters;
