import { useState } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  isAuthenticated as checkAuthenticated,
  hasRole,
  getUserRole,
} from '@/lib/api/auth';
import type {
  LoginResponse,
  LoginCredentials,
  RegisterPayload,
  RegisterResult,
} from '@/lib/api/auth';
import type { User } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => getCurrentUser() as User | null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkAuthenticated());

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await apiLogin(credentials);
      setUser(getCurrentUser() as User | null);
      setIsAuthenticated(true);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  // No auto-login here: the new account is inactive until the user sets a
  // password via the emailed invite link (see SetPasswordPage).
  const register = async (payload: RegisterPayload): Promise<RegisterResult> => {
    setIsLoading(true);
    try {
      return await apiRegister(payload);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    getUserRole,
  };
};
