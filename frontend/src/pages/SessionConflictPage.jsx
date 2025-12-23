import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, LogOut } from 'lucide-react';

const SessionConflictPage = ({ targetRole }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const currentRole = user?.role || 'User';

    // Format roles for display
    const roleDisplayNames = {
        student: 'Student',
        mentor: 'Faculty',
        recruiter: 'Recruiter',
        admin: 'Admin'
    };

    const formattedCurrentRole = roleDisplayNames[currentRole] || currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
    const formattedTargetRole = roleDisplayNames[targetRole] || (targetRole ? targetRole.charAt(0).toUpperCase() + targetRole.slice(1) : 'Different Role');

    const handleContinue = () => {
        // Navigate to root, which will trigger the role-based redirect in App.jsx
        navigate('/');
    };

    const handleLogout = async () => {
        await logout();
        // State change will trigger re-render in App.jsx, showing the login page for the current URL
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in-up">
                {/* Top Warning Bar */}
                <div className="h-2 bg-gradient-to-r from-orange-400 to-red-500"></div>

                <div className="p-8 text-center">
                    {/* Pulsing Icon */}
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-75"></div>
                        <div className="relative w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100">
                            <ShieldAlert className="text-orange-500" size={32} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Active Session Detected</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        You are currently logged in as a <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{formattedCurrentRole}</span>.
                        <br className="hidden sm:block" />
                        To access the <span className="font-semibold text-slate-900">{formattedTargetRole}</span> portal, you need to switch accounts.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={handleContinue}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Continue to {formattedCurrentRole} Dashboard
                            <ArrowRight size={18} />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 group"
                        >
                            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                            Logout & Switch to {formattedTargetRole}
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400 flex flex-col gap-1">
                        <span>Signed in as</span>
                        <span className="font-medium text-slate-600 truncate px-4">{user?.email}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionConflictPage;
