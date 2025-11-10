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

const useUsers = (params: UseUsersParams = {}): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await usersService.getUsers(params);
      setUsers(response.results);
      setTotalUsers(response.count);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.role, params.sections, params.page, params.page_size]);

  return {
    users,
    totalUsers,
    loading,
    error,
    refetch: fetchUsers,
  };
};

export default useUsers;
