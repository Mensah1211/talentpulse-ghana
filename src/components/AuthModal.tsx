import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Key,
  CheckCircle2,
  Briefcase,
  Building2,
  Sparkles,
  Camera,
  Check,
  Upload
} from 'lucide-react';
import { api } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (data: any) => Promise<void>;
  onForgotPassword: (email: string) => Promise<{ resetCode: string }>;
  onResetPassword: (email: string, code: string, newPass: string) => Promise<void>;
}

const PRESET_AVATARS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', label: 'Professional Woman' },
  { id: '2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', label: 'Professional Man' },
  { id: '3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', label: 'Executive Woman' },
  { id: '4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', label: 'Executive Man' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLogin,
  onRegister,
  onForgotPassword,
  onResetPassword,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode);
  
  // Registration Step (1 or 2)
  const [regStep, setRegStep] = useState<1 | 2>(1);

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Form - Step 1
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Register Form - Step 2
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  // Reset Form
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setErrorMsg('');
    try {
      const uploaded = await api.uploadFile(file);
      setAvatarUrl(uploaded.url);
      setSuccessMsg('Profile picture uploaded!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setMode(initialMode);
      setRegStep(1);
      setErrorMsg('');
      setSuccessMsg('');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialMode]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please check and try again.');
      return;
    }

    setRegStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        await onLogin(email, password);
        onClose();
      } else if (mode === 'register') {
        // Step 2 Validations
        if (!phone.trim()) {
          setErrorMsg('Please provide a phone number.');
          setLoading(false);
          return;
        }
        if (!avatarUrl) {
          setErrorMsg('Please upload a profile picture.');
          setLoading(false);
          return;
        }
        if (!skillsInput.trim()) {
          setErrorMsg('Please provide at least one skill.');
          setLoading(false);
          return;
        }
        if (!bio.trim()) {
          setErrorMsg('Please provide a short bio or headline.');
          setLoading(false);
          return;
        }

        await onRegister({ 
          name, 
          email: regEmail, 
          password: regPassword, 
          phone, 
          role: 'applicant',
          avatar_url: avatarUrl,
          bio,
          skills: skillsInput,
        });
        onClose();
      } else if (mode === 'forgot') {
        const res = await onForgotPassword(email);
        setSuccessMsg(`Verification code sent! For demo testing, use code: ${res.resetCode}`);
        setMode('reset');
      } else if (mode === 'reset') {
        await onResetPassword(email, resetCode, newPassword);
        setSuccessMsg('Password reset successfully! Please log in.');
        setMode('login');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 pb-10 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 text-slate-800 dark:text-slate-100 z-10"
          >
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
              TP
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">TalentPulse Ghana</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {mode === 'login' && 'Welcome Back — Sign In'}
              {mode === 'register' && (regStep === 1 ? 'Create Your Account' : 'Complete Your Profile')}
              {mode === 'forgot' && 'Reset Your Password'}
              {mode === 'reset' && 'Verification & New Password'}
            </h3>

            {mode === 'register' && (
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900">
                Step {regStep} of 2
              </span>
            )}
          </div>
        </div>

        {/* Step Progress Bar for Registration */}
        {mode === 'register' && (
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300 ease-out"
              style={{ width: regStep === 1 ? '50%' : '100%' }}
            />
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold animate-in fade-in">
            {successMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-blue-600 font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* REGISTER FORM - MULTI-STEP */}
        {mode === 'register' && (
          <form onSubmit={regStep === 1 ? handleNextStep : handleSubmit} className="space-y-4">
            
            {/* STEP 1: Essentials */}
            {regStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kofi Mensah"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work or Personal Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="kofi.mensah@example.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Min 6 chars"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
                >
                  <span>Continue to Step 2: Profile Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Profile & Skills */}
            {regStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="+233 24 000 0000"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Avatar Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Upload Profile Picture</label>
                  <div className="flex items-center space-x-4">
                    <img
                      src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=20&blur=20'}
                      alt="Selected Avatar"
                      className="w-12 h-12 rounded-xl object-cover border-2 border-blue-600 shadow-sm"
                    />
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed rounded-xl text-slate-700 text-xs flex items-center justify-center space-x-2 transition-colors">
                        <Upload className="w-4 h-4 text-slate-400" />
                        <span>{uploadingAvatar ? 'Uploading...' : 'Click to Upload Image'}</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload} 
                        disabled={uploadingAvatar} 
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Skills (Comma separated)</label>
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="React, TypeScript, Node.js, Design"
                      value={skillsInput}
                      onChange={e => setSkillsInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Short Bio / Headline</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Experienced Full Stack Engineer interested in web and cloud software development."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>{loading ? 'Creating Account...' : 'Complete Registration & Sign In'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{loading ? 'Sending Code...' : 'Send Verification Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* RESET PASSWORD FORM */}
        {mode === 'reset' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit Reset Code</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="123456"
                  value={resetCode}
                  onChange={e => setResetCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{loading ? 'Resetting Password...' : 'Reset Password'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Toggle Mode Footer */}
        <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button 
                onClick={() => { setMode('register'); setRegStep(1); setErrorMsg(''); }} 
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Register now
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button 
                onClick={() => { setMode('login'); setErrorMsg(''); }} 
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          )}
        </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
