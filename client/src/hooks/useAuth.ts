import { useState, useEffect } from 'react';
import { authService } from '@/api/services';
import type { LoginResponse, LoginCredentials, RegisterPayload } from '@/api/services/authService';
import type { User } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = () => {
      const currentUser = authService.getCurrentUser();
      const isAuth = authService.isAuthenticated();
      
      setUser(currentUser);
      setIsAuthenticated(isAuth);
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(authService.getCurrentUser());
      setIsAuthenticated(true);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.register(payload);
      setUser(authService.getCurrentUser());
      setIsAuthenticated(true);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // COMMENTED OUT FOR TESTING - Magic Link functionality disabled
  // const checkAuthMethod = async (email: string): Promise<AuthMethodResponse> => {
  //   return authService.checkAuthMethod(email);
  // };

  // const requestMagicLink = async (email: string): Promise<{ message: string }> => {
  //   return authService.requestMagicLink(email);
  // };

  // const magicLinkLogin = async (token: string, rememberMe?: boolean): Promise<LoginResponse> => {
  //   setIsLoading(true);
  //   try {
  //     const response = await authService.magicLinkLogin(token, rememberMe);
  //     setUser(authService.getCurrentUser());
  //     setIsAuthenticated(true);
  //     return response;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    // COMMENTED OUT FOR TESTING - Magic Link functionality disabled
    // checkAuthMethod,
    // requestMagicLink,
    // magicLinkLogin,
    hasRole: authService.hasRole,
    getUserRole: authService.getUserRole,
  };
};