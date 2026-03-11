import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';
import { useSettingsQuery, settingsKeys } from '../hooks/useSettingsQueries';

type Theme = 'light' | 'dark' | 'system';

interface UserSettings {
    theme: Theme;
    language: string;
    timezone: string;
    email_notifications: boolean;
}

interface ThemeContextType {
    theme: Theme;
    settings: UserSettings | null;
    isLoading: boolean;
    setTheme: (theme: Theme) => void;
    updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>('system');
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const { data: settings = null, isLoading } = useSettingsQuery(isAuthenticated);

    useEffect(() => {
        // Init theme from settings or cache
        if (settings?.theme) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setThemeState(settings.theme);
            localStorage.setItem('theme', settings.theme);
        } else {
            const cachedTheme = localStorage.getItem('theme') as Theme;
            if (cachedTheme) {
                setThemeState(cachedTheme);
            }
        }
    }, [settings?.theme]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        if (isAuthenticated) {
            try {
                const updated = await apiService.updateSettings({ theme: newTheme });
                queryClient.setQueryData(settingsKeys.all, updated);
            } catch (error) {
                console.error("Failed to update theme on server:", error);
            }
        }
    };

    const updateSettings = async (newSettings: Partial<UserSettings>) => {
        if (isAuthenticated) {
            try {
                const updated = await apiService.updateSettings(newSettings);
                queryClient.setQueryData(settingsKeys.all, updated);
                // If theme was updated as part of the settings bundle, sync state
                if (updated.theme && updated.theme !== theme) {
                    setThemeState(updated.theme);
                    localStorage.setItem('theme', updated.theme);
                }
            } catch (error) {
                console.error("Failed to update user settings:", error);
                throw error;
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, settings, isLoading, setTheme, updateSettings }}>
            {children}
        </ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
