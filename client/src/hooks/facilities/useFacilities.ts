import { useState, useEffect, useCallback } from 'react';
import facilitiesService from '@/api/services/facilitiesService';
import type { Facility } from '@/types';

interface UseFacilitiesResult {
  facilities: Facility[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useFacilities = (): UseFacilitiesResult => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await facilitiesService.getFacilities();
      setFacilities(response.results);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch facilities'));
      console.error('Error fetching facilities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    facilities,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useFacilities;
