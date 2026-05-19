import { useEffect, useState } from 'react';
import { campusesService } from '@/api/services';
import type { Campus } from '@/types/organisationStructure';

export const useCampuses = () => {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await campusesService.getCampuses();
      setCampuses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campuses');
      setCampuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  const refetch = () => fetchCampuses();

  return {
    campuses,
    loading,
    error,
    refetch,
  };
};

export default useCampuses;
