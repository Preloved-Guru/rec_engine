'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import authService, { User, LoginResponse } from '@/services/auth';

interface AuthContextType {
    user: User | null;
    login: (username: string) => Promise<LoginResponse>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = useCallback(async (username: string) => {
        setIsLoading(true);
        try {
            const response = await authService.login(username);
            setUser(response.user);
            return response;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 