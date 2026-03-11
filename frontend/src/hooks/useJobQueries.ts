import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';

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
        onMutate: async (newJob) => {
            await queryClient.cancelQueries({ queryKey: jobKeys.lists() });
            const previousJobs = queryClient.getQueryData(jobKeys.lists());
            queryClient.setQueryData(jobKeys.lists(), (old: any) => [...(old || []), { id: Date.now(), ...newJob }]);
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
        mutationFn: ({ id, data }: { id: number; data: any }) => apiService.updateJob(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: jobKeys.lists() });
            const previousJobs = queryClient.getQueryData(jobKeys.lists());
            queryClient.setQueryData(jobKeys.lists(), (old: any) =>
                (old || []).map((job: any) => (job.id === id ? { ...job, ...data } : job))
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
