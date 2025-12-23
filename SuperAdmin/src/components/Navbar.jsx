import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  GraduationCap,
  BookOpen,
  FileText,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Award,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow || '';
    }
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    const baseItems = {
      student: [
        { path: '/student/dashboard', label: 'Dashboard', icon: BarChart3 },
        { path: '/student/internships', label: 'Internships', icon: BookOpen },
        { path: '/student/applications', label: 'Applications', icon: FileText },
        { path: '/student/resume-builder', label: 'Resume Builder', icon: Sparkles },
        { path: '/student/profile', label: 'Profile', icon: User },
      ],
      mentor: [
        { path: '/mentor/dashboard', label: 'Dashboard', icon: BarChart3 },
        { path: '/mentor/applications', label: 'Applications', icon: FileText }
      ],
      admin: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
        { path: '/admin/students', label: 'Students', icon: Users },
        { path: '/admin/internships', label: 'Internships', icon: BookOpen },
        { path: '/admin/applications', label: 'Applications', icon: FileText },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      ],
      recruiter: [
        { path: '/recruiter/dashboard', label: 'Dashboard', icon: BarChart3 },
        { path: '/recruiter/students', label: 'Students', icon: Users },
        { path: '/recruiter/internships', label: 'Postings', icon: BookOpen },
      ]
    };

    const role = user?.role?.toLowerCase();
    return baseItems[role] || [];
  };

  const navigationItems = getNavigationItems();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/80 backdrop-blur-md shadow-sm'
        : 'bg-white/50 backdrop-blur-none'
        }`}
    >
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
                C
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-slate-900 leading-none">
                  Campus<span className="text-blue-600">Buddy</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">SuperAdmin</span>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-1 bg-slate-50/50 p-1.5 rounded-full border border-slate-100">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                    ? 'text-blue-600 bg-white shadow-sm ring-1 ring-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-6">
            {/* User info */}
            <div className="hidden md:flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="flex items-center gap-3">
                <div className="text-right hidden lg:block">
                  <div className="font-bold text-sm text-slate-900">{user?.name}</div>
                  <div className="text-xs text-slate-500 capitalize font-medium">{user?.role === 'mentor' ? 'Faculty' : user?.role}</div>
                </div>
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="h-10 w-10 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100 object-cover"
                  />
                ) : (
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 ${user?.role === 'mentor' ? 'bg-purple-600' :
                    user?.role === 'recruiter' ? 'bg-orange-500' : 'bg-blue-600'
                    }`}>
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="touch-target md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden bg-white border-t border-slate-100 shadow-xl absolute w-full left-0 z-50">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive
                    ? 'text-blue-600 bg-blue-50/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="border-t border-slate-100 pt-4 mt-4 px-2">
              <div className="flex items-center space-x-3 p-2 mb-4 bg-slate-50 rounded-xl">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="h-10 w-10 rounded-full border border-white shadow-sm"
                  />
                ) : (
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ${user?.role === 'mentor' ? 'bg-purple-600' :
                    user?.role === 'recruiter' ? 'bg-orange-500' : 'bg-blue-600'
                    }`}>
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-bold text-slate-900">{user?.name}</div>
                  <div className="text-xs text-slate-500 capitalize font-medium">{user?.role === 'mentor' ? 'Faculty' : user?.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-base font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-xl transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
