'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, User } from '@/lib/api';
import { getToken, setToken as saveToken, removeToken } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (email: string, fullName: string, password: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const storedToken = getToken();
      
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      
      // Verify token by fetching user data
      // This ensures we always have fresh user data on reload
      const response = await apiClient.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        // Token is invalid, clear it
        removeToken();
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      // Token is invalid or expired
      removeToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, fullName: string, password: string) => {
    try {
      const response = await apiClient.signup({ email, fullName, password });
      
      if (response.success && response.token && response.user) {
        // Store token in localStorage (persists across reloads)
        saveToken(response.token);
        setToken(response.token); // Update state
        setUser(response.user);
        router.push('/');
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Signup failed');
    }
  };

  const signin = async (email: string, password: string) => {
    try {
      const response = await apiClient.signin({ email, password });
      
      if (response.success && response.token && response.user) {
        // Store token in localStorage (persists across reloads)
        saveToken(response.token);
        setToken(response.token); // Update state
        setUser(response.user);
        router.push('/');
      } else {
        throw new Error(response.message || 'Signin failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Signin failed');
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      // Remove token from localStorage
      removeToken();
      setToken(null);
      setUser(null);
      router.push('/login');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    signup,
    signin,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

