import apiClient from '../client';
import { AUTH_CONFIG } from '../config';

// Types for authentication
export interface AuthMethodResponse {
  auth_method: 'password' | 'magic_link';
  user_role: 'user' | 'admin' | 'technician' | 'manager';
  user_id: number;
}

export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'technician' | 'manager';
  first_name: string;
  last_name: string;
  sections?: Array<{ id: number; name: string }>;
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface MagicLinkRequest {
  email: string;
}

export interface MagicLinkLogin {
  remember_me?: boolean;
}

export interface RegisterPayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

const authService = {
  // COMMENTED OUT FOR TESTING - Magic Link functionality disabled
  // Check authentication method by email
  // checkAuthMethod: async (email: string): Promise<AuthMethodResponse> => {
  //   const response = await apiClient.post('/auth/check-method/', { email });
  //   return response.data;
  // },

  // Password login (for staff roles)
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login/', credentials);
    const data = response.data;
    
    // Store tokens in localStorage (axios interceptors will handle adding to requests)
    if (data.token) {
      localStorage.setItem(AUTH_CONFIG.tokenKey, data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.user_id,
        username: data.username,
        email: data.email,
        role: data.role,
        first_name: data.first_name,
        last_name: data.last_name,
        sections: data.sections || []
      }));
    }
    
    return data;
  },

  // Register new user
  register: async (payload: RegisterPayload): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/register/', payload);
    const data = response.data;
    
    // Auto-login after successful registration
    if (data.token) {
      localStorage.setItem(AUTH_CONFIG.tokenKey, data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.user_id,
        username: data.username,
        email: data.email,
        role: data.role,
        first_name: data.first_name,
        last_name: data.last_name,
        sections: data.sections || []
      }));
    }
    
    return data;
  },

  // COMMENTED OUT FOR TESTING - Magic Link functionality disabled
  // Request magic link (for regular users)
  // requestMagicLink: async (email: string): Promise<{ message: string }> => {
  //   const response = await apiClient.post('/auth/magic-link/request/', { email });
  //   return response.data;
  // },

  // COMMENTED OUT FOR TESTING - Magic Link functionality disabled
  // Login via magic link token
  // magicLinkLogin: async (token: string, rememberMe: boolean = false): Promise<LoginResponse> => {
  //   const response = await apiClient.post(`/auth/magic-link/${token}/`, { 
  //     remember_me: rememberMe 
  //   });
  //   const data = response.data;
  //   
  //   // Store tokens in localStorage
  //   if (data.token) {
  //     localStorage.setItem(AUTH_CONFIG.tokenKey, data.token);
  //     localStorage.setItem('user', JSON.stringify({
  //       id: data.user_id,
  //       username: data.username,
  //       email: data.email,
  //       role: data.role,
  //       first_name: data.first_name,
  //       last_name: data.last_name,
  //       sections: data.sections || []
  //     }));
  //   }
  //   
  //   return data;
  // },

  // Logout
  logout: async (): Promise<void> => {
    try {
      // Call backend logout endpoint to cleanup session
      await apiClient.post('/auth/logout/');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage regardless of API response
      localStorage.removeItem(AUTH_CONFIG.tokenKey);
      localStorage.removeItem(AUTH_CONFIG.refreshTokenKey);
      localStorage.removeItem('user');
    }
  },

  // Get user profile
  getProfile: async (): Promise<LoginResponse> => {
    const response = await apiClient.get('/auth/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<RegisterPayload>): Promise<LoginResponse> => {
    const response = await apiClient.put('/auth/profile/', data);
    return response.data;
  },

  // Utility functions
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_CONFIG.tokenKey);
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getUserRole: (): string | null => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  },

  hasRole: (roles: string | string[]): boolean => {
    const userRole = authService.getUserRole();
    if (!userRole) return false;
    
    return Array.isArray(roles) ? roles.includes(userRole) : userRole === roles;
  },

  // Clear session (for use in interceptors)
  clearSession: (): void => {
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    localStorage.removeItem(AUTH_CONFIG.refreshTokenKey);
    localStorage.removeItem('user');
  }
};

export default authService;