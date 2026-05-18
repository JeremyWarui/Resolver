import { useState, useEffect } from 'react';
import usersService from '@/api/services/usersService';
import type { User } from '@/types';

interface UseUsersParams {
  role?: string;
  sections?: number;
  page?: number;
  page_size?: number;
}

interface UseUsersResult {
  users: User[];
  totalUsers: number;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const useUsers = (params: UseUsersParams = {}, skip = false): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    if (skip) return;
    setLoading(true);
    setError(null);

    try {
      const response = await usersService.getUsers(params);
      setUsers(response.results);
      setTotalUsers(response.count);
    } catch (err) {
      // 403 means the current role lacks permission — silently return empty rather than breaking UI
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setUsers([]);
        setTotalUsers(0);
      } else {
        setError(err instanceof Error ? err : new Error('Failed to fetch users'));
        console.error('Error fetching users:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!skip) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.role, params.sections, params.page, params.page_size, skip]);

  return {
    users,
    totalUsers,
    loading,
    error,
    refetch: fetchUsers,
  };
};

export default useUsers;
