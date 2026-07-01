import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

const TOKEN_KEY = 'authToken';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setUser: (user: User, token: string) => void;
  clearUser: () => void;
  getToken: () => string | null;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem(TOKEN_KEY),
      isAuthenticated: !!localStorage.getItem(TOKEN_KEY),

      setUser: (user, token) => {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },

      clearUser: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('currentUser');
        set({ user: null, token: null, isAuthenticated: false });
      },

      getToken: () => get().token ?? localStorage.getItem(TOKEN_KEY),

      // Updates the active role in the store (future multi-role support).
      // Does not make an API call — caller is responsible for re-fetching scope.
      switchRole: (role) => {
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        }));
      },
    }),
    {
      name: 'auth-store',
      // Only persist the token; user profile is re-hydrated from the API on mount
      partialize: (state) => ({ token: state.token }),
    }
  )
);
