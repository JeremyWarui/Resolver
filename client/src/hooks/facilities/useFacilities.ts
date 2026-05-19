import { useState, useEffect, useCallback } from 'react';
import { facilitiesService } from '@/api/services/organizationsService';
import type { Facility } from '@/types';

interface UseFacilitiesResult {
  data: Facility[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  // Legacy properties for backward compatibility
  facilities?: Facility[];
  loading?: boolean;
}

/**
 * Hook to fetch facilities with optional campus filtering
 *
 * @param campusId Optional campus ID to filter facilities by
 * @returns Facilities data with loading, error states and refetch function
 *
 * @example
 * const { data, isLoading, error, refetch } = useFacilities();
 * const { data: campusFacilities } = useFacilities(campusId);
 */
export const useFacilities = (campusId?: number): UseFacilitiesResult => {
  const [data, setData] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await facilitiesService.getFacilities();
      const facilities = Array.isArray(response) ? response : (response as any).results || [];
      const filtered = campusId
        ? facilities.filter((f: Facility) => f.campus === campusId)
        : facilities;
      setData(filtered);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch facilities'));
      console.error('Error fetching facilities:', err);
    } finally {
      setIsLoading(false);
    }
  }, [campusId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    // Legacy properties
    facilities: data,
    loading: isLoading,
  };
};

export default useFacilities;
