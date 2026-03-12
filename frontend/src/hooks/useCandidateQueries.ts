import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Candidate, InterviewMessage } from '../types';

export const candidateKeys = {
    all: ['candidates'] as const,
    lists: () => [...candidateKeys.all, 'list'] as const,
    list: (skip: number, limit: number, role?: string, status?: string, search?: string) =>
        [...candidateKeys.lists(), { skip, limit, role, status, search }] as const,
    details: () => [...candidateKeys.all, 'detail'] as const,
    detail: (id: string) => [...candidateKeys.details(), id] as const,
    transcripts: () => [...candidateKeys.all, 'transcript'] as const,
    transcript: (id: number) => [...candidateKeys.transcripts(), id] as const,
};

export const useCandidates = (skip = 0, limit = 10, role?: string, status?: string, search?: string) => {
    return useQuery<Candidate[]>({
        queryKey: candidateKeys.list(skip, limit, role, status, search),
        queryFn: () => apiService.getAllCandidates(skip, limit, role, status, search),
    });
};

export const useCandidate = (id: string) => {
    return useQuery<Candidate>({
        queryKey: candidateKeys.detail(id),
        queryFn: () => apiService.getCandidateById(id),
        enabled: !!id,
    });
};

export const useCandidateTranscript = (id: number) => {
    return useQuery<InterviewMessage[]>({
        queryKey: candidateKeys.transcript(id),
        queryFn: () => apiService.getCandidateTranscript(id),
        enabled: id > 0,
    });
};

export const useCreateCandidate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: apiService.createCandidate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
        },
    });
};

export const useUpdateCandidateScore = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, scoreData }: { id: number; scoreData: any }) => 
            apiService.updateCandidateScore(id, scoreData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: candidateKeys.detail(variables.id.toString()) });
            queryClient.invalidateQueries({ queryKey: candidateKeys.lists() });
        },
    });
};
