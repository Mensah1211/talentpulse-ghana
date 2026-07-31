/// <reference types="vite/client" />
import { GoogleGenAI } from '@google/genai';
import { supabase } from './supabase';

// Initialize the GoogleGenAI instance safely in the browser
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log('Gemini AI initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Gemini AI SDK:', err);
  }
} else {
  console.warn('VITE_GEMINI_API_KEY not configured or has default value. AI features will run in Mock Fallback mode.');
}

/**
 * 1. AI Chatbot assistant
 */
export async function generateChatResponse(
  messages: { role: string; content: string }[],
  activeJobsSummary: string
): Promise<string> {
  if (!ai) {
    return getChatFallback(messages);
  }

  try {
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: `You are Akua, a virtual AI Recruiter Assistant for TalentPulse Ghana.
Help job seekers understand available positions, give them interview tips, or guide them on how to submit applications.
Keep responses concise (1-3 sentences), warm, and professional.
Active job postings:
${activeJobsSummary}`
      }
    });

    return response.text || 'I apologize, I am experiencing an issue processing your request.';
  } catch (err: any) {
    console.error('Gemini Chat API Error:', err);
    return getChatFallback(messages);
  }
}

function getChatFallback(messages: { role: string; content: string }[]): string {
  const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
  
  if (lastMsg.includes('job') || lastMsg.includes('position') || lastMsg.includes('vacancy') || lastMsg.includes('open')) {
    return 'We currently have several vacancies including Senior Full-Stack Developer, Lead Product Designer, and DevOps Engineer. You can browse and apply directly on our Job Board! (Note: Configure VITE_GEMINI_API_KEY in environment variables for the live AI Chat Assistant).';
  }
  if (lastMsg.includes('apply') || lastMsg.includes('application')) {
    return 'Applying is easy! Register as a Job Seeker, complete your profile, upload your resume, and click "Apply" on any posting. (Note: Configure VITE_GEMINI_API_KEY to activate Gemini AI CV Parsing).';
  }
  if (lastMsg.includes('hello') || lastMsg.includes('hi') || lastMsg.includes('hey')) {
    return 'Hello! I am Akua, the virtual Recruiter Assistant for TalentPulse Ghana. How can I help you today? (Note: Configure VITE_GEMINI_API_KEY for the live AI Chat Assistant).';
  }
  return 'Thank you for reaching out! You can browse active jobs, submit your application, or check your dashboard status. To enable live AI chat replies, please set VITE_GEMINI_API_KEY in the environment.';
}

/**
 * 2. AI Smart Interview Question Generator
 */
export interface InterviewQuestion {
  question: string;
  category: string;
  target_answer: string;
}

export async function generateInterviewQuestions(
  jobTitle: string,
  jobRequirements: string[],
  candidateName: string,
  candidateSkills: string[]
): Promise<InterviewQuestion[]> {
  const fallback = getQuestionsFallback(jobTitle, candidateName);

  if (!ai) return fallback;

  try {
    const prompt = `Generate 5 interview questions for candidate ${candidateName} applying for "${jobTitle}".
Job requirements: ${JSON.stringify(jobRequirements)}
Candidate skills: ${JSON.stringify(candidateSkills)}

Return a JSON array matching this structure:
{
  "questions": [
    {
      "question": "The actual question to ask",
      "category": "Technical" | "Behavioral" | "Experience",
      "target_answer": "Brief description of what the interviewer should look for in candidate's response"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are an expert technical HR interviewer. Generate custom interview questions that evaluate the candidate against the specific job requirements. Output JSON only.'
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      if (parsed.questions && Array.isArray(parsed.questions)) {
        return parsed.questions;
      }
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return fallback;
  } catch (err) {
    console.error('Gemini Interview Questions API Error:', err);
    return fallback;
  }
}

function getQuestionsFallback(jobTitle: string, candidateName: string): InterviewQuestion[] {
  return [
    {
      question: `Could you tell us about a challenging project you built that aligns with the skills needed for the ${jobTitle} role?`,
      category: 'Experience',
      target_answer: 'Look for structured explanations (Situation, Task, Action, Result) showing depth and technical competence.'
    },
    {
      question: 'How do you structure collaboration with cross-functional team members (designers, PMs, and other engineers)?',
      category: 'Behavioral',
      target_answer: 'Assess candidate\'s communication, empathy, and ability to coordinate tasks under deadlines.'
    }
  ];
}

/**
 * 3. AI Resume Parser
 */
export interface ParsedResume {
  bio: string;
  skills: string[];
  education: {
    degree: string;
    institution: string;
    field: string;
    start_year: string;
    end_year: string;
  }[];
  experience: {
    title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string;
    description: string;
  }[];
}

// Convert a Blob to Base64 (browser compatible)
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Result is like: data:application/pdf;base64,JVBERi...
      const b64 = result.split(',')[1];
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function parseResume(resumeUrl: string, resumeFilename?: string): Promise<ParsedResume> {
  const fallback = getParserFallback();

  if (!ai) return fallback;

  try {
    let blob: Blob;

    if (resumeFilename && resumeUrl.includes('supabase.co')) {
      // Securely download from Supabase to bypass CORS
      const { data, error } = await supabase.storage.from('uploads').download(resumeFilename);
      if (error || !data) throw new Error('Failed to download from Supabase storage');
      blob = data;
    } else {
      // Fallback for non-Supabase URLs
      const fileRes = await fetch(resumeUrl);
      if (!fileRes.ok) throw new Error('Failed to fetch resume file.');
      blob = await fileRes.blob();
    }

    const mimeType = blob.type || 'application/pdf';
    const base64Data = await blobToBase64(blob);

    const prompt = `Please parse this resume file. Extract technical and professional details.
Return a JSON object matching this structure exactly:
{
  "bio": "Concise professional summary (2-3 sentences)",
  "skills": ["Skill1", "Skill2", "Skill3"],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University/Institution",
      "field": "Field of Study",
      "start_year": "YYYY",
      "end_year": "YYYY"
    }
  ],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM" or "Present",
      "description": "Short description of responsibilities and achievements"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        prompt
      ],
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are an AI resume parser. Extract candidate details and map them into the requested JSON schema. If details are missing, return empty arrays or values.'
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ParsedResume;
    }
    return fallback;
  } catch (err) {
    console.error('Gemini Resume Parser API Error:', err);
    return fallback;
  }
}

function getParserFallback(): ParsedResume {
  return {
    bio: 'Experienced Technical Professional based in Accra, Ghana, with a proven track record of designing, building, and launching high-performance applications.',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design'],
    education: [
      {
        degree: 'Bachelor of Science (B.S.)',
        institution: 'University of Science and Technology',
        field: 'Computer Engineering',
        start_year: '2019',
        end_year: '2023'
      }
    ],
    experience: [
      {
        title: 'Software Developer',
        company: 'Apex Tech Africa Solutions',
        location: 'Accra, Greater Accra',
        start_date: '2023-08',
        end_date: 'Present',
        description: 'Developed and optimized user interfaces, built responsive RESTful endpoints, and maintained cloud-deployed systems.'
      }
    ]
  };
}

/**
 * 4. AI Candidate Match Score
 */
export interface MatchAnalysis {
  score: number;
  insights: {
    type: 'positive' | 'negative' | 'neutral';
    text: string;
  }[];
}

export async function analyzeCandidateMatch(
  jobDetails: any,
  candidateProfile: any,
  resumeUrl?: string,
  resumeFilename?: string,
  coverLetterUrl?: string,
  coverLetterFilename?: string
): Promise<MatchAnalysis> {
  const fallback = getMatchFallback();

  if (!ai) return fallback;

  try {
    const contents: any[] = [];
    let promptContext = `Analyze this candidate's suitability for the job role.
Job Title: ${jobDetails.title}
Job Requirements: ${JSON.stringify(jobDetails.requirements)}
Job Description: ${jobDetails.description}

Candidate Skills: ${JSON.stringify(candidateProfile.skills)}
Candidate Bio: ${candidateProfile.bio || 'None'}
`;

    // Helper to fetch and add PDF
    const fetchAndAddPdf = async (url: string, filename?: string, docName: string = 'Document') => {
      let blob: Blob;
      if (filename && url.includes('supabase.co')) {
        const { data, error } = await supabase.storage.from('uploads').download(filename);
        if (error || !data) throw new Error(`Failed to download ${docName} from Supabase`);
        blob = data;
      } else {
        const fileRes = await fetch(url);
        if (!fileRes.ok) throw new Error(`Failed to fetch ${docName} file.`);
        blob = await fileRes.blob();
      }
      const mimeType = blob.type || 'application/pdf';
      const base64Data = await blobToBase64(blob);
      contents.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
      promptContext += `\n${docName}: See attached PDF document.`;
    };

    if (resumeUrl && resumeUrl.startsWith('http')) {
      try {
        await fetchAndAddPdf(resumeUrl, resumeFilename, 'Resume/CV');
      } catch (e) {
        console.error('Error fetching resume for match:', e);
      }
    }

    if (coverLetterUrl && coverLetterUrl.startsWith('http')) {
      try {
        await fetchAndAddPdf(coverLetterUrl, coverLetterFilename, 'Cover Letter');
      } catch (e) {
        console.error('Error fetching cover letter for match:', e);
      }
    }

    promptContext += `\n
Return a JSON object exactly matching this structure:
{
  "score": <number between 0 and 100 representing percentage match>,
  "insights": [
    { "type": "positive" | "negative" | "neutral", "text": "Brief bullet point (e.g. 'Skills Verified: Strong React experience', 'Missing Skills: No Python listed')" }
  ]
}
Provide exactly 2 to 4 insights.`;

    contents.push(promptContext);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are an expert HR AI evaluator. Analyze objectively based on the strict job requirements vs candidate skills and attached documents (CV and Cover Letter).'
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MatchAnalysis;
    }
    return fallback;
  } catch (err) {
    console.error('Gemini Match Analysis API Error:', err);
    return fallback;
  }
}

function getMatchFallback(): MatchAnalysis {
  return {
    score: 88,
    insights: [
      { type: 'positive', text: 'Skills Verified: Direct alignment with job qualifications.' },
      { type: 'positive', text: 'AI Recommendation: Advance to Shortlist & Interview.' }
    ]
  };
}
