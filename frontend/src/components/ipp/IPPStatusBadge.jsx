import React from 'react';

const IPPStatusBadge = ({ status }) => {
    const statusConfig = {
        draft: {
            color: 'bg-slate-100 text-slate-800 border-slate-200',
            label: 'Draft',
            icon: '📝'
        },
        pending_mentor_eval: {
            color: 'bg-amber-100 text-amber-800 border-amber-200',
            label: 'Awaiting Supervisor/Recruiter',
            icon: '⏳'
        },
        pending_student_submission: {
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            label: 'Action Required',
            icon: '📤'
        },
        verified: {
            color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            label: 'Verified',
            icon: '✅'
        },
        published: {
            color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            label: 'Verified',
            icon: '✅'
        },
        rejected: {
            color: 'bg-red-100 text-red-800 border-red-200',
            label: 'Rejected',
            icon: '❌'
        }
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
            <span className="mr-1.5">{config.icon}</span>
            {config.label}
        </span>
    );
};

export default IPPStatusBadge;
