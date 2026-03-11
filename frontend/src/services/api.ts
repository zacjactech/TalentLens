import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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
    const response = await apiClient.post('/auth/login', formData, {
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

  getMe: async () => {
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

  updateSettings: async (settingsData: any) => {
    const response = await apiClient.put('/settings', settingsData);
    return response.data;
  },

  // Candidate Endpoints
  getTopCandidates: async (limit = 10) => {
    const response = await apiClient.get('/admin/top-candidates', {
      params: { limit }
    });
    return response.data;
  },

  getAllCandidates: async (skip = 0, limit = 10, role?: string, status?: string, search?: string) => {
    const response = await apiClient.get('/candidates', {
      params: { skip, limit, role, status, search }
    });
    return response.data;
  },

  getCandidateById: async (id: string) => {
    const response = await apiClient.get(`/candidates/${id}`);
    return response.data;
  },

  // Admin/Stats Endpoints
  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await apiClient.get('/admin/recent-activity');
    return response.data;
  },

  getUpcomingInterviews: async () => {
    const response = await apiClient.get('/admin/upcoming-interviews');
    return response.data;
  },

  // Interview Endpoints
  getInterviews: async () => {
    const response = await apiClient.get('/interviews');
    return response.data;
  },
  getTranscript: async (sessionId: number) => {
    const response = await apiClient.get(`/interviews/${sessionId}/transcript`);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await apiClient.get('/admin/analytics');
    return response.data;
  },

  getCandidateStats: async () => {
    const response = await apiClient.get('/admin/candidate-stats');
    return response.data;
  },

  // Jobs Endpoints
  getJobs: async () => {
    const response = await apiClient.get('/jobs');
    return response.data;
  },

  createJob: async (jobData: any) => {
    const response = await apiClient.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (id: number, jobData: any) => {
    const response = await apiClient.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id: number) => {
    const response = await apiClient.delete(`/jobs/${id}`);
    return response.data;
  },
};

export default apiService;

