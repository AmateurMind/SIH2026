
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { SignUpButton, useClerk } from "@clerk/clerk-react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Spiral from '../components/Spiral';

const LoginPage = () => {
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

    // Auto-open sign up modal if requested via URL param
    if (searchParams.get('signup') === 'true') {
      openSignUp();
    }
  }, [searchParams, openSignUp]);

  const fetchDemoCredentials = async () => {
    try {
      const response = await axios.get('/auth/demo-credentials');
      const students = response.data.credentials.filter(user => user.role === 'student');
      setDemoCredentials(students);
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
    // Auto-fill and submit for demo users
    setCredentials({
      email: demoUser.email,
      password: demoUser.password
    });

    // Optional: Auto-submit after a short delay for better UX
    // setTimeout(() => login({ email: demoUser.email, password: demoUser.password }), 500);
  };

  return (
    <div className="min-h-screen flex bg-[#0B1120] relative overflow-hidden">
      {/* Full Screen Spiral Animation - Overlay Mode */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-20 mix-blend-multiply">
        <Spiral
          dotColor="#ffffff"
          backgroundColor="transparent"
          style={{
            // --- POSITION CONTROLS ---
            justifyContent: 'left', // Horizontal: 'flex-start' (Left), 'center', 'flex-end' (Right)
            alignItems: 'center',     // Vertical: 'flex-start' (Top), 'center', 'flex-end' (Bottom)

            // --- SIZE CONTROLS ---
            width: '100%',   // Adjust container size (e.g., '600px', '50vw')
            height: '100%',  // Adjust container size (e.g., '600px', '50vh')

            // --- FINE TUNING ---
            transform: 'translate(0px, 0px) scale(1.4)', // scale(1.5) = 150% size, scale(0.8) = 80% size
          }}
        />
      </div>

      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative z-10 shadow-xl">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left mb-8">
            <div className="flex items-center gap-2 justify-center lg:justify-start ml-5">
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                Hello!
              </h2>
              <div className="w-24 h-24 -mt-2">
                <DotLottieReact
                  src="https://lottie.host/fac60838-3098-4a80-939a-93d272f0bf2e/8HuZRazhf7.lottie"
                  loop
                  autoplay
                />
              </div>
            </div>
          </div>

          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@college.edu"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    required
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-slate-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      required
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="remember-me" className="font-normal text-slate-600">Remember me</Label>
                  </div>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline">
                    Forgot password?
                  </a>
                </div>

                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white" disabled={loading}>
                  {loading ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 px-0 pt-6">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">
                    New to Campus Buddy?
                  </span>
                </div>
              </div>

              <SignUpButton mode="modal">
                <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                  Create an account
                </Button>
              </SignUpButton>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Right side - Decorative & Demo */}
      <div className="hidden lg:block relative flex-1 w-0 bg-[#0B1120] border-l border-white/10">
        <div className="absolute inset-0 bg-[#0B1120]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4 text-white">Student Portal</h2>
              <p className="text-slate-400 text-lg">
                Manage your internships, applications, and resume all in one place.
              </p>
            </div>

            {/* Demo Credentials Card */}
            <Card className="bg-white shadow-xl border-slate-200 text-slate-900">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center font-bold text-slate-900">
                    Demo Access
                  </CardTitle>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100 font-medium">
                    One-Click Login
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {demoCredentials.length === 0 ? (
                  <div className="text-center text-sm text-slate-500 py-4">
                    Loading demo users...
                  </div>
                ) : (
                  demoCredentials.map((demo, index) => (
                    <button
                      key={index}
                      onClick={() => handleDemoLogin(demo)}
                      className="w-full group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-sm font-bold shadow-md text-white group-hover:bg-blue-600 transition-colors">
                          {demo.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors">
                            {demo.name}
                          </p>
                          <p className="text-xs text-slate-500">Student</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))
                )}
              </CardContent>
              <CardFooter className="pt-2 border-t border-slate-100 justify-center">
                <p className="text-xs text-slate-500">
                  Password: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700 border border-slate-200">demo123</code>
                </p>
              </CardFooter>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <Card className="bg-white shadow-sm border-slate-200 text-slate-900">
                <CardContent className="p-4">
                  <CheckCircle className="h-6 w-6 text-blue-500 mb-2" />
                  <h4 className="font-medium text-sm font-bold">Resume Builder</h4>
                  <p className="text-xs text-slate-500 mt-1">Create professional resumes</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm border-slate-200 text-slate-900">
                <CardContent className="p-4">
                  <CheckCircle className="h-6 w-6 text-blue-500 mb-2" />
                  <h4 className="font-medium text-sm font-bold">Internships</h4>
                  <p className="text-xs text-slate-500 mt-1">Apply to top companies</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
