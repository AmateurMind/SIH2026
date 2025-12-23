
const getBaseUrl = () => typeof window !== 'undefined' ? window.location.origin : '';

export const APPS = {
    STUDENT: {
        port: '5173',
        role: 'student',
        url: import.meta.env.DEV ? 'http://localhost:5173' : getBaseUrl()
    },
    ADMIN: {
        port: '5174',
        role: 'admin',
        url: import.meta.env.DEV ? 'http://localhost:5174' : getBaseUrl()
    },
    RECRUITER: {
        port: '5175',
        role: 'recruiter',
        url: import.meta.env.DEV ? 'http://localhost:5175' : getBaseUrl()
    },
    MENTOR: {
        port: '5176',
        role: 'mentor',
        url: import.meta.env.DEV ? 'http://localhost:5176' : getBaseUrl()
    },
};
