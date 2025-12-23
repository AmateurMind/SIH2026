import React from 'react';
import { X, Filter } from 'lucide-react';

const StudentFilters = ({ filters, onFilterChange, onClearFilters, departments = [], years = [], availableSkills = [] }) => {
    const handleDepartmentChange = (e) => {
        onFilterChange({ ...filters, department: e.target.value });
    };

    const handleYearChange = (e) => {
        onFilterChange({ ...filters, year: e.target.value });
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

    const hasActiveFilters = filters.department || filters.year || filters.skills;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">Filters</h3>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        Clear
                    </button>
                )}
            </div>

            {/* Department & Year - Side by side on mobile inside collapsible, stacked otherwise */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 mb-3 sm:mb-4">
                {/* Department Filter */}
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Department
                    </label>
                    <select
                        value={filters.department || ''}
                        onChange={handleDepartmentChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs sm:text-sm"
                    >
                        <option value="">All</option>
                        {departments.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Year Filter */}
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Year
                    </label>
                    <select
                        value={filters.year || ''}
                        onChange={handleYearChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs sm:text-sm"
                    >
                        <option value="">All</option>
                        {years.map((yr) => (
                            <option key={yr} value={yr}>
                                {yr}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Skills Filter */}
            {availableSkills.length > 0 && (
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Skills
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-32 sm:max-h-48 overflow-y-auto">
                        {availableSkills.map((skill) => (
                            <button
                                key={skill}
                                onClick={() => handleSkillToggle(skill)}
                                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-colors ${isSkillSelected(skill)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2">Active Filters:</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {filters.department && (
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-50 text-blue-700 text-[10px] sm:text-xs rounded-full flex items-center gap-1">
                                {filters.department}
                                <button
                                    onClick={() => onFilterChange({ ...filters, department: '' })}
                                    className="hover:text-blue-900"
                                >
                                    <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                            </span>
                        )}
                        {filters.year && (
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-50 text-green-700 text-[10px] sm:text-xs rounded-full flex items-center gap-1">
                                {filters.year}
                                <button
                                    onClick={() => onFilterChange({ ...filters, year: '' })}
                                    className="hover:text-green-900"
                                >
                                    <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                            </span>
                        )}
                        {filters.skills && filters.skills.split(',').map((skill) => (
                            <span
                                key={skill}
                                className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-50 text-purple-700 text-[10px] sm:text-xs rounded-full flex items-center gap-1"
                            >
                                {skill}
                                <button
                                    onClick={() => handleSkillToggle(skill)}
                                    className="hover:text-purple-900"
                                >
                                    <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
