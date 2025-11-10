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
      // For now, using a mock user ID. Replace with actual current user endpoint
      // const user = await usersService.getCurrentUser();
      // Or get from localStorage/context
      const userId = localStorage.getItem('userId') || '1';
      const user = await usersService.getUserById(Number(userId));
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
