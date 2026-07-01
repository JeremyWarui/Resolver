import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';

export const USER_PROFILE_KEY = ['currentUser'] as const;

export const useUserData = () => {
  const { user: authUser } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);

  const { data, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: [...USER_PROFILE_KEY, authUser?.id],
    queryFn: async () => {
      if (!authUser) return null;
      // No dedicated /users/<id>/ endpoint exists.  Hydrate the Zustand store from
      // the login-time profile in localStorage, patching campus_id from the JWT
      // token payload if the stored value is null (happens for existing sessions
      // created before the flattenJWT campus_id fix).
      const token = localStorage.getItem('authToken') ?? '';
      let user = { ...authUser };
      if (!user.primary_campus_id && token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
          if (typeof payload.campus_id === 'number') {
            user = { ...user, primary_campus_id: payload.campus_id };
          }
        } catch { /* ignore */ }
      }
      setUser(user as typeof authUser, token);
      return user as typeof authUser;
    },
    enabled: !!authUser,
    staleTime: 10 * 60 * 1000,
  });

  return {
    userData: data ?? null,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
};

export default useUserData;
