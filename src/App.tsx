import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api, getStoredToken, setStoredToken } from './lib/api';
import { Navbar } from './components/Navbar';
import { JobBoard } from './components/ApplicantView/JobBoard';
import { MyApplications } from './components/ApplicantView/MyApplications';
import { ApplicantProfileView } from './components/ApplicantView/ApplicantProfile';
import { AdminAnalytics } from './components/AdminView/AdminAnalytics';
import { JobManagement } from './components/AdminView/JobManagement';
import { ApplicationsReview } from './components/AdminView/ApplicationsReview';
import { InterviewScheduler } from './components/AdminView/InterviewScheduler';
import { UserManagement } from './components/AdminView/UserManagement';
import { AuthModal } from './components/AuthModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { UserSlidebar } from './components/UserSlidebar';
import { AIChatbot } from './components/AIChatbot';
import { 
  User, 
  Job, 
  Application, 
  Interview, 
  Notification, 
  AnalyticsSummary, 
  ApplicantProfile,
  AdminProfile
} from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [applicantProfile, setApplicantProfile] = useState<ApplicantProfile | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  
  const [activeTab, setActiveTab] = useState<string>('jobs');
  const [userSlidebarOpen, setUserSlidebarOpen] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('talentpulse_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('talentpulse_theme', theme);
    } catch (e) {}
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  // App Data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  
  // Passed down state for scheduling interview directly from application review
  const [selectedAppForInterview, setSelectedAppForInterview] = useState<Application | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Load Initial Session
  useEffect(() => {
    initSession();
    fetchPublicJobs();
  }, []);

  const initSession = async () => {
    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setAdminProfile(data.adminProfile);
      setApplicantProfile(data.applicantProfile);

      if (data.user.role === 'admin') {
        setActiveTab('admin-analytics');
        loadAdminData();
      } else {
        setActiveTab('jobs');
        loadApplicantData();
      }
    } catch (err) {
      console.error('Session expired or invalid token', err);
      setStoredToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPublicJobs = async () => {
    try {
      const data = await api.getJobs({ limit: 100 });
      setJobs(data.jobs);
    } catch (err) {
      console.error('Failed to load public jobs', err);
    }
  };

  const loadApplicantData = async () => {
    try {
      const myApps = await api.getMyApplications();
      setMyApplications(myApps);
      const myInts = await api.getMyInterviews();
      setInterviews(myInts);
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed applicant data fetch', err);
    }
  };

  const loadAdminData = async () => {
    try {
      const allJobsRes = await api.getJobs({ limit: 100 }); // get all including drafts if admin
      setJobs(allJobsRes.jobs);
      const allApps = await api.getAllApplications();
      setAllApplications(allApps);
      const allInts = await api.getAllInterviews();
      setInterviews(allInts);
      const stats = await api.getAnalytics();
      setAnalytics(stats);
      const users = await api.getUsers();
      setAllUsers(users);
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed admin data fetch', err);
    }
  };

  // Auth Handlers
  const handleLogin = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    setStoredToken(res.token);
    setUser(res.user);
    setAdminProfile(res.adminProfile);
    setApplicantProfile(res.applicantProfile);

    if (res.user.role === 'admin') {
      setActiveTab('admin-analytics');
      await loadAdminData();
    } else {
      setActiveTab('jobs');
      await loadApplicantData();
    }
  };

  const handleRegister = async (data: any) => {
    const res = await api.register(data);
    setStoredToken(res.token);
    setUser(res.user);
    setAdminProfile(res.adminProfile);
    setApplicantProfile(res.applicantProfile);

    if (res.user.role === 'admin') {
      setActiveTab('admin-analytics');
      await loadAdminData();
    } else {
      setActiveTab('jobs');
      await loadApplicantData();
    }
  };

  const handleLogout = () => {
    setStoredToken(null);
    setUser(null);
    setAdminProfile(null);
    setApplicantProfile(null);
    setActiveTab('jobs');
  };

  // Demo switch handler
  const handleDemoSwitch = async (email: string) => {
    try {
      await handleLogin(email, 'password123');
    } catch (err: any) {
      alert('Demo login error: ' + err.message);
    }
  };

  // Applicant Actions
  const handleApplyToJob = async (jobId: string, coverLetter: string, resumeUrl?: string, resumeFilename?: string, coverLetterUrl?: string, coverLetterFilename?: string) => {
    await api.submitApplication({
      job_id: jobId,
      cover_letter: coverLetter,
      cover_letter_url: coverLetterUrl,
      cover_letter_filename: coverLetterFilename,
      resume_url: resumeUrl,
      resume_filename: resumeFilename,
    });
    await fetchPublicJobs();
    await loadApplicantData();
  };

  const handleSaveProfile = async (updates: any) => {
    const res = await api.updateProfile(updates);
    setUser(res.user);
    setApplicantProfile(res.applicantProfile);
  };

  const handleFileUpload = async (file: File) => {
    return await api.uploadFile(file);
  };

  // Admin Actions
  const handleCreateJob = async (jobData: any) => {
    await api.createJob(jobData);
    await loadAdminData();
  };

  const handleUpdateJob = async (id: string, updates: any) => {
    await api.updateJob(id, updates);
    await loadAdminData();
  };

  const handleDeleteJob = async (id: string) => {
    await api.deleteJob(id);
    await loadAdminData();
  };

  const handleUpdateAppStatus = async (id: string, status: string, feedback?: string) => {
    await api.updateApplicationStatus(id, status, feedback);
    await loadAdminData();
  };

  const handleBulkUpdateAppStatus = async (ids: string[], status: string, feedback?: string) => {
    await api.bulkUpdateApplicationStatus(ids, status, feedback);
    await loadAdminData();
  };

  const handleScheduleInterview = async (data: any) => {
    await api.scheduleInterview(data);
    await loadAdminData();
  };

  const handleUpdateInterviewOutcome = async (id: string, outcome: string, notes?: string) => {
    await api.updateInterviewOutcome(id, outcome, notes);
    await loadAdminData();
  };

  const handleBulkSendNotifications = async (userIds: string[], title: string, message: string) => {
    await api.bulkSendNotifications(userIds, title, message);
    await loadAdminData();
  };

  const handleUpdateUserStatus = async (id: string, status: 'active' | 'deactivated') => {
    await api.updateUserStatus(id, status);
    await loadAdminData();
  };

  const handleAssignUserRole = async (id: string, role: 'applicant' | 'admin', permission_level?: string, department?: string) => {
    await api.updateUserRole(id, role, permission_level, department);
    await loadAdminData();
  };

  const handleDeleteUser = async (id: string) => {
    await api.deleteUser(id);
    await loadAdminData();
  };

  const handleCreateAdminStaff = async (data: any) => {
    await api.createAdminStaff(data);
    await loadAdminData();
  };

  // Notifications
  const handleMarkNotifRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read_status: true } : n));
  };

  const handleMarkAllNotifRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(notifications.map(n => ({ ...n, read_status: true })));
  };

  const unreadNotifCount = notifications.filter(n => !n.read_status).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white transition-colors duration-200">
      
      {/* Navigation Header */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={(mode = 'login') => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onDemoSwitch={handleDemoSwitch}
        onOpenUserSlidebar={() => setUserSlidebarOpen(true)}
        notifications={notifications}
        onOpenNotifications={() => setNotifDrawerOpen(true)}
        unreadCount={unreadNotifCount}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {/* Applicant Views */}
            {activeTab === 'jobs' && (
              <JobBoard
                jobs={jobs}
                user={user}
                myApplications={myApplications}
                onApply={handleApplyToJob}
                onOpenAuth={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'my-applications' && user && (
              <MyApplications
                applications={myApplications}
                onRefresh={loadApplicantData}
              />
            )}

            {activeTab === 'profile' && user && (
              <ApplicantProfileView
                user={user}
                profile={applicantProfile}
                adminProfile={adminProfile}
                onSaveProfile={handleSaveProfile}
                onFileUpload={handleFileUpload}
              />
            )}

            {/* HR Admin Views */}
            {activeTab === 'admin-analytics' && user?.role === 'admin' && (
              <AdminAnalytics
                analytics={analytics}
                onRefresh={loadAdminData}
              />
            )}

            {activeTab === 'admin-jobs' && user?.role === 'admin' && (
              <JobManagement
                jobs={jobs}
                onCreateJob={handleCreateJob}
                onUpdateJob={handleUpdateJob}
                onDeleteJob={handleDeleteJob}
                onRefresh={loadAdminData}
                isLoading={isLoading}
                isSuperAdmin={true}
              />
            )}

            {activeTab === 'admin-applications' && user?.role === 'admin' && (
              <ApplicationsReview
                applications={allApplications}
                jobs={jobs}
                onUpdateStatus={handleUpdateAppStatus}
                onBulkUpdateStatus={handleBulkUpdateAppStatus}
                onScheduleInterviewClick={(app) => {
                  setSelectedAppForInterview(app);
                  setActiveTab('admin-interviews');
                }}
                onSendBulkEmail={handleBulkSendNotifications}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'admin-interviews' && user?.role === 'admin' && (
              <InterviewScheduler
                interviews={interviews}
                applications={allApplications}
                initialApplicationToSchedule={selectedAppForInterview}
                onScheduleInterview={handleScheduleInterview}
                onUpdateOutcome={handleUpdateInterviewOutcome}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'admin-users' && user?.role === 'admin' && (
              <UserManagement
                users={allUsers}
                currentUser={user}
                adminProfile={adminProfile}
                onUpdateStatus={handleUpdateUserStatus}
                onAssignRole={handleAssignUserRole}
                onDeleteUser={handleDeleteUser}
                onCreateAdminStaff={handleCreateAdminStaff}
                onRefresh={loadAdminData}
                isLoading={isLoading}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Slidebar Drawer */}
      <UserSlidebar
        isOpen={userSlidebarOpen}
        onClose={() => setUserSlidebarOpen(false)}
        currentUser={user}
        adminProfile={adminProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={(mode = 'login') => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onForgotPassword={(email) => api.forgotPassword(email)}
        onResetPassword={async (email, code, newPass) => { await api.resetPassword({ email, code, newPassword: newPass }); }}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotifRead}
        onMarkAllRead={handleMarkAllNotifRead}
      />

      {/* Floating AI Recruiter Chatbot */}
      <AIChatbot />

    </div>
  );
}
