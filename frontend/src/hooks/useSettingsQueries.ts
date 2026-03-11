import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';

export const settingsKeys = {
    all: ['settings'] as const,
};

export const useSettingsQuery = (enabled: boolean = true) => {
    return useQuery({
        queryKey: settingsKeys.all,
        queryFn: apiService.getSettings,
        enabled,
    });
};
