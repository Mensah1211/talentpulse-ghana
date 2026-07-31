import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Briefcase, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  ArrowRight, 
  Sliders,
  BarChart3,
  FileText,
  Calendar,
  Users,
  Sun,
  Moon,
  Check,
  ShieldCheck
} from 'lucide-react';
import { User } from '../types';

interface UserSlidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  adminProfile?: any | null;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const UserSlidebar: React.FC<UserSlidebarProps> = ({
  isOpen,
  onClose,
  currentUser,
  adminProfile,
  activeTab = 'jobs',
  setActiveTab,
  onOpenAuth,
  onLogout,
  theme = 'light',
  onToggleTheme,
}) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    if (theme) return theme;
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme);
    }
  }, [theme]);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setCurrentTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('talentpulse_theme', 'dark'); } catch (e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('talentpulse_theme', 'light'); } catch (e) {}
    }
    if (onToggleTheme && currentTheme !== newTheme) {
      onToggleTheme();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isAdmin = currentUser?.role === 'admin';
  const isSuperAdmin = isAdmin && (currentUser?.adminProfile?.permission_level === 'super_admin' || currentUser?.email === 'mensahsamuel3803@gmail.com');

  let adminNavItems = [
    { id: 'admin-analytics', label: 'Dashboard', icon: BarChart3, desc: 'Analytics & recruitment stats overview' },
    { id: 'admin-jobs', label: 'Job Postings', icon: Briefcase, desc: 'Manage & create career requisitions' },
    { id: 'admin-applications', label: 'Applications', icon: FileText, desc: 'Review candidate pipeline & resumes' },
    { id: 'admin-interviews', label: 'Interviews', icon: Calendar, desc: 'Schedule & evaluate interview sessions' },
    { id: 'admin-users', label: 'User & HR Staff', icon: Users, desc: 'Team member roles & permissions' },
    { id: 'profile', label: 'My Profile', icon: UserIcon, desc: 'View and update account details' },
  ];

  const applicantNavItems = [
    { id: 'jobs', label: 'Browse Jobs', icon: Briefcase, desc: 'Explore active openings & apply' },
    { id: 'my-applications', label: 'My Applications', icon: FileText, desc: 'Track your submitted job applications' },
    { id: 'profile', label: 'My Profile & CV', icon: UserIcon, desc: 'Manage your resume & career profile' },
  ];

  const currentNavItems = isAdmin ? adminNavItems : applicantNavItems;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            onClick={onClose}
          />

          {/* Slidebar Panel (Sliding out from Left) */}
          <div className="fixed inset-y-0 left-0 max-w-full flex pr-10 pointer-events-none">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between text-slate-800 dark:text-slate-100 pointer-events-auto"
            >
          
          {/* Top Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-xl border ${isAdmin && isSuperAdmin ? 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/60' : 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/60'}`}>
                  {isAdmin && isSuperAdmin ? <ShieldCheck className="w-5 h-5" /> : <Sliders className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {isAdmin ? (isSuperAdmin ? 'Super HR Portal' : 'HR Staff Portal') : 'Applicant Portal'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quick access to workspace views & preferences</p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close slidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Currently Logged In Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
              {currentUser ? (
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-blue-200 dark:border-blue-800"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex items-center space-x-1.5">
                      <span>{currentUser.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {currentUser.role === 'admin' ? (isSuperAdmin ? 'Super HR' : 'HR Staff') : 'Applicant'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Guest Session — Sign in to save progress</span>
                </div>
              )}

              {currentUser && (
                <button
                  onClick={() => {
                    onLogout();
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 transition-colors shrink-0 flex items-center space-x-1 cursor-pointer"
                  title="Sign out current user"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>

            {/* Appearance / Theme Mode Switcher */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-indigo-950 text-amber-600 dark:text-indigo-400 border border-amber-200/60 dark:border-indigo-800/60">
                    {currentTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Appearance Theme</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Toggle light / dark mode</div>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-blue-100 dark:bg-indigo-900/80 text-blue-800 dark:text-indigo-200 border border-blue-200 dark:border-indigo-700/60">
                  {currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>

              {/* Theme Toggle Button Bar */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    currentTheme === 'light'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 border border-blue-300 dark:border-blue-500/50 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sun className={`w-3.5 h-3.5 ${currentTheme === 'light' ? 'text-amber-500 fill-amber-500/20' : ''}`} />
                  <span>Light</span>
                  {currentTheme === 'light' && <Check className="w-3 h-3 text-blue-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    currentTheme === 'dark'
                      ? 'bg-indigo-600 text-white border border-indigo-500 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Moon className={`w-3.5 h-3.5 ${currentTheme === 'dark' ? 'text-indigo-200 fill-indigo-200/20' : ''}`} />
                  <span>Dark</span>
                  {currentTheme === 'dark' && <Check className="w-3 h-3 text-white" />}
                </button>
              </div>
            </div>

          </div>

          {/* Body Content Container - Navigation Links */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isAdmin ? 'HR Administrator Navigation Views' : 'Job Applicant Navigation Views'}
            </div>

            <div className="space-y-2">
              {currentNavItems.map((item) => {
                const isSelected = activeTab === item.id;
                const IconComponent = item.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (setActiveTab) {
                        setActiveTab(item.id);
                      }
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-500/50 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-700/60 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-xl mt-0.5 ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center space-x-2">
                          <span>{item.label}</span>
                          {isSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-200">
                              Current View
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>

                    <ArrowRight className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-blue-600 dark:text-blue-400 translate-x-0.5' : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5'
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 space-y-3">
            {!currentUser && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth('login');
                }}
                className="w-full py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register Account</span>
              </button>
            )}

            <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
              TalentPulse Recruitment System
            </div>
          </div>

        </motion.div>
      </div>
    </div>
      )}
    </AnimatePresence>
  );
};


