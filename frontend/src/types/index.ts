export interface User {
  id: number;
  email: string;
  role?: string;
}

export interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  name?: string; // Some views use flattened name
  email: string;
  phone?: string;
  avatarUrl?: string;
  resume_url?: string;
  target_role?: string;
  role?: string; // Some views use role
  status: string;
  years_of_experience: number;
  score?: CandidateScore;
  source: string;
  created_at: string;
  updated_at: string;
  profile?: CandidateProfile;
  sessions?: InterviewSession[];
}

export interface CandidateProfile {
  id: number;
  candidate_id: number;
  summary?: string;
  skills_analysis?: string;
  career_stability_analysis?: string;
  communication_evaluation?: string;
  experience_analysis?: string;
  final_evaluation?: string;
}

export interface CandidateScore {
  id: number;
  candidate_id: number;
  experience_fit: number;
  career_stability: number;
  communication_quality: number;
  typing_test: number;
  role_specific: number;
  overall_score: number;
}

export interface InterviewSession {
  id: number;
  candidate_id: number;
  session_id: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
}

export interface Job {
  id: number;
  title: string;
  department?: string;
  location?: string;
  type?: string;
  status: 'Active' | 'Draft' | 'Closed';
  description?: string;
  requirements?: string;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: number;
  candidate_id: number;
  candidate_name?: string;
  title?: string;
  subtitle?: string;
  month?: string;
  date?: string;
  scheduled_time: string;
  status: string;
}

export interface Activity {
  id: number;
  user_name?: string;
  title?: string;
  details?: string;
  time?: string;
  icon?: string;
  type?: 'success' | 'mail' | 'default' | string;
  action?: string;
  timestamp?: string;
}

export interface Analytics {
  overview: {
    total_candidates: number;
    active_jobs: number;
    completed_interviews: number;
    average_score: number;
  };
  hiring_velocity: Array<{
    month: string;
    hires: number;
  }>;
  source_distribution: Array<{
    source: string;
    count: number;
  }>;
}

export interface AdminStats {
  total_candidates: number;
  active_jobs: number;
  completed_interviews: number;
  average_score: number;
}

export interface InterviewMessage {
  question_text?: string;
  question_category?: string;
  answer_text?: string;
  sender?: 'bot' | 'user';
  text?: string; // Used in live chat
}
