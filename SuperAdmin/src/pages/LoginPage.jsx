import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, ArrowRight, Shield, Briefcase, BookOpen, Lock, User, Mail, Cpu, Wifi, Code } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardFooter } from '../components/ui/card';

const featureHighlights = [
  {
    title: 'Secure',
    description: 'Role-based admin controls.',
    icon: Shield,
    iconBg: 'bg-blue-50 text-blue-600'
  },
  {
    title: 'Intelligent',
    description: 'Auto assignment & filters.',
    icon: BookOpen,
    iconBg: 'bg-indigo-50 text-indigo-600'
  },
  {
    title: 'Connected',
    description: 'Unified campus data.',
    icon: Briefcase,
    iconBg: 'bg-emerald-50 text-emerald-600'
  }
];

const LoginPage = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoCredentials, setDemoCredentials] = useState([]);

  useEffect(() => {
    fetchDemoCredentials();
  }, []);

  const fetchDemoCredentials = async () => {
    try {
      const response = await axios.get('/auth/demo-credentials');
      // Sort: Admin(1) -> Mentors(2) -> Recruiter(3)
      const filteredAndSorted = response.data.credentials
        .filter(cred => cred.role !== 'student')
        .sort((a, b) => {
          const roleOrder = { 'admin': 1, 'mentor': 2, 'recruiter': 3 };
          return roleOrder[a.role] - roleOrder[b.role];
        });
      setDemoCredentials(filteredAndSorted);
    } catch (error) {
      console.error('Failed to fetch demo credentials:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        if (registerData.password !== registerData.confirmPassword) {
          alert('Passwords do not match');
          setLoading(false);
          return;
        }
        await register(registerData);
      } else {
        await login(credentials, rememberMe);
      }
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

  const getRoleIcon = (role, dept) => {
    if (role === 'admin') return <Shield className="h-5 w-5 text-indigo-600" />;
    if (role === 'recruiter') return <Briefcase className="h-5 w-5 text-orange-600" />;

    // Specific icons for Faculty Departments
    if (dept?.toLowerCase().includes('cs')) return <Code className="h-5 w-5 text-purple-600" />;
    if (dept?.toLowerCase().includes('it')) return <Wifi className="h-5 w-5 text-cyan-600" />;
    if (dept?.toLowerCase().includes('elec')) return <Cpu className="h-5 w-5 text-amber-600" />;

    return <BookOpen className="h-5 w-5 text-purple-600" />;
  };

  const getRoleBadgeStyle = (role, dept) => {
    if (role === 'admin') return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    if (role === 'recruiter') return 'bg-orange-50 text-orange-700 border-orange-100';

    // Distinct colors for faculty
    if (dept?.toLowerCase().includes('cs')) return 'bg-purple-50 text-purple-700 border-purple-100';
    if (dept?.toLowerCase().includes('it')) return 'bg-cyan-50 text-cyan-700 border-cyan-100';
    if (dept?.toLowerCase().includes('elec')) return 'bg-amber-50 text-amber-700 border-amber-100';

    return 'bg-slate-50 text-slate-700 border-slate-100';
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[100px]" />
      </div>

      <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-20 xl:px-24 z-10 relative">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Left Side Login Form (Same as before) */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="h-14 w-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 transform rotate-3">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="mt-3 text-base text-slate-600">
              {isRegister ? 'Join the administrative team' : 'Sign in to access your dashboard'}
            </p>
          </div>

          <Card className="border-slate-100 bg-white shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {isRegister && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-medium ml-1">Full Name</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <User className="h-5 w-5" />
                      </div>
                      <Input
                        id="name"
                        placeholder="Admin Name"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                        className="pl-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl h-12 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium ml-1">Email Address</Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@college.edu"
                      value={isRegister ? registerData.email : credentials.email}
                      onChange={(e) => isRegister
                        ? setRegisterData({ ...registerData, email: e.target.value })
                        : setCredentials({ ...credentials, email: e.target.value })
                      }
                      required
                      className="pl-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl h-12 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium ml-1">Password</Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={isRegister ? registerData.password : credentials.password}
                      onChange={(e) => isRegister
                        ? setRegisterData({ ...registerData, password: e.target.value })
                        : setCredentials({ ...credentials, password: e.target.value })
                      }
                      required
                      className="pl-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl h-12 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {!isRegister && (
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="remember-me" className="font-medium text-slate-500 text-sm cursor-pointer">Remember me</Label>
                    </div>
                    <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 h-12 rounded-full text-base font-semibold tracking-wide transition-all hover:-translate-y-0.5"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    <>
                      {isRegister ? 'Create Account' : 'Sign In'}
                      {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-0 bg-slate-50/50 border-t border-slate-100">
              <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                  {isRegister ? 'Already have an account?' : 'Don\'t have an account?'}
                  <button
                    onClick={() => setIsRegister(!isRegister)}
                    className="ml-2 font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-colors"
                  >
                    {isRegister ? 'Log in' : 'Request Access'}
                  </button>
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Right side - Decorative & Demo */}
      <div className="hidden lg:flex relative flex-1 bg-slate-50 border-l border-slate-200 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-slate-50" />

        <div className="relative inset-0 flex h-full flex-col items-center justify-between gap-6 p-10 z-10 w-full">
          <div className="max-w-lg w-full space-y-6"> {/* Increased width slightly for 3 columns */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-blue-100 rounded-full shadow-sm mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-xs font-bold text-blue-700 tracking-wider uppercase">Administration Hub</span>
              </div>

              <h2 className="text-4xl font-bold text-slate-900 leading-tight">
                Manage your campus <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ecosystem efficiently</span>
              </h2>
            </div>

            {/* Demo Credentials Card */}
            <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 border border-white/50 rounded-3xl overflow-hidden ring-1 ring-slate-900/5">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Demo Access
                </h3>
                <span className="text-xs bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                  Instant Login
                </span>
              </div>

              {/* GRID LAYOUT: 3 Columns */}
              <div className="p-4 grid grid-cols-3 gap-3">
                {demoCredentials.length === 0 ? (
                  <div className="col-span-3 text-center text-sm text-slate-500 py-8 flex flex-col items-center gap-2">
                    <LoadingSpinner size="small" color="blue" />
                    <span>Loading demo users...</span>
                  </div>
                ) : (
                  demoCredentials.map((demo, index) => {
                    const isFaculty = demo.role === 'mentor';
                    // Admin & Recruiter span full width (3 cols), Faculty spans 1 col
                    const colSpan = isFaculty ? 'col-span-1' : 'col-span-3';

                    return (
                      <button
                        key={index}
                        onClick={() => handleDemoLogin(demo)}
                        className={`${colSpan} group relative flex ${isFaculty ? 'flex-col justify-center items-center text-center p-4 gap-3' : 'items-center justify-between p-4'} rounded-2xl bg-white border border-slate-100 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
                      >
                        <div className={`flex items-center ${isFaculty ? 'flex-col gap-3' : 'gap-4'}`}>
                          {/* Icon Container */}
                          <div className={`h-11 w-11 rounded-full flex items-center justify-center shadow-sm ${index % 2 === 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                            {getRoleIcon(demo.role, demo.department)}
                          </div>

                          {/* Text Container */}
                          <div className={isFaculty ? 'space-y-1.5' : ''}>
                            <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                              {demo.name}
                            </p>

                            {/* Badges */}
                            <div className={`text-[10px] uppercase tracking-wider font-bold inline-block px-2.5 py-1 border ${isFaculty ? 'rounded-lg py-1.5' : 'rounded-full'} ${getRoleBadgeStyle(demo.role, demo.department)}`}>
                              {demo.role === 'mentor'
                                ? (
                                  <div className="flex flex-col items-center leading-tight">
                                    <span className="opacity-75 text-[8px] mb-0.5">FACULTY</span>
                                    <span>{demo.department || 'GENERAL'}</span>
                                  </div>
                                )
                                : demo.role}
                            </div>
                          </div>
                        </div>

                        {/* Arrow for all cards */}
                        <div className={`h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors ${isFaculty ? 'absolute top-2 right-2' : ''}`}>
                          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-center">
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  Universal Password: <code className="bg-white px-2 py-1 rounded shadow-sm border border-slate-200 font-mono text-slate-700 font-bold">demo123</code>
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3">
              {featureHighlights.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center text-center gap-2 bg-white/60 border border-white/40 p-3 rounded-2xl shadow-sm">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${feature.iconBg}`}>
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{feature.title}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;