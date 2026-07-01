import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types';

interface UseUsersParams {
  role?: string;
  sections?: number;
  page?: number;
  page_size?: number;
}

export const USERS_KEY = ['users'] as const;

/**
 * ⚠️ DEPRECATED: useUsers hook
 * 
 * The /users/ endpoint does not exist on the backend.
 * Per CLAUDE.md §28 Reconciliation, user management endpoints have been removed.
 * 
 * This hook now returns an empty array. Components should:
 * - Use role-assignment endpoints for role-scoped user lists
 * - Use /sections/{id}/technicians/ for section-scoped technician lists
 * - Use /auth/me/ for current user profile
 * 
 * @deprecated
 */
const useUsers = (_params: UseUsersParams = {}, _skip = false) => {
  const queryClient = useQueryClient();
  
  console.warn(
    'useUsers hook is deprecated. The /users/ endpoint does not exist. ' +
    'See CLAUDE.md §28 for alternative approaches.'
  );

  const refetch = () => queryClient.invalidateQueries({ queryKey: USERS_KEY });

  return {
    users: [] as User[],
    totalUsers: 0,
    loading: false,
    error: null,
    refetch,
  };
};

export default useUsers;
