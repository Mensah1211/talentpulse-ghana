import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  ExternalLink, 
  MessageSquare, 
  User, 
  X, 
  Mail, 
  Filter, 
  Sparkles,
  CheckSquare,
  Square,
  Award,
  Download,
  Clock
} from 'lucide-react';
import { Application, Job, User as UserType } from '../../types';
import { InteractivePipeline } from './InteractivePipeline';
import { api } from '../../lib/api';

interface ApplicationsReviewProps {
  applications: Application[];
  jobs: Job[];
  onUpdateStatus: (id: string, status: string, feedback?: string) => Promise<void>;
  onBulkUpdateStatus: (ids: string[], status: string, feedback?: string) => Promise<void>;
  onScheduleInterviewClick: (app: Application) => void;
  onSendBulkEmail: (userIds: string[], title: string, message: string) => Promise<void>;
  isLoading: boolean;
}

export const ApplicationsReview: React.FC<ApplicationsReviewProps> = ({
  applications,
  jobs,
  onUpdateStatus,
  onBulkUpdateStatus,
  onScheduleInterviewClick,
  onSendBulkEmail,
  isLoading,
}) => {
  const [selectedJobId, setSelectedJobId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Kanban view state
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [activeDragCol, setActiveDragCol] = useState<string | null>(null);

  // Modal states
  const [reviewingApp, setReviewingApp] = useState<Application | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  
  
  // Bulk selection
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [bulkEmailTitle, setBulkEmailTitle] = useState('Recruitment Update from HR');
  const [bulkEmailBody, setBulkEmailBody] = useState('Thank you for applying to our position. We have an update regarding your application process...');

  // Offer Letter State
  const [showOfferLetterModal, setShowOfferLetterModal] = useState(false);
  const [offerContent, setOfferContent] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const filteredApps = applications.filter(app => {
    const matchesJob = selectedJobId === 'all' || app.job_id === selectedJobId;
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      app.applicant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesJob && matchesStatus && matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedAppIds.length === filteredApps.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(filteredApps.map(a => a.id));
    }
  };

  const toggleSelectApp = (id: string) => {
    if (selectedAppIds.includes(id)) {
      setSelectedAppIds(selectedAppIds.filter(i => i !== id));
    } else {
      setSelectedAppIds([...selectedAppIds, id]);
    }
  };

  const handleSingleStatusUpdate = async (status: string) => {
    if (!reviewingApp) return;
    setActionLoading(true);
    try {
      await onUpdateStatus(reviewingApp.id, status, feedbackInput);
      setMsg(`Application status updated to ${status}`);
      setReviewingApp(null);
      setFeedbackInput('');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkStatusChange = async (targetStatus: string) => {
    if (selectedAppIds.length === 0) return;
    if (!confirm(`Are you sure you want to update ${selectedAppIds.length} candidate(s) to "${targetStatus}"?`)) return;

    setActionLoading(true);
    try {
      await onBulkUpdateStatus(selectedAppIds, targetStatus, 'Bulk decision by HR team.');
      setSelectedAppIds([]);
      setMsg(`Successfully updated ${selectedAppIds.length} candidate status(es) to ${targetStatus}`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed bulk action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendBulkEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAppIds.length === 0) return;

    setActionLoading(true);
    try {
      // Find applicant user IDs from selected application IDs
      const userIds = Array.from(
        new Set(
          applications
            .filter(a => selectedAppIds.includes(a.id))
            .map(a => a.applicant_id)
        )
      );

      await onSendBulkEmail(userIds, bulkEmailTitle, bulkEmailBody);
      setShowBulkEmailModal(false);
      setSelectedAppIds([]);
      setMsg(`Sent broadcast message to ${userIds.length} candidate(s).`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to send bulk email');
    } finally {
      setActionLoading(false);
    }
  };



  const exportToCSV = () => {
    if (filteredApps.length === 0) {
      alert('No candidate applications to export.');
      return;
    }

    const headers = ['Application ID', 'Applicant Name', 'Email', 'Phone', 'Job Title', 'Department', 'Status', 'Feedback', 'Applied Date'];
    const rows = filteredApps.map(a => [
      `"${a.id}"`,
      `"${a.applicant_name || ''}"`,
      `"${a.applicant_email || ''}"`,
      `"${a.applicant_phone || ''}"`,
      `"${a.job_title || ''}"`,
      `"${a.department || ''}"`,
      `"${a.status}"`,
      `"${(a.feedback || '').replace(/"/g, '""')}"`,
      `"${new Date(a.applied_at).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TalentPulse_Candidate_Pipeline_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span>Candidate Application Review Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review applicant resumes, shortlist candidates, trigger interview scheduling, or send bulk communications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-850">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kanban Board
            </button>
          </div>

          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Pipeline (CSV)</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{msg}</span>
        </div>
      )}

      {/* ANIMATED PIPELINE FUNNEL STAGE FILTER OVERVIEW */}
      <InteractivePipeline 
        applications={applications} 
        selectedStatus={selectedStatus} 
        onSelectStatus={setSelectedStatus} 
      />
      {/* Filters & Bulk Action Controls */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, email, or role..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedJobId}
            onChange={e => setSelectedJobId(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Job Postings</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Pipeline Statuses</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Bulk Action Bar */}
        {selectedAppIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-indigo-200 shadow-lg"
          >
            <div className="flex items-center space-x-2 shrink-0">
              <div className="p-1.5 rounded-lg bg-indigo-600/50 text-amber-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm">
                  {selectedAppIds.length} candidate(s) selected
                </span>
                <span className="text-[11px] text-indigo-300/80 block">Choose a bulk pipeline transition or export selection</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={actionLoading}
                onClick={() => handleBulkStatusChange('Under Review')}
                className="px-2.5 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Under Review</span>
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleBulkStatusChange('Shortlisted')}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Shortlist</span>
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleBulkStatusChange('Interview Scheduled')}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Interview</span>
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleBulkStatusChange('Hired')}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Hire Candidates</span>
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleBulkStatusChange('Rejected')}
                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

              <button
                onClick={() => setShowBulkEmailModal(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Bulk Email</span>
              </button>

              <button
                onClick={() => {
                  const selectedApps = applications.filter(a => selectedAppIds.includes(a.id));
                  const headers = ['Application ID', 'Applicant Name', 'Email', 'Phone', 'Job Title', 'Department', 'Status', 'Feedback', 'Applied Date'];
                  const rows = selectedApps.map(a => [
                    `"${a.id}"`,
                    `"${a.applicant_name || ''}"`,
                    `"${a.applicant_email || ''}"`,
                    `"${a.applicant_phone || ''}"`,
                    `"${a.job_title || ''}"`,
                    `"${a.department || ''}"`,
                    `"${a.status}"`,
                    `"${(a.feedback || '').replace(/"/g, '""')}"`,
                    `"${new Date(a.applied_at).toLocaleDateString()}"`
                  ]);
                  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `TalentPulse_Selected_Candidates_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold transition-all flex items-center space-x-1 border border-slate-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export Selection</span>
              </button>

              <button
                onClick={() => setSelectedAppIds([])}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Clear Selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Kanban Board View or List View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-6 select-none">
          {[
            { status: 'Under Review', label: 'Under Review', bg: 'bg-amber-950/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'shadow-amber-500/2' },
            { status: 'Shortlisted', label: 'Shortlisted', bg: 'bg-indigo-950/10', text: 'text-indigo-400', border: 'border-indigo-500/20', glow: 'shadow-indigo-500/2' },
            { status: 'Interview Scheduled', label: 'Interviews', bg: 'bg-blue-950/10', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-blue-500/2' },
            { status: 'Hired', label: 'Hired', bg: 'bg-emerald-950/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/2' },
            { status: 'Rejected', label: 'Rejected', bg: 'bg-rose-950/10', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'shadow-rose-500/2' }
          ].map((st) => {
            const stageApps = filteredApps.filter(a => a.status === st.status);
            const isDragOver = activeDragCol === st.status;

            return (
              <div
                key={st.status}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (activeDragCol !== st.status) setActiveDragCol(st.status);
                }}
                onDragLeave={() => {
                  setActiveDragCol(null);
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  setActiveDragCol(null);
                  const appId = e.dataTransfer.getData('text/plain');
                  if (!appId) return;
                  
                  setActionLoading(true);
                  try {
                    await onUpdateStatus(appId, st.status, `Moved to ${st.status} via Kanban board.`);
                    setMsg(`Candidate status updated to ${st.status}`);
                    setTimeout(() => setMsg(''), 3000);
                  } catch (err: any) {
                    alert(err.message || 'Failed to move candidate.');
                  } finally {
                    setActionLoading(false);
                  }
                }}
                className={`flex flex-col min-h-[500px] max-h-[620px] rounded-2xl border bg-slate-900/40 p-4 transition-all duration-200 ${
                  isDragOver 
                    ? 'border-indigo-500 bg-slate-900/70 scale-[1.01] shadow-lg ring-2 ring-indigo-500/20' 
                    : `${st.border} ${st.bg} ${st.glow}`
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2 shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      st.status === 'Hired' ? 'bg-emerald-500 animate-pulse' :
                      st.status === 'Rejected' ? 'bg-rose-500' :
                      st.status === 'Shortlisted' ? 'bg-indigo-500' :
                      st.status === 'Interview Scheduled' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />
                    <span className="font-extrabold text-[11px] text-white uppercase tracking-wider">{st.label}</span>
                  </div>
                  <span className="text-[10px] font-black bg-slate-950 px-2 py-0.5 rounded-full text-slate-400">
                    {stageApps.length}
                  </span>
                </div>

                {/* Column Body / Cards List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-850">
                  {stageApps.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-800 rounded-2xl flex items-center justify-center text-center p-3 text-[10px] text-slate-500">
                      Drag candidates here
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <motion.div
                        key={app.id}
                        draggable
                        onDragStart={(e: any) => {
                          e.dataTransfer.setData('text/plain', app.id);
                        }}
                        whileHover={{ y: -2 }}
                        onClick={() => {
                          setReviewingApp(app);
                          setFeedbackInput(app.feedback || '');
                          setMatchScore(null);
                        }}
                        className="bg-slate-950 border border-slate-850 hover:border-slate-750 p-3.5 rounded-xl cursor-grab active:cursor-grabbing transition-all text-left space-y-3.5 shadow"
                      >
                        <div>
                          <div className="font-extrabold text-xs text-white truncate leading-snug">{app.applicant_name}</div>
                          <div className="text-[10px] text-slate-450 truncate mt-0.5">{app.applicant_email}</div>
                        </div>

                        <div className="border-t border-slate-900/60 pt-2 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-300 truncate">{app.job_title}</div>
                          <div className="text-[9px] text-indigo-400 font-semibold truncate">{app.department}</div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1.5 border-t border-slate-900/40">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-2.5 h-2.5 shrink-0" />
                            <span>{new Date(app.applied_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                          </span>

                          <span className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300 hover:text-white border border-slate-805 font-bold transition-all text-[8px] cursor-pointer">
                            Review
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Applications Table */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-4 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                      {selectedAppIds.length === filteredApps.length && filteredApps.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4">Applicant Candidate</th>
                  <th className="px-6 py-4">Applied Job Title</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      No candidate applications match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map(app => {
                    const isSelected = selectedAppIds.includes(app.id);

                    return (
                      <tr key={app.id} className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-indigo-950/30' : ''}`}>
                        <td className="px-4 py-4">
                          <button onClick={() => toggleSelectApp(app.id)} className="text-slate-400 hover:text-white">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-sm">{app.applicant_name}</div>
                          <div className="text-[11px] text-slate-400">{app.applicant_email} • {app.applicant_phone || 'No phone'}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-200">{app.job_title}</div>
                          <div className="text-[11px] text-indigo-400">{app.department}</div>
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {new Date(app.applied_at).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4">
                          {app.status === 'Hired' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
                              Hired
                            </span>
                          )}
                          {app.status === 'Shortlisted' && (
                            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 text-[10px]">
                              Shortlisted
                            </span>
                          )}
                          {app.status === 'Interview Scheduled' && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30 text-[10px]">
                              Interview Scheduled
                            </span>
                          )}
                          {app.status === 'Under Review' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 text-[10px]">
                              Under Review
                            </span>
                          )}
                          {app.status === 'Rejected' && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30 text-[10px]">
                              Rejected
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                          onClick={() => {
                            setReviewingApp(app);
                            setFeedbackInput(app.feedback || '');
                            setMatchScore(null);
                          }}
                          className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg font-semibold border border-indigo-500/30 transition-all text-[11px] cursor-pointer"
                        >
                            Review CV
                          </button>

                          <button
                            onClick={() => onScheduleInterviewClick(app)}
                            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg font-semibold border border-blue-500/30 transition-all text-[11px] inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Schedule Int.</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SINGLE APPLICANT REVIEW MODAL */}
      <AnimatePresence>
        {reviewingApp && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 pb-10 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
              onClick={() => setReviewingApp(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 text-slate-200 z-10"
            >
            
            <button
              onClick={() => setReviewingApp(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {reviewingApp.status === 'Hired' ? (
              /* HIRED CANDIDATE DESIGN LAYOUT */
              <div className="space-y-5">
                <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                  <div className="p-2.5 bg-emerald-500 rounded-xl text-white">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">🎉 Candidate Hired!</h3>
                    <p className="text-xs text-slate-400">This candidate is now a selected employee for the team.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Full Name</div>
                    <div className="text-sm font-semibold text-white">{reviewingApp.applicant_name}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Contact Details</div>
                    <div className="text-xs text-slate-300">{reviewingApp.applicant_email}</div>
                    <div className="text-xs text-slate-400">{reviewingApp.applicant_phone || 'No phone'}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Job Title</div>
                    <div className="text-sm font-semibold text-indigo-400">{reviewingApp.job_title}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Department</div>
                    <div className="text-sm font-semibold text-slate-300">{reviewingApp.department}</div>
                  </div>
                </div>

                {/* Hiring feedback */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <MessageSquare className="w-4.5 h-4.5 text-emerald-400" />
                    <span>HR Hiring Decision & Notes</span>
                  </div>
                  <p className="text-xs text-slate-300 italic whitespace-pre-line leading-relaxed">
                    {reviewingApp.feedback || 'No specific feedback recorded during transition.'}
                  </p>
                </div>

                {/* CV Document view for reference */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-white">{reviewingApp.resume_filename || 'Candidate_Resume.pdf'}</div>
                      <div className="text-[10px] text-slate-400">Reference CV</div>
                    </div>
                  </div>
                  <a
                    href={reviewingApp.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-slate-850 hover:bg-slate-750 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 border border-slate-700"
                  >
                    <span>View CV</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Hired Operations Actions */}
                <div className="pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        alert('Simulating Onboarding Email Broadcast to ' + reviewingApp.applicant_email + '. Welcome guide and next steps sent!');
                      }}
                      className="px-4 py-2 bg-emerald-650 hover:bg-emerald-550 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Send Welcome Email</span>
                    </button>

                    <button
                      onClick={() => {
                        const template = `TALENTPULSE GHANA
123 Independence Avenue, Ridge
Accra, Ghana
Contact: +233 20 123 4567 | hr@talentpulse.gh

======================================================================
EMPLOYMENT OFFER LETTER
======================================================================

Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}

Applicant Name: ${reviewingApp.applicant_name}
Email Address: ${reviewingApp.applicant_email}

Dear ${reviewingApp.applicant_name},

Following our recent interview and evaluation process, we are exceptionally pleased to formally offer you the position of ${reviewingApp.job_title} within the ${reviewingApp.department} department at TalentPulse Ghana. 

We were highly impressed by your background, skills, and the unique perspective you will bring to our team. We are confident that you will play a key role in our company's ongoing success and growth.

Please find the details of your employment offer below:

1. POSITION AND REPORTING
   Job Title: ${reviewingApp.job_title}
   Department: ${reviewingApp.department}
   Employment Type: Full-Time
   Reporting To: [Manager's Name / Head of ${reviewingApp.department}]

2. COMPENSATION AND BENEFITS
   Base Salary: GHS [0.00] per annum, payable monthly in arrears.
   Performance Bonus: Eligible for an annual performance-based bonus up to [X]% of base salary.
   Allowances: [e.g., Transportation, Housing, Internet] allowance of GHS [0.00] per month.
   Health Insurance: Comprehensive medical cover for you and your dependents starting from day one.
   Leave: 21 working days of paid annual leave, in addition to statutory public holidays.

3. COMMENCEMENT
   Proposed Start Date: [Select Date]
   Location: Accra Headquarters / Remote

4. CONDITIONS OF EMPLOYMENT
   This offer is contingent upon the successful completion of standard background checks and the provision of certified copies of your educational and professional credentials.

Please indicate your acceptance of this offer by signing and dating this letter below, and returning a copy to the HR Department by [Expiry Date]. If you require any clarification regarding the terms outlined above, please do not hesitate to contact us.

We are very excited to welcome you to the TalentPulse Ghana family!

Sincerely,

_________________________
HR Director
TalentPulse Ghana


ACCEPTANCE OF OFFER
I, ${reviewingApp.applicant_name}, accept the offer of employment as outlined in this letter and agree to the terms and conditions stated above.

Signature: _________________________

Date: _________________________`;
                        setOfferContent(template);
                        setShowOfferLetterModal(true);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Generate Contract</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleSingleStatusUpdate('Under Review')}
                    disabled={actionLoading}
                    className="px-3.5 py-2 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Revert Hired Status</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE JOB APPLICANT DESIGN LAYOUT */
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Application Review
                  </span>
                  <h3 className="text-xl font-bold text-white">{reviewingApp.applicant_name}</h3>
                  <p className="text-xs text-slate-400">
                    Applying for <span className="font-semibold text-white">{reviewingApp.job_title}</span> • {reviewingApp.applicant_email}
                  </p>
                </div>

                {/* Resume Attachment preview link */}
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-7 h-7 text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-white">{reviewingApp.resume_filename || 'Candidate_Resume.pdf'}</div>
                      <div className="text-[10px] text-slate-400">CV attached during application submission</div>
                    </div>
                  </div>

                  {reviewingApp.resume_url ? (
                    <a
                      href={reviewingApp.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow"
                    >
                      <span>View CV Document</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      onClick={() => alert("No CV was uploaded for this application.")}
                      className="px-3.5 py-2 bg-slate-700 text-slate-400 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow cursor-not-allowed"
                    >
                      <span>No CV Uploaded</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  )}
                </div>

                {/* Cover letter */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 mb-2">Candidate Cover Letter</h4>
                    {reviewingApp.cover_letter_url ? (
                      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-7 h-7 text-indigo-400" />
                          <div>
                            <div className="text-xs font-bold text-white">{reviewingApp.cover_letter_filename || 'Cover_Letter.pdf'}</div>
                            <div className="text-[10px] text-slate-400">Attached Cover Letter Document</div>
                          </div>
                        </div>
                        <a
                          href={reviewingApp.cover_letter_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow"
                        >
                          <span>View Cover Letter</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : null}
                    
                    {reviewingApp.cover_letter ? (
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                        {reviewingApp.cover_letter}
                      </div>
                    ) : (
                      !reviewingApp.cover_letter_url && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs italic">
                          No cover letter provided.
                        </div>
                      )
                    )}
                  </div>
                </div>


                {/* HR Feedback Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    HR Internal Feedback & Candidate Message
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional notes or feedback sent to the candidate..."
                    value={feedbackInput}
                    onChange={e => setFeedbackInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-550"
                  />
                </div>

                {/* Action Buttons */}
                <div className="border-t border-slate-800 pt-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSingleStatusUpdate('Under Review')}
                      disabled={actionLoading}
                      className="px-3.5 py-2 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white rounded-xl text-xs font-semibold border border-amber-500/30 transition-all cursor-pointer"
                    >
                      <span>Under Review</span>
                    </button>

                    <button
                      onClick={() => handleSingleStatusUpdate('Shortlisted')}
                      disabled={actionLoading}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Shortlist</span>
                    </button>

                    <button
                      onClick={() => handleSingleStatusUpdate('Rejected')}
                      disabled={actionLoading}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const appToSchedule = reviewingApp;
                        setReviewingApp(null);
                        onScheduleInterviewClick(appToSchedule);
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule Int.</span>
                    </button>

                    <button
                      onClick={() => handleSingleStatusUpdate('Hired')}
                      disabled={actionLoading}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Hire Candidate</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* BULK EMAIL BROADCAST MODAL */}
      {showBulkEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowBulkEmailModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Mail className="w-5 h-5 text-indigo-400" />
              <span>Bulk Candidate Email Broadcast</span>
            </h3>

            <p className="text-xs text-slate-400">
              Send custom in-app notification & simulated email to {selectedAppIds.length} selected candidate(s).
            </p>

            <form onSubmit={handleSendBulkEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Subject / Notification Title</label>
                <input
                  type="text"
                  required
                  value={bulkEmailTitle}
                  onChange={e => setBulkEmailTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  value={bulkEmailBody}
                  onChange={e => setBulkEmailBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkEmailModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  {actionLoading ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFER LETTER MODAL */}
      <AnimatePresence>
      {showOfferLetterModal && reviewingApp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm print-override-bg">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-200 rounded-lg max-w-3xl w-full p-0 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden offer-print-container"
          >
            {/* Modal Header (Hidden on print) */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between hide-on-print shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>Offer Letter Generator</span>
                </h3>
                <p className="text-xs text-slate-500">Edit the template below and export to PDF.</p>
              </div>
              <button
                onClick={() => setShowOfferLetterModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto bg-slate-100 p-6 hide-on-print">
              <textarea
                value={offerContent}
                onChange={e => setOfferContent(e.target.value)}
                className="w-full min-h-[500px] p-8 bg-white border border-slate-200 shadow-sm rounded-lg text-sm text-slate-800 font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
            </div>

            {/* Print Only View */}
            <div className="print-only-view p-12 font-serif text-black leading-relaxed whitespace-pre-wrap text-sm hidden">
              {offerContent}
            </div>

            {/* Modal Footer (Hidden on print) */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center hide-on-print shrink-0">
              <span className="text-xs text-slate-500">Draft saved locally.</span>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowOfferLetterModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center space-x-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export as PDF</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

    </div>
  );
};
