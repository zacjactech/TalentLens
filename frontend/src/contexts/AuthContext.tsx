import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import apiService from '../services/api';
import type { User } from '../types';

interface AuthContextType {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('talentlens_token');
            if (storedToken) {
                try {
                    // Temporarily set token so API calls use it in interceptor
                    // By right interceptor reads from localStorage directly, which is already set
                    const userData = await apiService.getMe();
                    setToken(storedToken);
                    setUser(userData);
                } catch (error) {
                    console.error("Failed to restore session:", error);
                    localStorage.removeItem('talentlens_token');
                }
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const data = await apiService.login(email, password);
        const accessToken = data.access_token;
        localStorage.setItem('talentlens_token', accessToken);
        setToken(accessToken);
        try {
            const userData = await apiService.getMe();
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch user data after login:", error);
        }
    };

    const register = async (email: string, password: string) => {
        await apiService.register(email, password);
    };

    const logout = () => {
        localStorage.removeItem('talentlens_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated: !!token,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
