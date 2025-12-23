/**
 * Optimized LoginDropdown
 * Desktop: Standard login link for Student
 * Mobile: Redirects to '?signup=true' for Student
 */
import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, BookOpen, Award, Briefcase, Shield, ExternalLink } from 'lucide-react';
import { APPS } from '../../config/apps';

const LoginDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Track screen size to apply mobile-only logic
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile(); // Initial check
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const roles = [
        {
            id: 'student',
            label: 'Student',
            icon: BookOpen,
            // Mobile: Go to signup | Desktop: Go to login
            url: isMobile ? `${APPS.STUDENT.url}/login?signup=true` : `${APPS.STUDENT.url}/login`,
            color: 'blue'
        },
        { id: 'faculty', label: 'Faculty', icon: Award, url: `${APPS.MENTOR.url}/mentor/login`, color: 'purple' },
        { id: 'recruiter', label: 'Recruiter', icon: Briefcase, url: `${APPS.RECRUITER.url}/recruiter/login`, color: 'orange' },
        { id: 'admin', label: 'Admin', icon: Shield, url: `${APPS.ADMIN.url}/admin/login`, color: 'indigo' }
    ];

    return (
        <div
            ref={dropdownRef}
            className={`
                relative flex flex-col md:flex-row items-center transition-all duration-200 py-2
                ${isOpen ? 'gap-4 md:gap-6' : 'gap-0'}
            `}
        >
            {/* Main Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    group relative flex items-center justify-between gap-4 px-8 py-4 
                    bg-white text-slate-900 rounded-full 
                    shadow-md hover:shadow-lg
                    border border-slate-100 z-20
                    transition-all duration-150 ease-out
                    w-[280px]
                    ${isOpen ? 'border-blue-400 shadow-blue-50' : ''}
                    md:${isOpen ? 'w-[220px]' : 'w-[280px]'}
                `}
            >
                <span className={`
                    font-bold text-lg tracking-tight whitespace-nowrap transition-colors duration-150
                    ${isOpen ? 'text-blue-600' : 'text-slate-800'}
                `}>
                    {isOpen ? 'Select Role' : 'Login to Portal'}
                </span>
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center 
                    transition-all duration-200 
                    ${isOpen ? 'rotate-180 bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}
                `}>
                    <ChevronDown size={18} className="md:hidden" />
                    <ChevronRight size={18} className="hidden md:block" />
                </div>
            </button>

            {/* Roles Container */}
            <div className={`
                transition-all duration-200 ease-out overflow-hidden
                ${isOpen
                    ? 'opacity-100 visible translate-y-0 md:translate-x-0'
                    : 'opacity-0 invisible pointer-events-none -translate-y-4 md:translate-y-0 md:-translate-x-4'
                }
                ${isOpen
                    ? 'max-h-[500px] md:max-h-none md:max-w-[800px] mt-3 md:mt-0'
                    : 'max-h-0 md:max-h-none md:max-w-0'
                }
                grid grid-cols-2 gap-3 md:flex md:items-center md:gap-3 p-1
            `}>
                {roles.map((role) => (
                    <a
                        key={role.id}
                        href={role.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                            group relative flex flex-col items-center justify-center 
                            w-[130px] h-[110px] md:w-24 md:h-24 
                            bg-white rounded-2xl border border-slate-100 shadow-sm
                            transition-all duration-150
                            cursor-pointer
                            hover:border-${role.color}-500 hover:ring-1 hover:ring-${role.color}-500
                        `}
                    >
                        <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center mb-2
                            bg-${role.color}-50 text-${role.color}-600
                            transition-colors duration-200
                        `}>
                            <role.icon size={20} strokeWidth={2} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">
                            {role.label}
                        </span>

                        <div className={`
                            absolute bottom-1 right-1 opacity-0 
                            text-${role.color}-400 transition-opacity duration-200
                            group-hover:opacity-100
                        `}>
                            <ExternalLink size={10} />
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default LoginDropdown;