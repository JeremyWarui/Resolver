import { useState, useEffect, useCallback } from 'react';
import usersService from '@/api/services/usersService';
import type { User } from '@/types';

interface UseUserDataResult {
  userData: User | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useUserData = (): UseUserDataResult => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // DEMO OVERRIDE: Always use user id 2 for UserDashboard
      const userId = 2;
      const user = await usersService.getUserById(userId);
      setUserData(user);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    userData,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useUserData;
