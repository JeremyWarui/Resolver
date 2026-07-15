import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';

export const USER_PROFILE_KEY = ['currentUser'] as const;

export const useUserData = () => {
  const authUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const { data, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: [...USER_PROFILE_KEY, authUser?.id],
    queryFn: async () => {
      if (!authUser) return null;
      // No dedicated /users/<id>/ endpoint exists — the store user (hydrated at
      // login) is the profile. Patch campus_id from the JWT payload if the
      // stored value is null (sessions created before the flattenJWT campus_id
      // fix) and re-persist through the store.
      const token = useAuthStore.getState().getToken() ?? '';
      if (!authUser.primary_campus_id && token) {
        try {
          const payload = JSON.parse(
            atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
          );
          if (typeof payload.campus_id === 'number') {
            const patched = { ...authUser, primary_campus_id: payload.campus_id };
            setUser(patched, token);
            return patched;
          }
        } catch {
          /* ignore */
        }
      }
      return authUser;
    },
    enabled: !!authUser,
    staleTime: 10 * 60 * 1000,
  });

  return {
    userData: data ?? authUser ?? null,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
};

export default useUserData;
