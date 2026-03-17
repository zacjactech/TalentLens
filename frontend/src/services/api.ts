import axios from 'axios';
import type { Analytics, Candidate, Job, User, Interview, Activity, InterviewMessage, AdminStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token from localStorage on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('talentlens_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Auth Endpoints
  login: async (email: string, password: string) => {
    // FastAPI OAuth2PasswordRequestForm expects form-encoded: username + password
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const response = await apiClient.post('/auth/login/', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  register: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
    });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  resetPassword: async (email: string) => {
    const response = await apiClient.post('/auth/reset-password', { email });
    return response.data;
  },

  // Settings Endpoints
  getSettings: async () => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  updateSettings: async (settingsData: Record<string, unknown>) => {
    const response = await apiClient.put('/settings', settingsData);
    return response.data;
  },

  // Candidate Endpoints
  getTopCandidates: async (limit = 10): Promise<Candidate[]> => {
    const response = await apiClient.get('/admin/top-candidates/', {
      params: { limit }
    });
    return response.data;
  },

  getAllCandidates: async (skip = 0, limit = 10, role?: string, status?: string, search?: string): Promise<Candidate[]> => {
    const response = await apiClient.get('/candidates/', {
      params: { skip, limit, role, status, search }
    });
    return response.data;
  },

  getCandidateById: async (id: string): Promise<Candidate> => {
    const response = await apiClient.get(`/candidates/${id}`);
    return response.data;
  },

  createCandidate: async (candidateData: Partial<Candidate>) => {
    const response = await apiClient.post('/candidates/', candidateData);
    return response.data;
  },

  updateCandidateScore: async (id: number, scoreData: any) => {
    const response = await apiClient.post(`/candidates/${id}/score`, scoreData);
    return response.data;
  },

  // Admin/Stats Endpoints
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  getRecentActivity: async (): Promise<Activity[]> => {
    const response = await apiClient.get('/admin/recent-activity');
    return response.data;
  },

  getUpcomingInterviews: async (): Promise<Interview[]> => {
    const response = await apiClient.get('/admin/upcoming-interviews');
    return response.data;
  },

  // Interview Endpoints
  getInterviews: async (): Promise<Interview[]> => {
    const response = await apiClient.get('/interviews');
    return response.data;
  },
  getTranscript: async (sessionId: number) => {
    const response = await apiClient.get(`/interviews/${sessionId}/transcript`);
    return response.data;
  },
  getCandidateTranscript: async (candidateId: number): Promise<InterviewMessage[]> => {
    const response = await apiClient.get(`/interviews/candidate/${candidateId}/transcript`);
    return response.data;
  },

  getAnalytics: async (): Promise<Analytics> => {
    const response = await apiClient.get('/admin/analytics/');
    return response.data;
  },

  getCandidateStats: async () => {
    const response = await apiClient.get('/admin/candidate-stats/');
    return response.data;
  },

  // Interview Endpoints
  startInterview: async (candidateId: number) => {
    const response = await apiClient.post('/interviews/start', { candidate_id: candidateId });
    return response.data;
  },

  submitTypingTest: async (sessionId: number, wpm: number, accuracy: number) => {
    const response = await apiClient.post('/interviews/typing-test', {
      session_id: sessionId,
      wpm,
      accuracy
    });
    return response.data;
  },

  completeInterview: async (sessionId: number) => {
    const response = await apiClient.post(`/interviews/${sessionId}/complete`);
    return response.data;
  },

  // Jobs Endpoints
  getJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get('/jobs/');
    return response.data;
  },

  createJob: async (jobData: Partial<Job>) => {
    const response = await apiClient.post('/jobs/', jobData);
    return response.data;
  },

  updateJob: async (id: number, jobData: Partial<Job>) => {
    const response = await apiClient.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id: number) => {
    const response = await apiClient.delete(`/jobs/${id}`);
    return response.data;
  },
};

export default apiService;

