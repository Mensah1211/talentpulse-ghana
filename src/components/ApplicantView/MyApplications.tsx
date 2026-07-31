import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  CheckCircle2, 
  XCircle, 
  Hourglass, 
  ChevronRight, 
  Sparkles, 
  ExternalLink,
  MessageSquare,
  Award,
  ArrowRight,
  TrendingUp,
  Briefcase,
  User
} from 'lucide-react';
import { Application, Interview } from '../../types';

// OFFICIAL CORPORATE ONBOARDING PORTAL
const OfficialOnboardingPortal: React.FC<{ application: Application }> = ({ application }) => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Sign Official Offer Letter', desc: 'Review and sign your digital employment contract.', completed: false, icon: FileText },
    { id: 2, title: 'Upload Compliance Documents', desc: 'Provide Government ID and required Tax forms.', completed: false, icon: ExternalLink },
    { id: 3, title: 'Setup Direct Deposit', desc: 'Enter your bank details for secure payroll processing.', completed: false, icon: Briefcase },
    { id: 4, title: 'Company Orientation', desc: 'Watch the mandatory welcome and compliance video.', completed: false, icon: Video },
  ]);
  
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  // Form States to simulate actual functionality
  const [signature, setSignature] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [bankDetails, setBankDetails] = useState({ bank: '', acc: '', route: '' });

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);
  const isAllDone = completedCount === tasks.length;

  const markTaskComplete = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: true } : t));
    setActiveTaskId(null);
  };

  const handleTaskClick = (task: any) => {
    if (task.completed) return;
    setActiveTaskId(activeTaskId === task.id ? null : task.id);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFileName(e.dataTransfer.files[0].name);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 relative"
    >
      {/* Official Header */}
      <div className="bg-slate-900 text-white px-8 py-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white">
              Official Portal
            </span>
            <span className="text-slate-400 text-xs">New Hire Onboarding</span>
          </div>
          <h2 className="text-2xl font-black">Welcome to TalentPulse, {application.applicant_name}</h2>
          <p className="text-slate-300 text-sm mt-1">Please complete your mandatory onboarding compliance tasks to clear you for Day 1.</p>
        </div>
        
        {/* Progress Ring */}
        <div className="flex items-center space-x-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="text-right">
            <div className="text-sm font-bold text-slate-200">Compliance Status</div>
            <div className="text-xs text-slate-400">{completedCount} of {tasks.length} Forms Cleared</div>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-700" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <motion.path 
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${progressPercent}, 100` }}
                transition={{ duration: 1 }}
                className="text-blue-500" strokeWidth="3" strokeDasharray="0, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              />
            </svg>
            <span className="absolute text-xs font-bold">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {isAllDone && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white/95 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-8 border-t-4 border-emerald-500 overflow-y-auto"
        >
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border-2 border-emerald-100 shrink-0">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Onboarding Complete</h2>
          <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6">
            Your compliance documents and direct deposit information have been securely transmitted. Your manager will contact you at <b>{application.applicant_email}</b> regarding your laptop delivery.
          </p>
          
          {/* DIGITAL ID CARD GENERATION */}
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-sm text-left mb-4"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
            
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <div>
                <h4 className="text-white font-black tracking-widest uppercase text-sm">TalentPulse</h4>
                <p className="text-blue-400 text-[10px] uppercase font-bold tracking-widest">Official Employee ID</p>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="p-6 flex gap-5 items-center">
              {/* Photo Placeholder */}
              <div className="w-20 h-20 bg-slate-700 rounded-xl border-2 border-slate-600 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                <User className="w-8 h-8 text-slate-400" />
              </div>
              
              <div>
                <h3 className="text-xl font-black text-white leading-tight mb-1">{application.applicant_name}</h3>
                <p className="text-blue-300 text-sm font-semibold mb-3">{application.job_title}</p>
                
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Employee ID</div>
                  <div className="text-sm font-mono text-white bg-slate-950/50 px-2 py-1 rounded border border-white/5 inline-block">
                    EMP-{new Date(application.applied_at).getFullYear()}-{application.id.substring(0, 5).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-950 px-6 py-3 flex justify-between items-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Valid From: {new Date().toLocaleDateString()}</div>
              <div className="h-6 w-24 bg-white/20 rounded opacity-50 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full flex gap-[2px] opacity-70 px-1">
                  {[...Array(20)].map((_, i) => <div key={i} className="h-full bg-slate-400" style={{ width: Math.max(1, (i * 7) % 4) + 'px' }} />)}
                </div>
              </div>
            </div>
          </motion.div>
          
        </motion.div>
      )}

      {/* Main Checklist Body */}
      <div className="p-8 bg-slate-50">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Required Action Items</h3>
        
        <div className="space-y-4">
          {tasks.map(task => {
            const TaskIcon = task.icon;
            const isActive = activeTaskId === task.id;
            
            return (
              <div key={task.id} className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Task Header Row */}
                <div 
                  onClick={() => handleTaskClick(task)}
                  className={`p-5 cursor-pointer flex items-center justify-between transition-colors ${
                    task.completed ? 'bg-slate-50 cursor-default' : 'hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : isActive ? 'border-blue-600 text-blue-600' : 'border-slate-300 text-slate-400'
                    }`}>
                      {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <TaskIcon className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className={`font-bold ${task.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{task.title}</h4>
                      <p className={`text-xs ${task.completed ? 'text-slate-400' : 'text-slate-500'}`}>{task.desc}</p>
                    </div>
                  </div>
                  
                  <div>
                    {task.completed ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase">Verified</span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase">Pending Action</span>
                    )}
                  </div>
                </div>

                {/* Task Expansion Form */}
                <AnimatePresence>
                  {isActive && !task.completed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 bg-slate-50/50"
                    >
                      <div className="p-6" onClick={(e) => e.stopPropagation()}>
                        
                        {/* FORM 1: DIGITAL SIGNATURE */}
                        {task.id === 1 && (
                          <div className="max-w-xl">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Legal Electronic Signature</label>
                            <p className="text-xs text-slate-500 mb-4">By typing your name below, you officially accept the terms outlined in your employment contract.</p>
                            <input 
                              type="text" 
                              value={signature}
                              onChange={(e) => setSignature(e.target.value)}
                              placeholder={`Type "${application.applicant_name}" to sign`} 
                              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 mb-4" 
                            />
                            <button 
                              disabled={signature.toLowerCase() !== application.applicant_name?.toLowerCase()}
                              onClick={() => markTaskComplete(task.id)} 
                              className="px-6 py-2.5 bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                            >
                              Sign & Accept Contract
                            </button>
                          </div>
                        )}
                        
                        {/* FORM 2: DRAG AND DROP UPLOAD */}
                        {task.id === 2 && (
                          <div className="max-w-2xl">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Upload Identification (PDF, JPG, PNG)</label>
                            
                            <div 
                              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                              className={`mt-2 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:bg-slate-50'
                              }`}
                            >
                              <ExternalLink className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                              {uploadedFileName ? (
                                <div>
                                  <p className="text-sm font-bold text-emerald-600 mb-1">File Attached Successfully</p>
                                  <p className="text-xs text-slate-500">{uploadedFileName}</p>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm font-bold text-slate-700 mb-1">Drag and drop your file here</p>
                                  <p className="text-xs text-slate-500 mb-4">or click the button below to browse files</p>
                                  <label className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm">
                                    Browse Files
                                    <input type="file" className="hidden" onChange={(e) => {
                                      if(e.target.files && e.target.files[0]) setUploadedFileName(e.target.files[0].name);
                                    }} />
                                  </label>
                                </div>
                              )}
                            </div>

                            <button 
                              disabled={!uploadedFileName}
                              onClick={() => markTaskComplete(task.id)} 
                              className="mt-4 px-6 py-2.5 bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                            >
                              Submit Documents
                            </button>
                          </div>
                        )}

                        {/* FORM 3: BANK DETAILS */}
                        {task.id === 3 && (
                          <div className="max-w-xl space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                              <input 
                                type="text" placeholder="e.g. Standard Chartered" 
                                value={bankDetails.bank} onChange={(e) => setBankDetails({...bankDetails, bank: e.target.value})}
                                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                              />
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                                <input 
                                  type="password" placeholder="••••••••" 
                                  value={bankDetails.acc} onChange={(e) => setBankDetails({...bankDetails, acc: e.target.value})}
                                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-700 mb-1">Routing Number / Branch Code</label>
                                <input 
                                  type="text" placeholder="Branch Code" 
                                  value={bankDetails.route} onChange={(e) => setBankDetails({...bankDetails, route: e.target.value})}
                                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                                />
                              </div>
                            </div>
                            <button 
                              disabled={!bankDetails.bank || !bankDetails.acc || !bankDetails.route}
                              onClick={() => markTaskComplete(task.id)} 
                              className="px-6 py-2.5 bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold shadow-sm transition-colors mt-2"
                            >
                              Save Payroll Information
                            </button>
                          </div>
                        )}

                        {/* FORM 4: VIDEO COMPLIANCE */}
                        {task.id === 4 && (
                          <div className="max-w-2xl">
                            <div className="w-full aspect-video bg-slate-900 rounded-xl border border-slate-300 flex flex-col items-center justify-center mb-4 shadow-inner relative overflow-hidden">
                              <Video className="w-12 h-12 text-slate-600 mb-2" />
                              <span className="text-sm font-bold text-slate-400">Orientation Video Player</span>
                              <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay"></div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <input type="checkbox" id="vid-confirm" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                              <label htmlFor="vid-confirm" className="text-sm text-slate-700">I certify that I have watched the mandatory orientation video in its entirety.</label>
                            </div>
                            <button 
                              onClick={() => markTaskComplete(task.id)} 
                              className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                            >
                              Confirm Completion
                            </button>
                          </div>
                        )}
                        
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  );
};

interface MyApplicationsProps {
  applications: Application[];
  onRefresh: () => void;
}

export const MyApplications: React.FC<MyApplicationsProps> = ({ applications, onRefresh }) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const getStepIndex = (status: Application['status']) => {
    switch (status) {
      case 'Under Review': return 1;
      case 'Shortlisted': return 2;
      case 'Interview Scheduled': return 3;
      case 'Hired': return 4;
      case 'Rejected': return -1;
      default: return 0;
    }
  };

  const steps = [
    { title: 'Applied', desc: 'Application received', icon: FileText, percent: 20 },
    { title: 'Under Review', desc: 'HR reviewing profile', icon: Clock, percent: 40 },
    { title: 'Shortlisted', desc: 'Passed initial screening', icon: CheckCircle2, percent: 60 },
    { title: 'Interview', desc: 'Interview date set', icon: Calendar, percent: 80 },
    { title: 'Hired / Offer', desc: 'Offer extended', icon: Award, percent: 100 },
  ];

  const hiredApplication = applications.find(a => a.status === 'Hired');

  return (
    <div className="space-y-6 pb-12">
      
      {/* GAMIFIED ONBOARDING PORTAL (Only shown if Hired) */}
      {hiredApplication && <OfficialOnboardingPortal application={hiredApplication} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2 text-white">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>My Submitted Applications</span>
          </h1>
          <p className="text-xs text-blue-200/80 mt-1">
            Track your recruitment lifecycle status, review interview details, and receive HR feedback in real-time.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all shrink-0 cursor-pointer flex items-center space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          <span>Refresh Live Pipeline</span>
        </button>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700">No applications submitted yet</h3>
          <p className="text-slate-500 text-sm mt-1">Browse open job postings and submit your first application!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app, idx) => {
            const stepIdx = getStepIndex(app.status);
            const isRejected = app.status === 'Rejected';
            const isHired = app.status === 'Hired';
            const progressPercent = isRejected ? 100 : isHired ? 100 : Math.max(20, (stepIdx + 1) * 20);

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.1 }}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all overflow-hidden relative"
              >
                {/* Top Title & Status Tag */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {app.department || 'Information Technology'}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">
                        Applied {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mt-1.5">{app.job_title}</h3>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isHired && (
                      <motion.span 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white border border-emerald-400 text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
                      >
                        <Award className="w-4 h-4 text-emerald-100 animate-bounce" />
                        <span>Hired & Selected!</span>
                      </motion.span>
                    )}

                    {isRejected && (
                      <span className="px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center space-x-1.5">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Not Selected</span>
                      </span>
                    )}

                    {!isHired && !isRejected && (
                      <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center space-x-1.5 shadow-2xs">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                        </span>
                        <span>{app.status}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* ANIMATED RECRUITMENT LIFECYCLE PIPELINE */}
                <div className="py-3 px-4 rounded-2xl bg-gradient-to-b from-slate-50/80 to-blue-50/30 border border-slate-200/70 space-y-4 relative">
                  
                  {/* Pipeline Header Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                        Recruitment Lifecycle Pipeline
                      </span>
                    </div>

                    <div className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                      {isRejected ? 'Application Closed' : isHired ? '100% Completed' : `Stage ${stepIdx + 1} of 5 (${progressPercent}%)`}
                    </div>
                  </div>

                  {/* CONNECTED ANIMATED PIPELINE TIMELINE */}
                  <div className="relative pt-2 pb-1">
                    
                    {/* Background Progress Track Line (Desktop) */}
                    <div className="hidden sm:block absolute top-[28px] left-[5%] right-[5%] h-1.5 bg-slate-200 rounded-full overflow-hidden z-0">
                      {!isRejected && (
                        <motion.div 
                          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full relative"
                          initial={{ width: '0%' }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                        >
                          <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/40 animate-pulse rounded-full" />
                        </motion.div>
                      )}
                      {isRejected && (
                        <div className="h-full bg-rose-400 rounded-full w-full" />
                      )}
                    </div>

                    {/* Step Nodes Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative z-10">
                      {steps.map((st, i) => {
                        const StepIcon = st.icon;
                        const isActive = !isRejected && stepIdx >= i;
                        const isCurrent = !isRejected && stepIdx === i;

                        return (
                          <motion.div
                            key={i}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.25, delay: i * 0.06 }}
                            whileHover={{ y: -2 }}
                            className={`p-3 rounded-xl border text-left transition-all relative ${
                              isCurrent
                                ? 'bg-white border-blue-500 text-blue-900 shadow-md shadow-blue-500/10 ring-2 ring-blue-400/30'
                                : isActive
                                ? 'bg-white border-slate-300 text-slate-800 shadow-2xs'
                                : isRejected
                                ? 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-60'
                                : 'bg-slate-100/60 border-slate-200 text-slate-400'
                            }`}
                          >
                            {/* Animated Pulse Beacon for current step */}
                            {isCurrent && (
                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                              </span>
                            )}

                            {/* Node Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className={`p-1.5 rounded-lg text-xs flex items-center justify-center font-bold ${
                                isCurrent 
                                  ? 'bg-blue-600 text-white shadow-xs' 
                                  : isActive 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : isRejected
                                  ? 'bg-slate-200 text-slate-500'
                                  : 'bg-slate-200 text-slate-500'
                              }`}>
                                {isActive && !isCurrent ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  <StepIcon className="w-3.5 h-3.5" />
                                )}
                              </div>

                              <span className="text-[10px] font-extrabold text-slate-400">
                                0{i + 1}
                              </span>
                            </div>

                            {/* Node Title & Desc */}
                            <div className="font-bold text-xs leading-snug text-slate-900">
                              {st.title}
                            </div>
                            <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                              {st.desc}
                            </div>

                            {/* Current Stage Highlight */}
                            {isCurrent && (
                              <div className="mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-center flex items-center justify-center space-x-1">
                                <span>In Progress</span>
                                <ArrowRight className="w-2.5 h-2.5 text-blue-600 animate-pulse" />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Scheduled Interview Card inside application */}
                {app.interview && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-blue-950 font-bold text-sm">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Scheduled Interview Details</span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs">
                        {app.interview.mode}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                      <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Date & Time</span>
                        <span className="font-bold text-slate-900 text-xs">
                          {app.interview.scheduled_date} at {app.interview.scheduled_time}
                        </span>
                      </div>

                      <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Interviewer</span>
                        <span className="font-bold text-slate-900 text-xs">{app.interview.interviewer_name}</span>
                      </div>

                      <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Location / Meeting Link</span>
                        {app.interview.mode === 'Virtual' ? (
                          <a
                            href={app.interview.location_or_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline font-bold flex items-center space-x-1"
                          >
                            <span>Join Video Call</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="font-bold text-slate-900">{app.interview.location_or_link}</span>
                        )}
                      </div>
                    </div>

                    {app.interview.notes && (
                      <div className="text-xs text-slate-700 pt-2 border-t border-blue-200/60 bg-white/60 p-2 rounded-lg">
                        <span className="font-bold text-slate-900">Preparation Notes:</span> {app.interview.notes}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Feedback note if present */}
                {app.feedback && (
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-slate-800 space-y-1">
                    <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                      <span>HR Feedback Note:</span>
                    </div>
                    <p className="text-slate-700 italic pl-5">{app.feedback}</p>
                  </div>
                )}

              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
};

