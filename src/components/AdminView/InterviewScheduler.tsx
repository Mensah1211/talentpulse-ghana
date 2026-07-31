import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  User, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Award, 
  X, 
  Search,
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Interview, Application, InterviewOutcome, InterviewMode } from '../../types';
import { api } from '../../lib/api';

interface InterviewSchedulerProps {
  interviews: Interview[];
  applications: Application[];
  initialApplicationToSchedule?: Application | null;
  onScheduleInterview: (data: any) => Promise<void>;
  onUpdateOutcome: (id: string, outcome: string, notes?: string) => Promise<void>;
  isLoading: boolean;
}

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  interviews,
  applications,
  initialApplicationToSchedule,
  onScheduleInterview,
  onUpdateOutcome,
  isLoading,
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(!!initialApplicationToSchedule);
  
  // Schedule Form State
  const [selectedAppId, setSelectedAppId] = useState(initialApplicationToSchedule?.id || '');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [mode, setMode] = useState<InterviewMode>('Virtual');
  const [locationOrLink, setLocationOrLink] = useState('https://meet.google.com/talentpulse-interview-room');
  const [notes, setNotes] = useState('');

  // Outcome modal
  const [selectedInterviewForOutcome, setSelectedInterviewForOutcome] = useState<Interview | null>(null);
  const [targetOutcome, setTargetOutcome] = useState<InterviewOutcome>('Passed');
  const [outcomeNotes, setOutcomeNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // AI Interview Questions states
  const [aiQuestionsMap, setAiQuestionsMap] = useState<Record<string, any[]>>({});
  const [loadingQuestionsId, setLoadingQuestionsId] = useState<string | null>(null);
  const [viewQuestionsId, setViewQuestionsId] = useState<string | null>(null);

  const handleGenerateQuestions = async (interview: Interview) => {
    // Toggle view if already loaded
    if (aiQuestionsMap[interview.id]) {
      setViewQuestionsId(viewQuestionsId === interview.id ? null : interview.id);
      return;
    }

    setLoadingQuestionsId(interview.id);
    try {
      const res = await api.generateInterviewQuestions(interview.job_id, interview.applicant_id);
      setAiQuestionsMap(prev => ({ ...prev, [interview.id]: res.questions }));
      setViewQuestionsId(interview.id);
    } catch (err: any) {
      alert(err.message || 'Failed to generate interview questions.');
    } finally {
      setLoadingQuestionsId(null);
    }
  };

  // Eligible applications for scheduling (Shortlisted or Under Review)
  const eligibleApps = applications.filter(a => a.status !== 'Rejected' && a.status !== 'Hired');

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) return;

    setSaving(true);
    try {
      await onScheduleInterview({
        application_id: selectedAppId,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        mode,
        location_or_link: locationOrLink,
        notes,
      });

      setMsg('Interview scheduled successfully & notification sent to candidate!');
      setShowScheduleModal(false);
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to schedule interview');
    } finally {
      setSaving(false);
    }
  };

  const handleOutcomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterviewForOutcome) return;

    setSaving(true);
    try {
      await onUpdateOutcome(selectedInterviewForOutcome.id, targetOutcome, outcomeNotes);
      setMsg(`Interview outcome updated to "${targetOutcome}".`);
      setSelectedInterviewForOutcome(null);
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update interview outcome');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-indigo-400" />
            <span>Interview Scheduler & Outcome Tracker</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Book virtual or in-person candidate interviews, manage Google Meet links, and log evaluation outcomes.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedAppId(eligibleApps[0]?.id || '');
            setShowScheduleModal(true);
          }}
          className="px-5 py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Interview</span>
        </button>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{msg}</span>
        </div>
      )}

      {/* Scheduled Interviews List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <span>Upcoming & Past Scheduled Interviews ({interviews.length})</span>
        </h3>

        {interviews.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No interviews scheduled yet. Click "Schedule New Interview" to begin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviews.map(item => (
              <div
                key={item.id}
                className="bg-slate-800/60 border border-slate-700/80 hover:border-indigo-500/40 rounded-xl p-5 space-y-4 transition-all shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
                      {item.mode}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">{item.applicant_name}</h4>
                    <div className="text-xs text-indigo-400">{item.job_title}</div>
                  </div>

                  <div>
                    {item.outcome === 'Hired' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        Hired
                      </span>
                    )}
                    {item.outcome === 'Passed' && (
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                        Passed
                      </span>
                    )}
                    {item.outcome === 'Failed' && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                        Not Passed
                      </span>
                    )}
                    {item.outcome === 'Pending' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber- 모/30">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-700/60">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date & Time</span>
                    <span className="font-semibold">{item.scheduled_date} at {item.scheduled_time}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Interviewer</span>
                    <span className="font-semibold">{item.interviewer_name}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300">
                  <span className="text-slate-400 text-[10px] block">Location / Link</span>
                  {item.mode === 'Virtual' ? (
                    <a
                      href={item.location_or_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:underline font-semibold flex items-center space-x-1"
                    >
                      <span>Join Meeting Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="font-semibold">{item.location_or_link}</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
                  <button
                    disabled={loadingQuestionsId === item.id}
                    onClick={() => handleGenerateQuestions(item)}
                    className="px-3 py-1.5 bg-indigo-650/20 hover:bg-indigo-650 text-indigo-300 hover:text-white rounded-lg text-xs font-bold border border-indigo-500/25 transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{loadingQuestionsId === item.id ? 'Generating...' : (viewQuestionsId === item.id ? 'Hide AI Prep' : 'AI Prep Questions')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedInterviewForOutcome(item);
                      setTargetOutcome(item.outcome !== 'Pending' ? item.outcome : 'Passed');
                      setOutcomeNotes(item.notes || '');
                    }}
                    className="px-3 py-1.5 bg-slate-850 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                  >
                    Log Outcome
                  </button>
                </div>

                {viewQuestionsId === item.id && aiQuestionsMap[item.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-4 bg-slate-950 rounded-xl border border-indigo-500/10 space-y-3 max-h-60 overflow-y-auto scrollbar-thin"
                  >
                    <div className="text-[10px] font-black text-indigo-400 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      <span>RECOMMENDED AI INTERVIEW QUESTIONS (GEMINI)</span>
                    </div>

                    {aiQuestionsMap[item.id].map((q, idx) => (
                      <div key={idx} className="space-y-1.5 text-xs border-b border-slate-900 pb-2.5 last:border-0 last:pb-0">
                        <div className="font-extrabold text-slate-100 flex items-start space-x-1">
                          <span className="text-indigo-455 mt-0.5 shrink-0">{idx + 1}.</span>
                          <span>{q.question}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex flex-wrap gap-2 items-center">
                          <span className="px-1.5 py-0.5 rounded bg-slate-905 border border-slate-850 text-slate-300 font-bold uppercase text-[8px]">{q.category}</span>
                          <span><strong>Focus:</strong> {q.target_answer}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SCHEDULE MODAL */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 pb-10 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
              onClick={() => setShowScheduleModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative z-10 text-slate-200"
            >
              <button
                onClick={() => setShowScheduleModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

            <h3 className="text-xl font-bold text-white">Schedule Candidate Interview</h3>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Applicant Candidate</label>
                <select
                  required
                  value={selectedAppId}
                  onChange={e => setSelectedAppId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="">Select applicant...</option>
                  {eligibleApps.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.applicant_name} ({app.job_title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mode</label>
                  <select
                    value={mode}
                    onChange={e => {
                      const newMode = e.target.value as InterviewMode;
                      setMode(newMode);
                      if (newMode === 'In-person') {
                        setLocationOrLink('Main Corporate Office, Building B - Conf Room 302');
                      } else {
                        setLocationOrLink('https://meet.google.com/talentpulse-interview-room');
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-semibold"
                  >
                    <option value="Virtual">Virtual Video Call</option>
                    <option value="In-person">In-person Office Visit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Meeting Link or Office Address</label>
                  <input
                    type="text"
                    required
                    value={locationOrLink}
                    onChange={e => setLocationOrLink(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Interviewer Notes / Agenda</label>
                <textarea
                  rows={2}
                  placeholder="System design, coding challenge review, portfolio discussion..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20"
                >
                  {saving ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* OUTCOME MODAL */}
      <AnimatePresence>
        {selectedInterviewForOutcome && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 pb-10 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
              onClick={() => setSelectedInterviewForOutcome(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative z-10 text-slate-200"
            >
              <button
                onClick={() => setSelectedInterviewForOutcome(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white">
                Log Evaluation Outcome for {selectedInterviewForOutcome.applicant_name}
              </h3>

              <form onSubmit={handleOutcomeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Evaluation Decision</label>
                  <select
                    value={targetOutcome}
                    onChange={e => setTargetOutcome(e.target.value as InterviewOutcome)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-semibold"
                  >
                    <option value="Passed">Passed (Advance to next stage)</option>
                    <option value="Hired">Hired (Extend official job offer!)</option>
                    <option value="Failed">Failed / Not Selected</option>
                    <option value="Pending">Pending Evaluation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Evaluation Notes / HR Feedback</label>
                  <textarea
                    rows={3}
                    placeholder="Strong technical mastery, great culture fit..."
                    value={outcomeNotes}
                    onChange={e => setOutcomeNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedInterviewForOutcome(null)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                  >
                    {saving ? 'Updating...' : 'Save Decision'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
