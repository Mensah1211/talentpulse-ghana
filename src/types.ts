export type UserRole = 'admin' | 'applicant';
export type AdminPermission = 'super_admin' | 'hr_staff';
export type AccountStatus = 'active' | 'deactivated';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid' | 'Internship';
export type JobStatus = 'published' | 'draft' | 'closed';

export type ApplicationStatus = 
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Hired'
  | 'Rejected';

export type InterviewMode = 'Virtual' | 'In-person';
export type InterviewOutcome = 'Pending' | 'Passed' | 'Failed' | 'Hired';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  avatar_url?: string;
  created_at: string;
  adminProfile?: AdminProfile | null;
  applicantProfile?: ApplicantProfile | null;
}

export interface AdminProfile {
  user_id: string;
  permission_level: AdminPermission;
  department: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  field: string;
  start_year: string;
  end_year: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface ApplicantProfile {
  user_id: string;
  bio?: string;
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  resume_url?: string;
  resume_filename?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  department: string;
  location: string;
  salary_min: number;
  salary_max: number;
  employment_type: EmploymentType;
  deadline: string;
  status: JobStatus;
  posted_by: string;
  posted_by_name?: string;
  applicant_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  job_title?: string;
  department?: string;
  applicant_id: string;
  applicant_name?: string;
  applicant_email?: string;
  applicant_phone?: string;
  cover_letter?: string;
  cover_letter_url?: string;
  cover_letter_filename?: string;
  resume_url: string;
  resume_filename: string;
  status: ApplicationStatus;
  feedback?: string;
  applied_at: string;
  updated_at: string;
  interview?: Interview;
}

export interface Interview {
  id: string;
  application_id: string;
  job_id: string;
  job_title?: string;
  applicant_id: string;
  applicant_name?: string;
  scheduled_date: string;
  scheduled_time: string;
  mode: InterviewMode;
  location_or_link: string;
  interviewer_id: string;
  interviewer_name: string;
  outcome: InterviewOutcome;
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'interview';
  read_status: boolean;
  created_at: string;
}

export interface AnalyticsSummary {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  underReviewCount: number;
  shortlistedCount: number;
  interviewScheduledCount: number;
  hiredCount: number;
  rejectedCount: number;
  shortlistRate: number;
  departmentStats: { department: string; count: number }[];
  statusBreakdown: { name: string; value: number }[];
  monthlyHires: { month: string; hires: number; applications: number }[];
}

export interface AuthState {
  user: User | null;
  adminProfile?: AdminProfile | null;
  applicantProfile?: ApplicantProfile | null;
  token: string | null;
}
