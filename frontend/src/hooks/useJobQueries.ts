import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Job } from '../types';

export const jobKeys = {
    all: ['jobs'] as const,
    lists: () => [...jobKeys.all, 'list'] as const,
};

export const useJobs = () => {
    return useQuery({
        queryKey: jobKeys.lists(),
        queryFn: apiService.getJobs,
    });
};

export const useCreateJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: apiService.createJob,
        onMutate: async (newJob: Partial<Job>) => {
            await queryClient.cancelQueries({ queryKey: jobKeys.lists() });
            const previousJobs = queryClient.getQueryData<Job[]>(jobKeys.lists());
            queryClient.setQueryData(jobKeys.lists(), (old: Job[] | undefined) => [...(old || []), { id: Date.now(), ...newJob } as Job]);
            return { previousJobs };
        },
        onError: (_err, _newJob, context) => {
            queryClient.setQueryData(jobKeys.lists(), context?.previousJobs);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
        },
    });
};

export const useUpdateJob = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Job> }) => apiService.updateJob(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: jobKeys.lists() });
            const previousJobs = queryClient.getQueryData<Job[]>(jobKeys.lists());
            queryClient.setQueryData(jobKeys.lists(), (old: Job[] | undefined) =>
                (old || []).map((job) => (job.id === id ? { ...job, ...data } : job))
            );
            return { previousJobs };
        },
        onError: (_err, _variables, context) => {
            queryClient.setQueryData(jobKeys.lists(), context?.previousJobs);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
        },
    });
};
