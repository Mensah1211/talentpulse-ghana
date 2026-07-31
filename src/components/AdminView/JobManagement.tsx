import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search, 
  CheckCircle2, 
  Clock, 
  X, 
  Building2, 
  MapPin, 
  DollarSign, 
  Tag,
  AlertCircle,
  Sparkles,
  CheckSquare,
  Square,
  Download,
  XCircle
} from 'lucide-react';
import { Job, EmploymentType, JobStatus } from '../../types';
import { api } from '../../lib/api';

export const GHANA_REGIONS = [
  'Greater Accra Region',
  'Ashanti Region',
  'Western Region',
  'Central Region',
  'Eastern Region',
  'Northern Region',
  'Volta Region',
  'Bono Region',
  'Bono East Region',
  'Ahafo Region',
  'Oti Region',
  'Savannah Region',
  'North East Region',
  'Upper East Region',
  'Upper West Region',
  'Western North Region',
  'Remote (Ghana)',
  'Custom Location'
];

interface JobManagementProps {
  jobs: Job[];
  onCreateJob: (jobData: any) => Promise<void>;
  onUpdateJob: (id: string, updates: any) => Promise<void>;
  onDeleteJob: (id: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  isLoading: boolean;
  isSuperAdmin?: boolean;
}

export const JobManagement: React.FC<JobManagementProps> = ({
  jobs,
  onCreateJob,
  onUpdateJob,
  onDeleteJob,
  onRefresh,
  isLoading,
  isSuperAdmin = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Software Engineering');
  
  // Location States (16 Regions of Ghana + Custom/Remote)
  const [selectedRegion, setSelectedRegion] = useState<string>('Greater Accra Region');
  const [customCityDetail, setCustomCityDetail] = useState<string>('');
  const [location, setLocation] = useState('Greater Accra Region');

  const [salaryMin, setSalaryMin] = useState<number>(100000);
  const [salaryMax, setSalaryMax] = useState<number>(130000);
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
  const [deadline, setDeadline] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<JobStatus>('published');

  const updateLocationValue = (region: string, cityDetail: string) => {
    if (region === 'Custom Location') {
      setLocation(cityDetail.trim() || 'Ghana');
    } else if (region === 'Remote (Ghana)') {
      setLocation('Remote (Ghana)');
    } else {
      if (cityDetail.trim()) {
        setLocation(`${cityDetail.trim()}, ${region}`);
      } else {
        setLocation(region);
      }
    }
  };

  const handleRegionSelect = (newRegion: string) => {
    setSelectedRegion(newRegion);
    updateLocationValue(newRegion, customCityDetail);
  };

  const handleCityDetailChange = (newDetail: string) => {
    setCustomCityDetail(newDetail);
    updateLocationValue(selectedRegion, newDetail);
  };

  // Requirements builder
  const [requirements, setRequirements] = useState<string[]>([
    'Strong software engineering fundamentals',
    '3+ years experience with modern stack'
  ]);
  const [reqInput, setReqInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Bulk selection state
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMsg, setBulkMsg] = useState('');

  const openCreateModal = () => {
    setEditingJob(null);
    setTitle('');
    setDescription('');
    setDepartment('Software Engineering');
    setSelectedRegion('Greater Accra Region');
    setCustomCityDetail('');
    setLocation('Greater Accra Region');
    setSalaryMin(90000);
    setSalaryMax(140000);
    setEmploymentType('Full-time');
    setDeadline(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setStatus('published');
    setRequirements(['3+ years relevant industry experience in Ghana', 'Strong team collaboration skills']);
    setShowModal(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setDepartment(job.department);
    
    // Parse region vs town detail
    const matchedRegion = GHANA_REGIONS.find(r => r !== 'Custom Location' && r !== 'Remote (Ghana)' && job.location.includes(r));
    if (matchedRegion) {
      setSelectedRegion(matchedRegion);
      const detail = job.location.replace(matchedRegion, '').replace(/^,\s*/, '').replace(/,\s*$/, '').trim();
      setCustomCityDetail(detail);
      setLocation(job.location);
    } else if (job.location === 'Remote (Ghana)' || job.location.toLowerCase().includes('remote')) {
      setSelectedRegion('Remote (Ghana)');
      setCustomCityDetail('');
      setLocation(job.location);
    } else {
      setSelectedRegion('Custom Location');
      setCustomCityDetail(job.location);
      setLocation(job.location);
    }

    setSalaryMin(job.salary_min);
    setSalaryMax(job.salary_max);
    setEmploymentType(job.employment_type);
    setDeadline(job.deadline.split('T')[0]);
    setStatus(job.status);
    setRequirements(job.requirements || []);
    setShowModal(true);
  };

  const handleAddReq = () => {
    if (reqInput.trim() && !requirements.includes(reqInput.trim())) {
      setRequirements([...requirements, reqInput.trim()]);
      setReqInput('');
    }
  };

  const handleGenerateAiDescription = () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a Job Title first to generate an AI description.');
      return;
    }
    setErrorMsg('');
    const generatedDesc = `We are seeking a high-performing, growth-minded ${title} to join our dynamic ${department} team in Ghana. In this ${employmentType.toLowerCase()} role, you will lead high-impact initiatives across Accra and West Africa, collaborate across functional teams, and drive operational excellence. You will contribute to scalable systems, mentor team members, and deliver key strategic milestones aligned with organizational growth goals.`;
    
    const sampleReqs = [
      `3+ years of professional experience in ${department} or related tech domain in Ghana`,
      `Demonstrated expertise as a ${title} with a track record of delivering complex projects`,
      'Strong problem-solving, strategic thinking, and analytical abilities',
      'Excellent cross-functional communication and team collaboration skills',
      'Bachelor degree from UG, KNUST, Ashesi, or equivalent practical industry experience'
    ];

    setDescription(generatedDesc);
    setRequirements(sampleReqs);
  };

  const handleRemoveReq = (reqToRemove: string) => {
    setRequirements(requirements.filter(r => r !== reqToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        title,
        description,
        requirements,
        department,
        location,
        salary_min: Number(salaryMin),
        salary_max: Number(salaryMax),
        employment_type: employmentType,
        deadline,
        status,
      };

      if (editingJob) {
        await onUpdateJob(editingJob.id, payload);
      } else {
        await onCreateJob(payload);
      }

      setShowModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save job posting.');
    } finally {
      setSaving(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedJobIds.length === filteredJobs.length) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(filteredJobs.map(j => j.id));
    }
  };

  const toggleSelectJob = (id: string) => {
    if (selectedJobIds.includes(id)) {
      setSelectedJobIds(selectedJobIds.filter(i => i !== id));
    } else {
      setSelectedJobIds([...selectedJobIds, id]);
    }
  };

  const handleBulkStatusChange = async (targetStatus: JobStatus) => {
    if (selectedJobIds.length === 0) return;
    if (!confirm(`Are you sure you want to change status of ${selectedJobIds.length} job(s) to "${targetStatus}"?`)) return;

    setBulkLoading(true);
    try {
      await api.bulkUpdateJobStatus(selectedJobIds, targetStatus);
      if (onRefresh) {
        await onRefresh();
      } else {
        for (const id of selectedJobIds) {
          await onUpdateJob(id, { status: targetStatus });
        }
      }
      setSelectedJobIds([]);
      setBulkMsg(`Successfully updated ${selectedJobIds.length} job status(es) to ${targetStatus}`);
      setTimeout(() => setBulkMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed bulk job update');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedJobIds.length} job posting(s)?`)) return;

    setBulkLoading(true);
    try {
      await api.bulkDeleteJobs(selectedJobIds);
      if (onRefresh) {
        await onRefresh();
      } else {
        for (const id of selectedJobIds) {
          await onDeleteJob(id);
        }
      }
      setSelectedJobIds([]);
      setBulkMsg(`Successfully deleted ${selectedJobIds.length} job posting(s).`);
      setTimeout(() => setBulkMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed bulk job deletion');
    } finally {
      setBulkLoading(false);
    }
  };

  const exportSelectedJobsCSV = () => {
    const selectedJobs = jobs.filter(j => selectedJobIds.includes(j.id));
    if (selectedJobs.length === 0) return;

    const headers = ['Job ID', 'Title', 'Department', 'Type', 'Location', 'Salary Min', 'Salary Max', 'Status', 'Deadline'];
    const rows = selectedJobs.map(j => [
      `"${j.id}"`,
      `"${j.title.replace(/"/g, '""')}"`,
      `"${j.department}"`,
      `"${j.employment_type}"`,
      `"${j.location}"`,
      j.salary_min,
      j.salary_max,
      `"${j.status}"`,
      `"${new Date(j.deadline).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TalentPulse_Selected_Jobs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <span>Job Posting Management (HR CRUD)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, update, publish, or close job openings. Manage requirements, salaries, and deadlines.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-sm shadow-blue-200 transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Job Posting</span>
        </button>
      </div>

      {bulkMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{bulkMsg}</span>
        </div>
      )}

      {/* Filter Controls & Bulk Action Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter job titles or departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* BULK JOB ACTION BAR */}
        {selectedJobIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="font-extrabold">{selectedJobIds.length} job posting(s) selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={bulkLoading}
                onClick={() => handleBulkStatusChange('published')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bulk Publish</span>
              </button>

              <button
                disabled={bulkLoading}
                onClick={() => handleBulkStatusChange('draft')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition-all"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Bulk Draft</span>
              </button>

              <button
                disabled={bulkLoading}
                onClick={() => handleBulkStatusChange('closed')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition-all"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Bulk Close</span>
              </button>

              {isSuperAdmin && (
                <button
                  disabled={bulkLoading}
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bulk Delete</span>
                </button>
              )}

              <button
                onClick={exportSelectedJobsCSV}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold flex items-center space-x-1 border border-slate-700 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setSelectedJobIds([])}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                title="Deselect All"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Jobs Table / Cards */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold tracking-wider text-[10px] uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                    {selectedJobIds.length === filteredJobs.length && filteredJobs.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">Job Title & Dept</th>
                <th className="px-6 py-4">Type & Location</th>
                <th className="px-6 py-4">Salary Range</th>
                <th className="px-6 py-4">Applicants</th>
                <th className="px-6 py-4">Deadline & Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No job postings found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => {
                  const isSelected = selectedJobIds.includes(job.id);
                  return (
                    <tr key={job.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                      <td className="px-4 py-4">
                        <button onClick={() => toggleSelectJob(job.id)} className="text-slate-400 hover:text-blue-600 cursor-pointer">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{job.title}</div>
                      <div className="text-[11px] text-blue-700 font-medium">{job.department}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{job.employment_type}</div>
                      <div className="text-[11px] text-slate-500">{job.location}</div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      GH₵ {job.salary_min.toLocaleString()} - GH₵ {job.salary_max.toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {job.applicant_count || 0} applicants
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-[11px] text-slate-500 mb-1">
                        {new Date(job.deadline).toLocaleDateString()}
                      </div>
                      {job.status === 'published' && (
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[10px]">
                          Published
                        </span>
                      )}
                      {job.status === 'draft' && (
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[10px]">
                          Draft
                        </span>
                      )}
                      {job.status === 'closed' && (
                        <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-[10px]">
                          Closed
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(job)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit Job"
                      >
                        <Edit3 className="w-4 h-4 text-blue-600" />
                      </button>

                      {isSuperAdmin && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete job posting "${job.title}"?`)) {
                              onDeleteJob(job.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT JOB MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 pb-10 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 text-slate-800 z-10"
            >
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">
                {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
              </h3>
              <p className="text-xs text-slate-500">Fill in job requirements, salary ranges, and status settings.</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full-Stack Engineer"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Product & UI/UX Design">Product & UI/UX Design</option>
                    <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                    <option value="IT Support & Network Administration">IT Support & Network Administration</option>
                    <option value="Cybersecurity & InfoSec">Cybersecurity & InfoSec</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Data Engineering & Analytics">Data Engineering & Analytics</option>
                    <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                    <option value="Database Operations">Database Operations</option>
                    <option value="Software Quality Assurance">Software Quality Assurance</option>
                    <option value="IT Architecture & Strategy">IT Architecture & Strategy</option>
                    <option value="IT Solutions & Consulting">IT Solutions & Consulting</option>
                    <option value="IT Project Management & Agile">IT Project Management & Agile</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Human Resources & Talent">Human Resources & Talent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location Region (16 Regions of Ghana)
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={e => handleRegionSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-semibold mb-2"
                  >
                    <optgroup label="Ghana Administrative Regions (16)">
                      <option value="Greater Accra Region">Greater Accra Region (Accra, Tema)</option>
                      <option value="Ashanti Region">Ashanti Region (Kumasi, Obuasi)</option>
                      <option value="Western Region">Western Region (Sekondi-Takoradi)</option>
                      <option value="Central Region">Central Region (Cape Coast, Winneba)</option>
                      <option value="Eastern Region">Eastern Region (Koforidua, Nsawam)</option>
                      <option value="Northern Region">Northern Region (Tamale, Yendi)</option>
                      <option value="Volta Region">Volta Region (Ho, Hohoe)</option>
                      <option value="Bono Region">Bono Region (Sunyani, Berekum)</option>
                      <option value="Bono East Region">Bono East Region (Techiman, Kintampo)</option>
                      <option value="Ahafo Region">Ahafo Region (Goaso, Mim)</option>
                      <option value="Oti Region">Oti Region (Dambai, Nkwanta)</option>
                      <option value="Savannah Region">Savannah Region (Damongo, Salaga)</option>
                      <option value="North East Region">North East Region (Nalerigu, Walewale)</option>
                      <option value="Upper East Region">Upper East Region (Bolgatanga, Navrongo)</option>
                      <option value="Upper West Region">Upper West Region (Wa, Jirapa)</option>
                      <option value="Western North Region">Western North Region (Sefwi Wiawso)</option>
                    </optgroup>
                    <optgroup label="Work Options">
                      <option value="Remote (Ghana)">Remote (Ghana)</option>
                      <option value="Custom Location">Custom Location / International</option>
                    </optgroup>
                  </select>

                  {selectedRegion === 'Custom Location' ? (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Takoradi, Western Region or Accra, Ghana"
                      value={customCityDetail}
                      onChange={e => handleCityDetailChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  ) : selectedRegion !== 'Remote (Ghana)' ? (
                    <input
                      type="text"
                      placeholder="Specific city/town or area (e.g. Airport Residential, Adum, Ridge - optional)"
                      value={customCityDetail}
                      onChange={e => handleCityDetailChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  ) : null}

                  <p className="text-[11px] text-slate-500 mt-1">
                    Job Location: <span className="font-semibold text-slate-800">{location || 'None'}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={e => setEmploymentType(e.target.value as EmploymentType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-semibold"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Salary (GH₵/yr)</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={e => setSalaryMin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Salary (GH₵/yr)</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={e => setSalaryMax(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Job Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[11px] font-bold flex items-center space-x-1 shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Draft with AI</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed position summary and team context..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              {/* Requirements tag builder */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Requirements & Qualifications</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add requirement bullet..."
                    value={reqInput}
                    onChange={e => setReqInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddReq}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Add
                  </button>
                </div>

                <ul className="space-y-1">
                  {requirements.map((req, i) => (
                    <li key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <span>• {req}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveReq(req)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Posting Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as JobStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  >
                    <option value="published">Published (Live for applicants)</option>
                    <option value="draft">Draft (Internal only)</option>
                    <option value="closed">Closed (No longer accepting apps)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-sm shadow-blue-200"
                >
                  {saving ? 'Saving...' : editingJob ? 'Save Changes' : 'Create Job'}
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
