import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  FileText, 
  Plus, 
  Trash2, 
  Upload, 
  Save, 
  GraduationCap, 
  Briefcase, 
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Mail,
  Phone,
  BadgeCheck,
  Image as ImageIcon
} from 'lucide-react';
import { User, ApplicantProfile, AdminProfile, EducationItem, ExperienceItem } from '../../types';
import { api } from '../../lib/api';

interface ProfileProps {
  user: User;
  profile: ApplicantProfile | null;
  adminProfile?: AdminProfile | null;
  onSaveProfile: (updates: any) => Promise<void>;
  onFileUpload: (file: File) => Promise<{ url: string; filename: string }>;
}

export const ApplicantProfileView: React.FC<ProfileProps> = ({
  user,
  profile,
  adminProfile,
  onSaveProfile,
  onFileUpload,
}) => {
  const isAdmin = user.role === 'admin';

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [bio, setBio] = useState(profile?.bio || (isAdmin ? 'Senior HR Operations & Recruitment Administrator.' : ''));
  const [skills, setSkills] = useState<string[]>(profile?.skills || ['React', 'TypeScript', 'Node.js']);
  const [skillInput, setSkillInput] = useState('');
  
  const [education, setEducation] = useState<EducationItem[]>(
    profile?.education || [
      { id: '1', degree: 'B.S. Computer Science', institution: 'University of Ghana, Legon', field: 'Computer Science', start_year: '2018', end_year: '2022' }
    ]
  );

  const [experience, setExperience] = useState<ExperienceItem[]>(
    profile?.experience || [
      { id: '1', title: 'Software Engineer', company: 'Hub365 Tech', location: 'Accra, Greater Accra', start_date: '2022-06', end_date: 'Present', description: 'Developed web applications and mobile wallet features for Ghanaian enterprises.' }
    ]
  );

  const [resumeUrl, setResumeUrl] = useState(profile?.resume_url || '/uploads/sample_resume.pdf');
  const [resumeFilename, setResumeFilename] = useState(profile?.resume_filename || 'My_Resume.pdf');
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [parsingCV, setParsingCV] = useState(false);

  const handleAIAutofill = async () => {
    if (!resumeUrl || resumeUrl === '/uploads/sample_resume.pdf' || resumeUrl.includes('sample')) {
      alert('Please upload your custom resume file first.');
      return;
    }

    setParsingCV(true);
    setMsg('');
    try {
      const parsed = await api.parseResume(resumeUrl);
      
      // Update form state with parsed data
      if (parsed.bio) setBio(parsed.bio);
      if (parsed.skills && Array.isArray(parsed.skills)) setSkills(parsed.skills);
      
      if (parsed.education && Array.isArray(parsed.education)) {
        setEducation(parsed.education.map((edu: any, index: number) => ({
          id: 'edu_ai_' + index + '_' + Date.now(),
          degree: edu.degree || '',
          institution: edu.institution || '',
          field: edu.field || '',
          start_year: edu.start_year || '',
          end_year: edu.end_year || ''
        })));
      }

      if (parsed.experience && Array.isArray(parsed.experience)) {
        setExperience(parsed.experience.map((exp: any, index: number) => ({
          id: 'exp_ai_' + index + '_' + Date.now(),
          title: exp.title || '',
          company: exp.company || '',
          location: exp.location || '',
          start_date: exp.start_date || '',
          end_date: exp.end_date || '',
          description: exp.description || ''
        })));
      }

      setMsg('✨ Profile successfully auto-filled from your resume using Gemini AI! Review the parsed details and click Save changes.');
    } catch (err: any) {
      alert(err.message || 'Failed to parse resume with AI.');
    } finally {
      setParsingCV(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        id: Date.now().toString(),
        degree: 'Bachelor of Science',
        institution: 'University Name',
        field: 'Software Engineering',
        start_year: '2020',
        end_year: '2024',
      },
    ]);
  };

  const handleRemoveEducation = (id: string) => {
    setEducation(education.filter(e => e.id !== id));
  };

  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        id: Date.now().toString(),
        title: 'Full Stack Engineer',
        company: 'Company Name',
        location: 'Remote',
        start_date: '2023-01',
        end_date: 'Present',
        description: 'Key achievements and technical responsibilities...',
      },
    ]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperience(experience.filter(e => e.id !== id));
  };

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const uploaded = await onFileUpload(file);
      const newAvatarUrl = uploaded.url;
      setAvatarUrl(newAvatarUrl);
      
      // Instantly save to update global state across Navbar/Sidebar
      await onSaveProfile({
        name,
        phone,
        avatar_url: newAvatarUrl,
        bio,
        skills,
        education,
        experience,
        resume_url: resumeUrl,
        resume_filename: resumeFilename,
      });
      
      setMsg('Profile picture updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(err.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await onFileUpload(file);
      setResumeUrl(uploaded.url);
      setResumeFilename(uploaded.filename);
      setMsg('Resume file uploaded successfully!');
    } catch (err: any) {
      setMsg(err.message || 'Failed to upload resume file.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    try {
      await onSaveProfile({
        name,
        phone,
        avatar_url: avatarUrl,
        bio,
        skills,
        education,
        experience,
        resume_url: resumeUrl,
        resume_filename: resumeFilename,
      });
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const createdDateFormatted = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recently';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-8 pb-12 text-slate-800"
    >
      
      {/* Header Profile Card */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden transition-shadow hover:shadow-md"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left z-10">
          <div className="relative group cursor-pointer">
            <label className="cursor-pointer block relative">
              <img
                src={avatarUrl || user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/20 shadow-md group-hover:opacity-75 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-2xl">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarFileChange} 
                disabled={uploadingAvatar} 
              />
            </label>
            {uploadingAvatar && (
              <span className="absolute -bottom-2 inset-x-0 text-center text-[9px] font-bold text-blue-600 bg-white/90 shadow-xs border border-blue-100 rounded-md py-0.5">
                Uploading...
              </span>
            )}
            {!uploadingAvatar && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Active Account" />
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{name}</h1>
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border flex items-center space-x-1 ${
                isAdmin 
                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> : <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />}
                <span>{isAdmin ? 'HR Administrator' : 'Job Applicant'}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
              </span>
              {phone && (
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{phone}</span>
                </span>
              )}
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Member since {createdDateFormatted}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer z-10 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </motion.div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Basic Personal Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <UserIcon className="w-5 h-5 text-blue-600" />
            <span>Personal Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isAdmin ? 'HR Admin Summary / Bio' : 'Professional Bio / Career Overview'}
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder={isAdmin ? "Describe your responsibilities and HR oversight..." : "Brief summary of your professional background, strengths, and career aspirations..."}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
        </div>

        {/* HR Staff Specific Section */}
        {isAdmin && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>HR Administrative Privileges & Role</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Department</span>
                <p className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>{adminProfile?.department || 'Human Resources'}</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Permission Level</span>
                <p className="text-sm font-bold text-slate-900 flex items-center space-x-1.5 capitalize">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>{adminProfile?.permission_level ? adminProfile.permission_level.replace('_', ' ') : 'Super Admin'}</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Account Status</span>
                <p className="text-sm font-bold text-emerald-700 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active {(adminProfile?.permission_level === 'super_admin' || user?.email === 'mensahsamuel3803@gmail.com') ? 'Super HR' : 'HR Staff'}</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Granted Platform Capabilities:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Full Job Requisition & Posting Control</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Candidate Application Review & Evaluation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Interview Scheduling & Feedback Logging</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>User & Team Member Role Management</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Applicant Specific Sections */}
        {!isAdmin && (
          <>
            {/* Skills Tag Builder */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Skills & Expertise Tags</span>
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g., React, TypeScript, Docker)..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Resume Uploader */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Resume / CV Document</span>
              </h3>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{resumeFilename}</div>
                    <div className="text-[10px] text-slate-500">Attached resume for one-click application submission</div>
                  </div>
                </div>                 <div className="flex items-center space-x-2">
                  <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer flex items-center space-x-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Uploading...' : 'Upload New CV'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeFileChange}
                      className="hidden"
                    />
                  </label>

                  {resumeUrl && resumeUrl !== '/uploads/sample_resume.pdf' && !resumeUrl.includes('sample') && (
                    <button
                      type="button"
                      disabled={parsingCV}
                      onClick={handleAIAutofill}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow cursor-pointer transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{parsingCV ? 'Parsing CV...' : 'Auto-fill with AI'}</span>
                    </button>
                  )}

                  {resumeUrl && (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-xl flex items-center space-x-1 border border-slate-200 shadow-xs"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Work Experience */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span>Work Experience</span>
                </h3>

                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center space-x-1 border border-blue-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>

              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={exp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={e => {
                            const next = [...experience];
                            next[idx].title = e.target.value;
                            setExperience(next);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={e => {
                            const next = [...experience];
                            next[idx].company = e.target.value;
                            setExperience(next);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location || ''}
                          onChange={e => {
                            const next = [...experience];
                            next[idx].location = e.target.value;
                            setExperience(next);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                          placeholder="City, Country"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Date</label>
                        <input
                          type="month"
                          value={exp.start_date || ''}
                          onChange={e => {
                            const next = [...experience];
                            next[idx].start_date = e.target.value;
                            setExperience(next);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Date</label>
                        <input
                          type="text"
                          value={exp.end_date || ''}
                          onChange={e => {
                            const next = [...experience];
                            next[idx].end_date = e.target.value;
                            setExperience(next);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                          placeholder="e.g. Present or YYYY-MM"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description / Key Accomplishments</label>
                      <textarea
                        rows={2}
                        value={exp.description}
                        onChange={e => {
                          const next = [...experience];
                          next[idx].description = e.target.value;
                          setExperience(next);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education History */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span>Education</span>
                </h3>

                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center space-x-1 border border-blue-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Education</span>
                </button>
              </div>

              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={edu.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Degree / Certification</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={e => {
                            const next = [...education];
                            next[idx].degree = e.target.value;
                            setEducation(next);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Institution / University</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={e => {
                            const next = [...education];
                            next[idx].institution = e.target.value;
                            setEducation(next);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.field || ''}
                          onChange={e => {
                            const next = [...education];
                            next[idx].field = e.target.value;
                            setEducation(next);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Year</label>
                        <input
                          type="text"
                          value={edu.start_year || ''}
                          onChange={e => {
                            const next = [...education];
                            next[idx].start_year = e.target.value;
                            setEducation(next);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                          placeholder="YYYY"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Year</label>
                        <input
                          type="text"
                          value={edu.end_year || ''}
                          onChange={e => {
                            const next = [...education];
                            next[idx].end_year = e.target.value;
                            setEducation(next);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                          placeholder="YYYY or Present"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </form>

    </motion.div>
  );
};
