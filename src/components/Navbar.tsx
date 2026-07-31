import React, { useState } from 'react';
import { 
  Briefcase, 
  User as UserIcon, 
  Bell, 
  BarChart3, 
  Users, 
  Calendar, 
  FileText, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Sliders,
  UserCheck
} from 'lucide-react';
import { User, Notification } from '../types';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onDemoSwitch: (email: string) => void;
  onOpenUserSlidebar: () => void;
  notifications: Notification[];
  onOpenNotifications: () => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onDemoSwitch,
  onOpenUserSlidebar,
  notifications,
  onOpenNotifications,
  unreadCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand + Menu Toggle + Active View Badge */}
          <div className="flex items-center space-x-3">
            {/* Top-Left Navigation Menu Button */}
            <button
              onClick={onOpenUserSlidebar}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/90 dark:hover:bg-slate-800 transition-all border border-slate-200/90 dark:border-slate-700/80 shadow-2xs flex items-center space-x-2 group cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:scale-105" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 hidden sm:inline">Menu</span>
            </button>

            <div 
              className="flex items-center space-x-2.5 cursor-pointer" 
              onClick={() => setActiveTab(isAdmin ? 'admin-analytics' : 'jobs')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 flex items-center justify-center text-white">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-100">TalentPulse <span className="text-blue-600 dark:text-blue-400">Ghana</span></span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 uppercase tracking-wider">
                    {isAdmin ? 'HR Admin' : 'Recruit'}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Active View Indicator Pill */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-200 ml-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-slate-400 font-normal">View:</span>
              <span className="capitalize">
                {activeTab === 'admin-analytics' && 'Dashboard'}
                {activeTab === 'admin-jobs' && 'Job Postings'}
                {activeTab === 'admin-applications' && 'Applications'}
                {activeTab === 'admin-interviews' && 'Interviews'}
                {activeTab === 'admin-users' && 'User & HR Staff'}
                {activeTab === 'jobs' && 'Browse Jobs'}
                {activeTab === 'my-applications' && 'My Applications'}
                {activeTab === 'profile' && 'My Profile & CV'}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Notification Bell */}
            {user && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile Dropdown Button */}
            {user ? (
              <div className="relative pl-2 border-l border-slate-200">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group focus:outline-none"
                  title="User Profile Menu"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 group-hover:border-blue-400 transition-colors"
                  />
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{user.name}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      {user.role === 'admin' ? ((user.adminProfile?.permission_level === 'super_admin' || user.email === 'mensahsamuel3803@gmail.com') ? 'Super HR' : 'HR Staff') : 'Job Seeker'}
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile / Logout Popover Menu */}
                {profileDropdownOpen && (
                  <>
                    {/* Backdrop listener to close menu on click outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setProfileDropdownOpen(false)} 
                    />

                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                      {/* User Info Header */}
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                        <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {user.role === 'admin' ? 'HR Administrator' : 'Job Applicant'}
                        </span>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setActiveTab('profile');
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center space-x-2.5 cursor-pointer"
                        >
                          <UserIcon className="w-4 h-4 text-slate-500" />
                          <span>My Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-2.5 mt-1 border-t border-slate-100 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out / Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 transition-all"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            {user && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 text-slate-600 hover:text-slate-900"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenUserSlidebar();
                }}
                className="w-full text-left py-2 px-3 rounded-xl bg-blue-50 text-blue-700 font-semibold text-xs flex items-center justify-between border border-blue-200"
              >
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Navigation Slidebar</span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 uppercase">Open Slidebar →</span>
              </button>

              {isAdmin ? (
            <>
              <button onClick={() => { setActiveTab('admin-analytics'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-800 font-medium">Dashboard</button>
              <button onClick={() => { setActiveTab('admin-jobs'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-800 font-medium">Job Postings</button>
              <button onClick={() => { setActiveTab('admin-applications'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-800 font-medium">Applications</button>
              <button onClick={() => { setActiveTab('admin-interviews'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-800 font-medium">Interviews</button>
              <button onClick={() => { setActiveTab('admin-users'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-800 font-medium">Users</button>
            </>
          ) : (
            <>
              <button onClick={() => { setActiveTab('jobs'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-800 font-medium">Browse Jobs</button>
              {user && <button onClick={() => { setActiveTab('my-applications'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-800 font-medium">My Applications</button>}
              {user && <button onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-800 font-medium">My Profile</button>}
            </>
          )}

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-700">{user.name} ({user.role})</span>
                <button onClick={onLogout} className="text-xs text-rose-600 font-semibold">Logout</button>
              </div>
            ) : (
              <div className="flex space-x-2 w-full">
                <button onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }} className="flex-1 py-1.5 text-center text-xs bg-slate-100 text-slate-800 rounded-xl font-semibold border border-slate-200">Sign In</button>
                <button onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }} className="flex-1 py-1.5 text-center text-xs bg-blue-600 text-white rounded-xl font-semibold">Register</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
