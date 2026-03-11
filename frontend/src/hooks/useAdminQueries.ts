import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export const adminKeys = {
    all: ['admin'] as const,
    stats: () => [...adminKeys.all, 'stats'] as const,
    recentActivity: () => [...adminKeys.all, 'recentActivity'] as const,
    upcomingInterviews: () => [...adminKeys.all, 'upcomingInterviews'] as const,
    analytics: () => [...adminKeys.all, 'analytics'] as const,
    candidateStats: () => [...adminKeys.all, 'candidateStats'] as const,
    topCandidates: (limit: number) => [...adminKeys.all, 'topCandidates', limit] as const,
};

export const useAdminStats = () => useQuery({
    queryKey: adminKeys.stats(),
    queryFn: apiService.getStats,
});

export const useRecentActivity = () => useQuery({
    queryKey: adminKeys.recentActivity(),
    queryFn: apiService.getRecentActivity,
});

export const useUpcomingInterviews = () => useQuery({
    queryKey: adminKeys.upcomingInterviews(),
    queryFn: apiService.getUpcomingInterviews,
});

export const useAnalytics = () => useQuery({
    queryKey: adminKeys.analytics(),
    queryFn: apiService.getAnalytics,
});

export const useCandidateStats = () => useQuery({
    queryKey: adminKeys.candidateStats(),
    queryFn: apiService.getCandidateStats,
});

export const useTopCandidates = (limit: number = 10) => useQuery({
    queryKey: adminKeys.topCandidates(limit),
    queryFn: () => apiService.getTopCandidates(limit),
});
