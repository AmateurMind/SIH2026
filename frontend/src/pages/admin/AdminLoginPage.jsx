import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck, LayoutDashboard, Database } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useClerk } from "@clerk/clerk-react";
import LoadingSpinner from '../../components/LoadingSpinner';

const GridPattern = () => (
    <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="2" fill="none" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
);

const AdminLoginPage = () => {
    const { login } = useAuth();
    const { openSignUp } = useClerk();
    const [searchParams] = useSearchParams();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [demoCredentials, setDemoCredentials] = useState([]);

    useEffect(() => {
        fetchDemoCredentials();
        if (searchParams.get('signup') === 'true') {
            openSignUp();
        }
    }, [searchParams, openSignUp]);

    const fetchDemoCredentials = async () => {
        try {
            const response = await axios.get('/auth/demo-credentials');
            // Ensure we strictly get admins
            const admins = response.data.credentials.filter(user => user.role === 'admin');
            setDemoCredentials(admins);
        } catch (error) {
            console.error('Failed to fetch demo credentials:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(credentials, rememberMe);
        } catch (error) {
            console.error('Auth error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = (demoUser) => {
        setCredentials({
            email: demoUser.email,
            password: demoUser.password
        });
    };

    return (
        <div className="min-h-screen flex bg-white font-sans selection:bg-rose-100 selection:text-rose-900">
            {/* Left Side: Brand & Value Prop (Dark/Admin) */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#1a0505] relative flex-col justify-between p-12 lg:p-16 overflow-hidden text-white">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-900/40 via-[#1a0505] to-[#1a0505] z-0" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <GridPattern />

                {/* Header */}
                <div className="relative z-10 flex items-center space-x-3">
                    <div className="h-10 w-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                        <ShieldCheck className="text-white h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">CampusBuddy <span className="text-rose-400 font-light">Admin</span></span>
                </div>

                {/* Main Content */}
                <div className="relative z-10 space-y-8 max-w-lg">
                    <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                        Complete control over your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">campus ecosystem</span>.
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed font-light">
                        Manage students, oversee internship placements, and configure platform settings from a single command center.
                    </p>

                    <div className="flex gap-4 pt-4">
                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
                            <LayoutDashboard className="w-5 h-5 text-rose-400" />
                            <span className="text-sm font-medium">Centralized Dashboard</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
                            <Database className="w-5 h-5 text-orange-400" />
                            <span className="text-sm font-medium">Data Management</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-slate-500 text-sm">
                    © 2025 CampusBuddy Inc. All rights reserved.
                </div>
            </div>

            {/* Right Side: Login Form (Clean/Light) */}
            <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-12 lg:p-24 bg-white">
                <div className="w-full max-w-md space-y-8">
                    {/* Back to Landing Page Link */}
                    <div className="flex justify-start">
                        <a
                            href="http://localhost:5173/"
                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-rose-600 transition-colors group"
                        >
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Home</span>
                        </a>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Portal</h2>
                        <p className="mt-2 text-slate-500">
                            Authenticate to access administrative controls.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@university.edu"
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                required
                                className="h-11 border-slate-200 bg-slate-50 focus:bg-white transition-all focus:ring-2 focus:ring-rose-100 focus:border-rose-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                                <a href="#" className="text-sm font-medium text-rose-600 hover:text-rose-500">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    required
                                    className="h-11 border-slate-200 bg-slate-50 focus:bg-white transition-all focus:ring-2 focus:ring-rose-100 focus:border-rose-500 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    tabIndex="-1"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-600 cursor-pointer"
                            />
                            <Label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                                Remember system
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-rose-900 hover:bg-rose-800 text-white font-medium text-base shadow-lg shadow-rose-900/10 transition-all hover:-translate-y-0.5"
                            disabled={loading}
                        >
                            {loading ? (
                                <LoadingSpinner size="small" color="white" />
                            ) : (
                                <span className="flex items-center justify-center">
                                    Access System <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-100" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-400 font-medium">Or continue with demo</span>
                        </div>
                    </div>

                    {/* Demo Credentials */}
                    <div className="space-y-3">
                        {demoCredentials.length > 0 ? (
                            demoCredentials.map((demo, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleDemoLogin(demo)}
                                    className="group w-full flex items-center p-3 rounded-xl border border-slate-200 hover:border-rose-500/50 hover:shadow-md hover:shadow-rose-500/5 bg-white transition-all duration-200"
                                >
                                    <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600 transition-colors">
                                        {demo.name.charAt(0)}
                                    </div>
                                    <div className="ml-3 text-left flex-1">
                                        <p className="text-sm font-semibold text-slate-900 group-hover:text-rose-700 transition-colors">{demo.name}</p>
                                        <p className="text-xs text-slate-500">System Admin</p>
                                    </div>
                                    <div className="px-2 py-1 bg-slate-50 text-xs font-mono text-slate-500 rounded border border-slate-100">
                                        Root Access
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center text-sm text-slate-400 italic">No admin accounts available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
