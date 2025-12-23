import React from 'react';
import { Mail, Phone, MapPin, FileText, Eye, User, GraduationCap, ChevronRight, Briefcase } from 'lucide-react';

const StudentCard = ({ student, onViewProfile, onViewResumes, onViewIPPs, viewMode = 'grid', actions }) => {
    const {
        name,
        email,
        phone,
        department,
        year,
        profilePicture,
        skills = [],
        resumeCount = 0,
        ippCount = 0
    } = student;

    // --- GRID VIEW ---
    if (viewMode === 'grid') {
        return (
            <div className="group relative bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100/50 transition-all duration-300 overflow-hidden flex flex-col h-full">
                {/* Decorative Pattern Background for Header */}
                <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 bg-gray-50">
                </div>

                {/* Profile Section */}
                <div className="relative pt-8 sm:pt-12 px-4 sm:px-6 pb-4 sm:pb-6 flex-1 flex flex-col">
                    {/* Profile Picture */}
                    <div className="relative mx-auto mb-3 sm:mb-4">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full p-1 bg-white shadow-lg ring-1 ring-black/5">
                            {profilePicture ? (
                                <img
                                    src={profilePicture}
                                    alt={name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <User className="w-6 h-6 sm:w-10 sm:h-10" />
                                </div>
                            )}
                        </div>
                        {/* Status/Badge could go here */}
                    </div>

                    {/* Header Info */}
                    <div className="text-center mb-4 sm:mb-6">
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1" title={name}>
                            {name}
                        </h3>
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 font-medium flex-wrap">
                            <span className="bg-blue-50 text-blue-700 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs border border-blue-100">
                                {department || 'General'}
                            </span>
                            {year && (
                                <span className="flex items-center gap-1 text-[10px] sm:text-xs">
                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                    {year}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Contact & Stats Mini-Grid */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-2.5 flex flex-col items-center justify-center text-center border border-gray-100">
                            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 mb-1" />
                            <span className="text-[10px] sm:text-xs font-semibold text-gray-700">
                                {resumeCount} Resume{resumeCount !== 1 && 's'}
                            </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-2.5 flex flex-col items-center justify-center text-center border border-gray-100">
                            <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 mb-1" />
                            <span className="text-[10px] sm:text-xs font-semibold text-gray-700">
                                {ippCount} Passport{ippCount !== 1 && 's'}
                            </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-2.5 flex flex-col items-center justify-center text-center border border-gray-100 group/link cursor-pointer hover:bg-blue-50/50 hover:border-blue-100 transition-colors">
                            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 mb-1" />
                            <span className="text-[10px] sm:text-xs text-gray-500 truncate w-full group-hover/link:text-blue-600">
                                Contact
                            </span>
                        </div>
                    </div>

                    {/* Skills (Push to bottom of flex container) */}
                    <div className="mt-auto mb-4 sm:mb-6">
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2 text-center">Top Skills</p>
                        <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center h-[40px] sm:h-[52px] overflow-hidden content-start">
                            {skills.length > 0 ? skills.slice(0, 3).map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white border border-gray-200 text-gray-600 text-[10px] sm:text-xs rounded-full font-medium shadow-sm"
                                >
                                    {skill}
                                </span>
                            )) : (
                                <span className="text-[10px] sm:text-xs text-gray-400 italic">No skills listed</span>
                            )}
                            {skills.length > 3 && (
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-50 text-gray-400 text-[10px] sm:text-xs rounded-full font-medium border border-gray-100">
                                    +{skills.length - 3}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-2">
                        <button
                            onClick={() => onViewProfile(student)}
                            className="bg-blue-600 text-white hover:bg-blue-700 font-medium py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all shadow-blue-200 hover:shadow-lg hover:shadow-blue-300/50 flex items-center justify-center gap-1.5 sm:gap-2 group-hover:translate-y-0 translate-y-0"
                        >
                            View Profile
                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                            {resumeCount > 0 && (
                                <button
                                    onClick={() => onViewResumes(student)}
                                    className="text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-medium py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl transition-colors"
                                >
                                    Resumes
                                </button>
                            )}
                            {ippCount > 0 && onViewIPPs && (
                                <button
                                    onClick={() => onViewIPPs(student)}
                                    className="text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:text-amber-900 font-medium py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl transition-colors"
                                >
                                    Passports
                                </button>
                            )}
                        </div>
                        {actions}
                    </div>
                </div>
            </div>
        );
    }

    // --- LIST VIEW ---
    return (
        <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 p-3 sm:p-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-5">
                {/* Left: Avatar */}
                <div className="relative flex-shrink-0">
                    {profilePicture ? (
                        <img
                            src={profilePicture}
                            alt={name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shadow-sm border border-gray-100"
                        />
                    ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-100 flex items-center justify-center border border-gray-200 text-slate-400">
                            <User className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                    )}
                </div>

                {/* Middle: Info */}
                <div className="flex-1 min-w-0">
                    {/* Identity */}
                    <div className="mb-1.5 sm:mb-2">
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{name}</h3>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mt-0.5">
                            <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{department || 'N/A'}</span>
                            <span className="text-gray-300">•</span>
                            <span>{year}</span>
                        </div>
                    </div>

                    {/* Quick Stats/Contact - Hidden on mobile */}
                    <div className="hidden sm:flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-blue-500" />
                            <span className="truncate">{email}</span>
                        </div>
                        {phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-3.5 h-3.5 text-green-500" />
                                <span>{phone}</span>
                            </div>
                        )}
                    </div>

                    {/* Skills Preview - Collapsed on mobile */}
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2 sm:hidden">
                        {skills.length > 0 ? (
                            <>
                                {skills.slice(0, 2).map((skill, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 bg-gray-50 border border-gray-200 text-gray-600 text-[10px] rounded font-medium">
                                        {skill}
                                    </span>
                                ))}
                                {skills.length > 2 && (
                                    <span className="px-1.5 py-0.5 text-[10px] text-gray-400 font-medium">+{skills.length - 2}</span>
                                )}
                            </>
                        ) : null}
                    </div>

                    {/* Skills Preview - Desktop */}
                    <div className="hidden sm:flex flex-wrap gap-1.5 mt-2 md:hidden lg:flex">
                        {skills.length > 0 ? (
                            <>
                                {skills.slice(0, 3).map((skill, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-md font-medium">
                                        {skill}
                                    </span>
                                ))}
                                {skills.length > 3 && (
                                    <span className="px-2 py-1 text-xs text-gray-400 font-medium">+{skills.length - 3}</span>
                                )}
                            </>
                        ) : (
                            <span className="text-xs text-gray-400 italic">No skills</span>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0 sm:pl-4 sm:border-l sm:border-gray-100 sm:ml-2">
                    <button
                        onClick={() => onViewProfile(student)}
                        className="px-3 sm:px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                        View
                    </button>
                    {resumeCount > 0 && (
                        <button
                            onClick={() => onViewResumes(student)}
                            className="px-3 sm:px-4 py-1 text-[10px] sm:text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            {resumeCount} Resume{resumeCount !== 1 && 's'}
                        </button>
                    )}
                    {ippCount > 0 && onViewIPPs && (
                        <button
                            onClick={() => onViewIPPs(student)}
                            className="px-3 sm:px-4 py-1 text-[10px] sm:text-xs font-medium text-amber-600 hover:text-amber-900 transition-colors"
                        >
                            {ippCount} Passport{ippCount !== 1 && 's'}
                        </button>
                    )}
                    {actions}
                </div>
            </div>
        </div>
    );
};

export default StudentCard;
