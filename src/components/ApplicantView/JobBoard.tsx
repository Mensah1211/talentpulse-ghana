import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase, 
  Building2, 
  Filter, 
  CheckCircle2, 
  Send, 
  X, 
  Upload, 
  FileText,
  Sparkles,
  ArrowRight,
  Bookmark
} from 'lucide-react';
import { Job, User, Application } from '../../types';
import { api } from '../../lib/api';

interface JobBoardProps {
  jobs: Job[];
  user: User | null;
  myApplications: Application[];
  onApply: (jobId: string, coverLetter: string, resumeUrl?: string, resumeFilename?: string, coverLetterUrl?: string, coverLetterFilename?: string) => Promise<void>;
  onOpenAuth: () => void;
  isLoading: boolean;
}

const JOB_TYPE_BRIEFS: Record<string, { summary: string; details: string; iconColor: string }> = {
  'Full-time': {
    summary: '40 Hours / Week • Permanent Role',
    details: 'Standard permanent employment (40 hours/week) offering fixed monthly salary, health insurance, SSNIT pension contributions, paid annual leave, and structured career growth.',
    iconColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800'
  },
  'Part-time': {
    summary: '15–25 Hours / Week • Flexible Schedule',
    details: 'Part-time position with flexible hours (typically 15 to 25 hours per week). Ideal for professionals balancing university studies, personal commitments, or independent projects.',
    iconColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800'
  },
  'Contract': {
    summary: 'Fixed-Term • Project Deliverable Basis',
    details: 'Project-focused contract engagement for a specified timeline (e.g. 3 to 12 months) focused on tangible milestones with competitive rates and renewal options.',
    iconColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800'
  },
  'Remote': {
    summary: '100% Work From Anywhere in Ghana',
    details: 'Fully remote role allowing you to work from home or any location across Ghana. Features flexible core hours, virtual team collaboration, and internet data stipends.',
    iconColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800'
  },
  'Hybrid': {
    summary: 'Office + Remote Balanced Model',
    details: 'Hybrid working arrangement combining 2–3 days in-office collaboration (e.g. Accra or Kumasi office) with 2–3 days remote work per week for optimal productivity.',
    iconColor: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-200/60 dark:border-teal-800'
  },
  'Internship': {
    summary: '3–6 Months • Mentorship & Growth',
    details: 'Structured entry-level development program for tertiary graduates or junior IT talent. Features 1-on-1 technical mentorship, real-world tasks, monthly allowance, and full-time hiring evaluation.',
    iconColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800'
  }
};

const getJobTypeBrief = (type: string) => {
  return JOB_TYPE_BRIEFS[type] || {
    summary: 'Standard Position',
    details: 'Professional engagement with defined responsibilities, competitive compensation, and team integration.',
    iconColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
  };
};

export const JobBoard: React.FC<JobBoardProps> = ({
  jobs,
  user,
  myApplications,
  onApply,
  onOpenAuth,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  
  // Bookmarked / Saved Job IDs in LocalStorage
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('talentpulse_saved_jobs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleBookmark = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (savedJobIds.includes(jobId)) {
      updated = savedJobIds.filter(id => id !== jobId);
    } else {
      updated = [...savedJobIds, jobId];
    }
    setSavedJobIds(updated);
    try {
      localStorage.setItem('talentpulse_saved_jobs', JSON.stringify(updated));
    } catch (e) {}
  };
  
  // Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [uploadedResume, setUploadedResume] = useState<{ url: string; filename: string } | null>(null);
  const [uploadedCoverLetter, setUploadedCoverLetter] = useState<{ url: string; filename: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Extract departments
  const departments = Array.from(new Set(jobs.map(j => j.department).filter(Boolean))).sort();

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (job.status !== 'published') return false;
    if (showOnlySaved && !savedJobIds.includes(job.id)) return false;
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || 
                          job.title.toLowerCase().includes(term) ||
                          job.description.toLowerCase().includes(term) ||
                          job.location.toLowerCase().includes(term) ||
                          job.department.toLowerCase().includes(term) ||
                          job.employment_type.toLowerCase().includes(term) ||
                          (job.requirements && job.requirements.some(r => r.toLowerCase().includes(term)));
    const matchesDept = selectedDept === 'all' || job.department.toLowerCase() === selectedDept.toLowerCase();
    const matchesType = selectedType === 'all' || job.employment_type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesDept && matchesType;
  });

  const hasActiveFilters = searchTerm !== '' || selectedDept !== 'all' || selectedType !== 'all' || showOnlySaved;

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDept('all');
    setSelectedType('all');
    setShowOnlySaved(false);
  };

  const getApplicationStatusForJob = (jobId: string) => {
    return myApplications.find(a => a.job_id === jobId);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!user) {
      onOpenAuth();
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Use the explicitly uploaded resume, OR fallback to the user's saved profile resume if none was attached
      const finalResumeUrl = uploadedResume?.url;
      const finalResumeFilename = uploadedResume?.filename;

      if (!finalResumeUrl) {
        throw new Error('Please attach a CV/Resume before submitting your application.');
      }

      await onApply(
        selectedJob.id,
        coverLetter,
        finalResumeUrl,
        finalResumeFilename,
        uploadedCoverLetter?.url,
        uploadedCoverLetter?.filename
      );
      setSuccessMsg('Application submitted successfully!');
      setTimeout(() => {
        setShowApplyModal(false);
        setCoverLetter('');
        setUploadedResume(null);
        setUploadedCoverLetter(null);
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const uploaded = await api.uploadFile(file);
        setUploadedResume({
          url: uploaded.url,
          filename: uploaded.filename,
        });
      } catch (err: any) {
        setErrorMsg('Failed to upload CV: ' + err.message);
      }
    }
  };

  const handleCoverLetterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const uploaded = await api.uploadFile(file);
        setUploadedCoverLetter({
          url: uploaded.url,
          filename: uploaded.filename,
        });
      } catch (err: any) {
        setErrorMsg('Failed to upload Cover Letter: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-8 sm:p-12 overflow-hidden shadow-lg shadow-blue-500/10 border border-blue-500/20">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Discover Top Career Opportunities in Ghana</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Find Your Next Career Move in Ghana with <span className="underline decoration-blue-300 underline-offset-4">TalentPulse Ghana</span>
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Explore verified job openings across Accra, Kumasi, Takoradi, and Remote Ghana. Apply seamlessly with your saved profile and CV.
          </p>

          {/* Search bar inside hero */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-blue-200" />
              <input
                type="text"
                placeholder="Search job title, skills, location (Accra, Kumasi)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-100 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3.5 text-blue-200 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-xs font-medium cursor-pointer"
            >
              <option value="all" className="text-slate-900">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d} className="text-slate-900">{d}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-xs font-medium cursor-pointer"
            >
              <option value="all" className="text-slate-900">All Job Types</option>
              <option value="Full-time" className="text-slate-900">Full-time</option>
              <option value="Part-time" className="text-slate-900">Part-time</option>
              <option value="Contract" className="text-slate-900">Contract</option>
              <option value="Remote" className="text-slate-900">Remote</option>
              <option value="Hybrid" className="text-slate-900">Hybrid</option>
              <option value="Internship" className="text-slate-900">Internship</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center space-x-2 pt-1 text-xs">
              <span className="text-blue-200">Active filters applied</span>
              <button
                onClick={resetFilters}
                className="underline hover:text-white text-blue-100 font-semibold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Jobs Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>Available Postings</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
              {filteredJobs.length} open
            </span>
          </h2>

          <button
            type="button"
            onClick={() => setShowOnlySaved(!showOnlySaved)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              showOnlySaved
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${showOnlySaved ? 'fill-white' : 'text-amber-500'}`} />
            <span>{showOnlySaved ? 'Showing Saved Jobs' : `Saved (${savedJobIds.length})`}</span>
          </button>
        </div>

        {filteredJobs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 shadow-xs"
          >
            <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No matching job postings found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {showOnlySaved ? 'You have no saved jobs yet. Click the bookmark icon on any job card to save it.' : 'Try broadening your search term or department filters.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredJobs.map((job, idx) => {
              const app = getApplicationStatusForJob(job.id);
              const isSaved = savedJobIds.includes(job.id);

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.4) }}
                  whileHover={{ y: -3 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 rounded-2xl p-6 transition-colors shadow-xs hover:shadow-md group flex flex-col justify-between relative"
                >
                  <div className="space-y-4">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900/60 px-2.5 py-0.5 rounded-md mb-2">
                          {job.department}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {job.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => toggleBookmark(job.id, e)}
                          title={isSaved ? 'Remove from saved' : 'Save job posting'}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            isSaved 
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' 
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-amber-500 hover:bg-amber-50 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                        </button>

                        {app ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Applied</span>
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {job.employment_type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>GH₵ {job.salary_min.toLocaleString()} - GH₵ {job.salary_max.toLocaleString()} / yr</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Posted by {job.posted_by_name || 'HR Team'}
                    </span>

                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-600 dark:hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white dark:hover:text-white border border-blue-100 dark:border-blue-900/60 transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* JOB DETAILS MODAL */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 pb-10 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
              onClick={() => setSelectedJob(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 text-slate-800 dark:text-slate-100 z-10"
            >
            
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                  {selectedJob.department}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {selectedJob.employment_type}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedJob.title}</h2>
              
              <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{selectedJob.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>GH₵ {selectedJob.salary_min.toLocaleString()} - GH₵ {selectedJob.salary_max.toLocaleString()} / year</span>
                </div>
              </div>
            </div>

            {/* Job Type Brief & Explanation */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Job Type Overview: <span className="text-blue-600 dark:text-blue-400">{selectedJob.employment_type}</span>
                  </span>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getJobTypeBrief(selectedJob.employment_type).iconColor}`}>
                  {getJobTypeBrief(selectedJob.employment_type).summary}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {getJobTypeBrief(selectedJob.employment_type).details}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Role Description</h4>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {selectedJob.description}
              </p>
            </div>

            {/* Requirements */}
            {selectedJob.requirements && selectedJob.requirements.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Key Requirements & Qualifications</h4>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Application Deadline: <span className="font-semibold text-slate-800 dark:text-slate-200">{new Date(selectedJob.deadline).toLocaleDateString()}</span>
              </div>

              {getApplicationStatusForJob(selectedJob.id) ? (
                <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Application Submitted</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!user) {
                      onOpenAuth();
                    } else {
                      setShowApplyModal(true);
                    }
                  }}
                  className="px-6 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white text-sm shadow-sm shadow-blue-200 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Apply Now</span>
                </button>
              )}
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* APPLY FORM MODAL */}
      <AnimatePresence>
        {showApplyModal && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 pb-10 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
              onClick={() => setShowApplyModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 text-slate-800 z-10"
            >
            
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Apply for {selectedJob.title}</h3>
              <p className="text-xs text-slate-500">Submit your cover letter and confirmation details below.</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Applicant Profile Info
                </label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div><span className="text-slate-500">Name:</span> <span className="font-semibold text-slate-900">{user?.name}</span></div>
                  <div><span className="text-slate-500">Email:</span> <span className="font-semibold text-slate-900">{user?.email}</span></div>
                  <div><span className="text-slate-500">Phone:</span> <span className="font-semibold text-slate-900">{user?.phone || 'Not specified'}</span></div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cover Letter
                </label>
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 transition-colors bg-slate-50">
                    <input
                      type="file"
                      id="coverLetterUpload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCoverLetterUpload}
                      className="hidden"
                    />
                    <label htmlFor="coverLetterUpload" className="cursor-pointer space-y-2 block">
                      <FileText className="w-8 h-8 text-blue-600 mx-auto" />
                      <div className="text-xs text-slate-600">
                        {uploadedCoverLetter ? (
                          <span className="font-semibold text-emerald-600">Attached: {uploadedCoverLetter.filename}</span>
                        ) : (
                          <span>Click to attach Cover Letter (PDF/DOCX)</span>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resume / CV Document
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 transition-colors bg-slate-50">
                  <input
                    type="file"
                    id="resumeUpload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="resumeUpload" className="cursor-pointer space-y-2 block">
                    <FileText className="w-8 h-8 text-blue-600 mx-auto" />
                    <div className="text-xs text-slate-600">
                      {uploadedResume ? (
                        <span className="font-semibold text-emerald-600">Attached: {uploadedResume.filename}</span>
                      ) : (
                        <span>Click to attach PDF or DOCX file (or use saved profile resume)</span>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-sm shadow-blue-200 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Application'}
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
