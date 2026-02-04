import { useState, useEffect, useCallback } from 'react';
import usersService from '@/api/services/usersService';
import { useAuth } from '@/hooks/useAuth';
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
  const { user: authUser } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the authenticated user's ID from auth context
      if (!authUser?.id) {
        setUserData(authUser || null);
        setLoading(false);
        return;
      }
      
      const user = await usersService.getUserById(authUser.id);
      setUserData(user);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  }, [authUser?.id, authUser]);

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
