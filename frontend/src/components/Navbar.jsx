import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion'; // Added for the arc effect
import {
  User,
  GraduationCap,
  BookOpen,
  FileText,
  BarChart3,
  Users,
  LogOut,
  Sparkles,
  Award,
  BrainCircuit,
  Calendar,
  Briefcase
} from 'lucide-react';

const UserAvatar = ({ user, className }) => {
  if (user?.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt={user.name}
        className={`rounded-full object-cover border border-gray-200 ${className}`}
      />
    );
  }
  return (
    <div className={`rounded-full bg-primary-100 flex items-center justify-center border border-primary-200 ${className}`}>
      <span className="text-primary-700 font-semibold text-sm">
        {user?.name?.charAt(0)?.toUpperCase()}
      </span>
    </div>
  );
};

const NavItem = ({ item, onClick, mobile = false }) => (
  <NavLink
    to={item.path}
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center ${mobile ? 'space-x-3 px-4 py-3 text-base' : 'space-x-2 px-3 py-2 text-sm'} 
      rounded-lg font-medium transition-all duration-200
      ${isActive
        ? 'text-primary-600 bg-primary-50'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }
    `}
  >
    <item.icon className={mobile ? "h-5 w-5" : "h-4 w-4"} />
    <span>{item.label}</span>
  </NavLink>
);

// --- New Sub-component for the Semicircle Menu ---
const ArcSubMenu = ({ isOpen, items, onClose, side = "center" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[90]"
          />

          {/* Arc Container */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-16 pointer-events-none z-[101]">
            {items.map((item, index) => {
              // Adjust angles based on which side the button is on
              // side "right" (Career) tilts everything left to avoid screen edge
              let angle;
              if (side === "right") {
                angle = index === 0 ? -80 : -35;
              } else {
                angle = index === 0 ? -35 : 35;
              }

              const radius = 48; // Distance from button
              const x = Math.sin((angle * Math.PI) / 180) * radius;
              const y = -Math.cos((angle * Math.PI) / 180) * radius;

              return (
                <motion.div
                  key={item.label}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                  animate={{ scale: 1, x: x, y: y, opacity: 1 }}
                  exit={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200 }}
                  className="absolute left-1/2 top-1/2 pointer-events-auto"
                >
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className="flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 group"
                  >
                    <div className={`p-1.5 rounded-full shadow-md border border-gray-100 ${item.bgColor} ${item.iconColor} mb-0.5 active:scale-90 transition-transform bg-white`}>
                      <item.icon size={16} />
                    </div>
                    <span className="text-[8px] font-semibold text-gray-600 px-1 whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJobsMenuOpen, setIsJobsMenuOpen] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = originalOverflow; };
  }, [isMobileMenuOpen]);

  const closeAllMenus = () => {
    setIsJobsMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = useMemo(() => {
    const baseItems = {
      student: [
        { path: '/student/dashboard', label: 'Home', icon: BarChart3 },
        { path: '/student/calendar', label: 'Events', icon: Calendar },
        { path: '/student/internship-passports', label: 'Passports', icon: Award },
        { path: '/student/internships', label: 'Internships', icon: BookOpen },
        { path: '/student/applications', label: 'Applications', icon: FileText },
        { path: '/student/jobs', label: 'Jobs', icon: BookOpen },
        { path: '/student/career', label: 'Career', icon: Briefcase },
        { path: '/ai-interview', label: 'AI Mock Interview', icon: BrainCircuit },
        { path: '/student/resume-builder', label: 'Resume Builder', icon: Sparkles },
      ],
      mentor: [
        { path: '/mentor/dashboard', label: 'Dashboard', icon: BarChart3 },
        { path: '/mentor/calendar', label: 'Calendar', icon: Calendar },
        { path: '/mentor/students', label: 'Students', icon: Users },
      ],
      admin: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
        { path: '/admin/students', label: 'Students', icon: Users },
        { path: '/admin/internships', label: 'Internships', icon: BookOpen },
        { path: '/admin/calendar', label: 'Calendar', icon: Calendar },
        { path: '/admin/applications', label: 'Applications', icon: FileText },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      ],
      recruiter: [
        { path: '/recruiter/dashboard', label: 'Dashboard', icon: BarChart3 },
        { path: '/recruiter/applications', label: 'Applications', icon: FileText },
        { path: '/recruiter/internships', label: 'Postings', icon: BookOpen },
        { path: '/recruiter/students', label: 'Students', icon: Users },
      ]
    };
    const role = user?.role?.toLowerCase() || 'student';
    return baseItems[role] || baseItems.student;
  }, [user?.role]);

  const homePath = useMemo(() => {
    const role = user?.role?.toLowerCase();
    if (role === 'student') return '/student/dashboard';
    if (role === 'mentor') return '/mentor/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'recruiter') return '/recruiter/dashboard';
    return '/';
  }, [user?.role]);

  // Submenu Data
  const jobsSubItems = [
    { path: '/student/internship-passports', label: 'Passports', icon: Award, bgColor: 'bg-green-500', iconColor: 'text-white' },
    { path: '/student/applications', label: 'Applied', icon: FileText, bgColor: 'bg-orange-500', iconColor: 'text-white' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 print:hidden">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to={homePath} className="flex items-center space-x-2 group">
                <div className="p-2 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
                  <GraduationCap className="h-6 w-6 text-primary-600" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">Campus<span className="text-primary-600">Buddy</span></span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to={user?.role === 'student' ? '/student/profile' : '#'}
                  className="flex items-center space-x-3 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <UserAvatar user={user} className="h-8 w-8" />
                  <div className="text-sm pr-2">
                    <div className="font-semibold text-gray-900">{user?.name}</div>
                    <div className="text-gray-500 text-xs capitalize">{user?.role}</div>
                  </div>
                </Link>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 p-2"><LogOut className="h-5 w-5" /></button>
              </div>

              <div className="md:hidden flex items-center space-x-2">
                <Link to={user?.role === 'student' ? '/student/profile' : '#'}>
                  <UserAvatar user={user} className="h-9 w-9" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 p-2 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100] pb-2 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const groupedLabels = ['Resume Builder', 'AI Mock Interview', 'Passports', 'Applications', 'Jobs'];
            if (groupedLabels.includes(item.label)) return null;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeAllMenus}
                className={({ isActive }) => `flex flex-col items-center min-w-[50px] space-y-1 py-1 transition-colors ${isActive ? 'text-primary-600' : 'text-gray-400'}`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}

          {/* Passport Link */}
          {user?.role === 'student' && (
            <NavLink
              to="/student/jobs"
              onClick={closeAllMenus}
              className={({ isActive }) => `flex flex-col items-center min-w-[50px] space-y-1 py-1 transition-colors ${isActive ? 'text-primary-600' : 'text-gray-400'}`}
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-[10px] font-medium">Passport</span>
            </NavLink>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;