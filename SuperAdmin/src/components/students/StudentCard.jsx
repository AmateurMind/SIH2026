import React from 'react';
import { Mail, Phone, User, Eye, GraduationCap } from 'lucide-react';

const StudentCard = ({ student, onViewProfile, viewMode = 'grid' }) => {
    const {
        name,
        email,
        phone,
        department,
        semester,
        profilePicture,
        skills = [],
        resumeCount = 0
    } = student;

    // Grid view
    if (viewMode === 'grid') {
        return (
            <div className="bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full group">
                <div className="p-8 flex flex-col items-center flex-1">
                    {/* Profile Picture */}
                    <div className="mb-6 relative group-hover:scale-105 transition-transform duration-300">
                        {profilePicture ? (
                            <img
                                src={profilePicture}
                                alt={name}
                                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg shadow-slate-200"
                            />
                        ) : (
                            <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg shadow-slate-200">
                                <span className="text-3xl font-bold text-slate-400">
                                    {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 bg-blue-500 border-4 border-white rounded-full p-1.5 shadow-sm">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* Name and Department */}
                    <h3 className="text-xl font-bold text-slate-900 mb-1.5 text-center tracking-tight">{name}</h3>
                    <p className="text-blue-600 font-semibold text-sm mb-1 text-center bg-blue-50 px-3 py-1 rounded-full">{department}</p>
                    {semester && <p className="text-slate-400 text-xs font-medium mt-2 text-center uppercase tracking-wider">Semester {semester}</p>}

                    {/* Contact Info */}
                    <div className="w-full space-y-2.5 my-6">
                        {email && (
                            <div className="flex items-center gap-2.5 text-sm text-slate-500 justify-center group-hover:text-slate-700 transition-colors">
                                <Mail size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                                <span className="truncate max-w-[200px]">{email}</span>
                            </div>
                        )}
                        {phone && (
                            <div className="flex items-center gap-2.5 text-sm text-slate-500 justify-center group-hover:text-slate-700 transition-colors">
                                <Phone size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                                <span>{phone}</span>
                            </div>
                        )}
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center mb-8">
                            {skills.slice(0, 3).map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold shadow-sm"
                                >
                                    {skill}
                                </span>
                            ))}
                            {skills.length > 3 && (
                                <span className="px-3 py-1 bg-slate-50 text-slate-500 border border-slate-100 rounded-full text-xs font-bold">
                                    +{skills.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="mt-auto w-full">
                        <button
                            onClick={() => onViewProfile(student)}
                            className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-[0.98]"
                        >
                            <Eye size={18} />
                            View Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // List view
    return (
        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm rounded-2xl hover:shadow-lg transition-all duration-300 p-5 group">
            <div className="flex items-center gap-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0 relative">
                    {profilePicture ? (
                        <img
                            src={profilePicture}
                            alt={name}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shadow-slate-100"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-md shadow-slate-100">
                            <span className="text-lg font-bold text-slate-400">
                                {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                    {department}
                                </span>
                                {semester && <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">Sem {semester}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                        {email && (
                            <div className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                                <Mail size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                <span className="truncate">{email}</span>
                            </div>
                        )}
                        {phone && (
                            <div className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                                <Phone size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                <span>{phone}</span>
                            </div>
                        )}
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {skills.slice(0, 5).map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-2.5 py-1 bg-white text-slate-600 border border-slate-200 rounded-full text-[10px] font-bold shadow-sm"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 ml-6">
                    <button
                        onClick={() => onViewProfile(student)}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    >
                        <Eye size={16} />
                        View
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentCard;
