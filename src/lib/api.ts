import { supabase } from './supabase';
import { generateChatResponse, generateInterviewQuestions, parseResume, analyzeCandidateMatch } from './gemini';
import { User, Job, Application, Interview, Notification, AnalyticsSummary, ApplicantProfile } from '../types';



const TOKEN_KEY = 'hr_recruitment_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(endpoint, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'An unexpected server error occurred.');
  return data as T;
}

const getFullUserData = async (userId: string, retries = 3) => {
  let user, userError;
  for (let i = 0; i < retries; i++) {
    const res = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
    user = res.data;
    userError = res.error;
    if (user) break;
    await new Promise(r => setTimeout(r, 1000)); // wait for trigger
  }

  if (userError) throw userError;
  if (!user) {
    // If still no user, we might be hitting an RLS issue or trigger failure. 
    // We'll throw a more descriptive error than the default single() error.
    throw new Error("Could not load user profile. The database trigger might be delayed.");
  }

  let adminProfile = null;
  let applicantProfile = null;

  if (user.role === 'admin') {
    const { data } = await supabase.from('admin_profiles').select('*').eq('user_id', userId).maybeSingle();
    adminProfile = data;
  } else {
    const { data } = await supabase.from('applicant_profiles').select('*').eq('user_id', userId).maybeSingle();
    applicantProfile = data;
  }

  return { user, adminProfile, applicantProfile };
};

export const api = {
  // Auth
  register: async (body: any) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: { data: { name: body.name, role: body.role } }
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user");

    // Wait for the trigger to fire
    await new Promise(r => setTimeout(r, 1000));

    await supabase.from('users').update({
      phone: body.phone,
      avatar_url: body.avatar_url
    }).eq('id', authData.user.id);
    
    if (body.role === 'applicant') {
      await supabase.from('applicant_profiles').update({
        bio: body.bio,
        skills: typeof body.skills === 'string' ? body.skills.split(',').map((s:string) => s.trim()) : body.skills
      }).eq('user_id', authData.user.id);
    }

    const fullData = await getFullUserData(authData.user.id);
    return { token: authData.session?.access_token || 'mock_token', ...fullData };
  },

  login: async (body: any) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error("Login failed");

    const fullData = await getFullUserData(authData.user.id);
    return { token: authData.session?.access_token || 'mock_token', ...fullData };
  },

  getMe: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No active session");
    const fullData = await getFullUserData(session.user.id);
    return { token: session.access_token, ...fullData };
  },

  updateProfile: async (body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Unauthorized");
    
    const userId = session.user.id;
    await supabase.from('users').update({
      name: body.name,
      phone: body.phone,
      avatar_url: body.avatar_url
    }).eq('id', userId);

    await supabase.from('applicant_profiles').update({
      bio: body.bio,
      skills: body.skills,
      education: body.education,
      experience: body.experience,
      resume_url: body.resume_url,
      resume_filename: body.resume_filename
    }).eq('user_id', userId);

    const fullData = await getFullUserData(userId);
    return { user: fullData.user, applicantProfile: fullData.applicantProfile, message: 'Profile updated' };
  },

  forgotPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { message: 'Reset email sent', resetCode: '123456' }; // Keep mock logic for UI
  },
  resetPassword: async (body: any) => {
    // In real Supabase, they click a link. For this mock, we just say success if they are doing demo.
    return { message: 'Password reset successful' };
  },

  // File Upload
  uploadFile: async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file);
      
    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);
      
    return { url: publicUrlData.publicUrl, filename: file.name, size: file.size };
  },

  // Jobs
  getJobs: async (params?: any) => {
    let query = supabase.from('jobs').select('*');
    if (params?.status) query = query.eq('status', params.status);
    if (params?.department) query = query.eq('department', params.department);
    if (params?.employment_type) query = query.eq('employment_type', params.employment_type);
    if (params?.location) query = query.ilike('location', `%${params.location}%`);
    if (params?.search) query = query.ilike('title', `%${params.search}%`);
    
    const { data, error } = await query;
    if (error) throw error;
    
    return { jobs: data, total: data.length, page: 1, totalPages: 1 };
  },
  getJobById: async (id: string) => {
    const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  createJob: async (body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.from('jobs').insert([{ ...body, posted_by: session?.user.id }]).select().single();
    if (error) throw error;
    return data;
  },
  updateJob: async (id: string, body: any) => {
    const { data, error } = await supabase.from('jobs').update(body).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deleteJob: async (id: string) => {
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) throw error;
    return { message: 'Deleted' };
  },
  bulkUpdateJobStatus: async (jobIds: string[], status: string) => {
    const { error } = await supabase.from('jobs').update({ status }).in('id', jobIds);
    if (error) throw error;
    return { message: 'Updated' };
  },
  bulkDeleteJobs: async (jobIds: string[]) => {
    const { error } = await supabase.from('jobs').delete().in('id', jobIds);
    if (error) throw error;
    return { message: 'Deleted' };
  },

  // Applications
  submitApplication: async (body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.from('applications').insert([{
      job_id: body.job_id,
      applicant_id: session?.user.id,
      cover_letter: body.cover_letter,
      cover_letter_url: body.cover_letter_url,
      cover_letter_filename: body.cover_letter_filename,
      resume_url: body.resume_url,
      resume_filename: body.resume_filename
    }]).select().single();
    if (error) throw error;
    return data;
  },
  getMyApplications: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.from('applications').select('*, jobs(title, department)').eq('applicant_id', session?.user.id);
    if (error) throw error;
    return data.map((d: any) => ({ ...d, job_title: d.jobs?.title, department: d.jobs?.department }));
  },
  getApplicationsByJob: async (jobId: string) => {
    const { data, error } = await supabase.from('applications').select('*, users(name, email, phone)').eq('job_id', jobId);
    if (error) throw error;
    return data.map((d: any) => ({ 
      ...d, 
      applicant_name: d.users?.name, 
      applicant_email: d.users?.email, 
      applicant_phone: d.users?.phone 
    }));
  },
  getAllApplications: async (params?: any) => {
    let query = supabase.from('applications').select('*, jobs(title, department), users(name, email, phone)');
    if (params?.status) query = query.eq('status', params.status);
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data.map((d: any) => ({ 
      ...d, 
      job_title: d.jobs?.title, 
      department: d.jobs?.department,
      applicant_name: d.users?.name, 
      applicant_email: d.users?.email, 
      applicant_phone: d.users?.phone 
    }));
  },
  updateApplicationStatus: async (id: string, status: string, feedback?: string) => {
    const { data, error } = await supabase.from('applications').update({ status, feedback }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  bulkUpdateApplicationStatus: async (applicationIds: string[], status: string, feedback?: string) => {
    const { data, error } = await supabase.from('applications').update({ status, feedback }).in('id', applicationIds).select();
    if (error) throw error;
    return { message: 'Updated', updated: data };
  },

  // Interviews
  scheduleInterview: async (body: any) => {
    const { data, error } = await supabase.from('interviews').insert([body]).select().single();
    if (error) throw error;
    return data;
  },
  getMyInterviews: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.from('interviews').select('*, applications!inner(applicant_id)').eq('applications.applicant_id', session?.user.id);
    if (error) throw error;
    return data;
  },
  getAllInterviews: async () => {
    const { data, error } = await supabase.from('interviews').select('*');
    if (error) throw error;
    return data;
  },
  updateInterviewOutcome: async (id: string, outcome: string, notes?: string) => {
    const { data, error } = await supabase.from('interviews').update({ outcome, notes }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  // Notifications
  getNotifications: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', session?.user.id).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  markNotificationRead: async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read_status: true }).eq('id', id);
    if (error) throw error;
    return { message: 'Marked read' };
  },
  markAllNotificationsRead: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from('notifications').update({ read_status: true }).eq('user_id', session?.user.id);
    if (error) throw error;
    return { message: 'All marked read' };
  },
  bulkSendNotifications: async (userIds: string[], title: string, message: string) => {
    const payloads = userIds.map(id => ({ user_id: id, title, message, type: 'info' }));
    const { error } = await supabase.from('notifications').insert(payloads);
    if (error) throw error;
    return { message: 'Sent' };
  },

  // User Management
  getUsers: async () => {
    const { data, error } = await supabase.from('users').select(`
      *,
      adminProfile:admin_profiles(*),
      applicantProfile:applicant_profiles(*)
    `);
    if (error) throw error;
    return data.map((u: any) => ({
      ...u,
      adminProfile: Array.isArray(u.adminProfile) ? u.adminProfile[0] : u.adminProfile,
      applicantProfile: Array.isArray(u.applicantProfile) ? u.applicantProfile[0] : u.applicantProfile,
    }));
  },
  updateUserStatus: async (id: string, status: 'active' | 'deactivated') => {
    const { data, error } = await supabase.from('users').update({ status }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Update failed. You might not have the correct Admin RLS permissions.");
    return data;
  },
  updateUserRole: async (id: string, role: 'applicant' | 'admin', permission_level?: string, department?: string) => {
    const { data, error } = await supabase.from('users').update({ role }).eq('id', id).select().maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Role update failed. Make sure you have applied the Admin RLS Database Update script.");
    
    
    if (role === 'admin') {
      const { error: profileError } = await supabase.from('admin_profiles').upsert({
        user_id: id,
        permission_level: permission_level || 'hr_staff',
        department: department || 'HR'
      });
      if (profileError) throw profileError;
    }
    
    return data;
  },
  deleteUser: async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    return { message: 'Deleted' };
  },
  bulkUpdateUserStatus: async (userIds: string[], status: 'active' | 'deactivated') => {
    const { error } = await supabase.from('users').update({ status }).in('id', userIds);
    if (error) throw error;
    return { message: 'Updated' };
  },
  bulkDeleteUsers: async (userIds: string[]) => {
    const { error } = await supabase.from('users').delete().in('id', userIds);
    if (error) throw error;
    return { message: 'Deleted' };
  },
  createAdminStaff: async (body: any) => {
    return api.register({ ...body, role: 'admin' });
  },

  // Analytics (Computed on frontend for simplicity using Supabase queries)
  getAnalytics: async () => {
    const { data: jobs } = await supabase.from('jobs').select('*');
    const { data: apps } = await supabase.from('applications').select('*');
    
    const j = jobs || [];
    const a = apps || [];

    const activeJobs = j.filter((job: any) => job.status === 'published').length;
    const underReview = a.filter((app: any) => app.status === 'Under Review').length;
    const shortlisted = a.filter((app: any) => app.status === 'Shortlisted').length;
    const interview = a.filter((app: any) => app.status === 'Interview Scheduled').length;
    const hired = a.filter((app: any) => app.status === 'Hired').length;
    const rejected = a.filter((app: any) => app.status === 'Rejected').length;

    const shortlistRate = a.length > 0 ? Math.round(((shortlisted + interview + hired) / a.length) * 100) : 0;

    return {
      totalJobs: j.length,
      activeJobs,
      totalApplications: a.length,
      underReviewCount: underReview,
      shortlistedCount: shortlisted,
      interviewScheduledCount: interview,
      hiredCount: hired,
      rejectedCount: rejected,
      shortlistRate,
      departmentStats: [], // mock for now
      statusBreakdown: [
        { name: 'Under Review', value: underReview },
        { name: 'Shortlisted', value: shortlisted },
        { name: 'Interview', value: interview },
        { name: 'Hired', value: hired },
        { name: 'Rejected', value: rejected },
      ],
      monthlyHires: []
    } as AnalyticsSummary;
  },

  // AI Helpers
  chatAI: async (messages: { role: string; content: string }[]) => {
    // Generate active jobs summary for the chatbot
    const { data: jobs } = await supabase.from('jobs').select('*').eq('status', 'published');
    const activeJobsSummary = (jobs || []).map((j: any) => 
      `- ${j.title} in ${j.location} (${j.department}). Requirements: ${(j.requirements || []).slice(0, 2).join(', ')}`
    ).join('\n');

    const response = await generateChatResponse(messages, activeJobsSummary);
    return { response };
  },

  generateInterviewQuestions: async (jobId: string, applicantId: string) => {
    const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single();
    const { data: profile } = await supabase.from('applicant_profiles').select('*').eq('user_id', applicantId).single();
    const { data: user } = await supabase.from('users').select('*').eq('id', applicantId).single();

    const questions = await generateInterviewQuestions(
      job?.title || 'Unknown Job',
      job?.requirements || [],
      user?.name || 'Unknown Candidate',
      profile?.skills || []
    );
    return { questions };
  },

  parseResume: async (resumeUrl: string, resumeFilename?: string) => {
    return parseResume(resumeUrl, resumeFilename);
  },

  generateMatchScore: async (jobId: string, applicantId: string, resumeUrl?: string, resumeFilename?: string, coverLetterUrl?: string, coverLetterFilename?: string) => {
    // 1. Fetch Job
    const { data: job, error: jobErr } = await supabase.from('jobs').select('*').eq('id', jobId).maybeSingle();
    if (jobErr || !job) throw new Error('Job not found');

    // 2. Fetch Profile
    const { data: profile, error: profErr } = await supabase.from('applicant_profiles').select('*').eq('user_id', applicantId).maybeSingle();
    if (profErr || !profile) throw new Error('Profile not found');

    // 3. Analyze Match (gemini handles downloading and parsing now)
    return analyzeCandidateMatch(job, profile, resumeUrl, resumeFilename, coverLetterUrl, coverLetterFilename);
  },
};
