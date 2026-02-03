import { useState, useEffect, useCallback } from 'react';
import techniciansService from '@/api/services/techniciansService';
import type { Technician, TechniciansParams } from '@/types';

interface UseTechniciansResult {
  technicians: Technician[];
  totalTechnicians: number;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useTechnicians = (params?: TechniciansParams): UseTechniciansResult => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [totalTechnicians, setTotalTechnicians] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch only technicians - sections should come from SharedDataContext
      const techniciansResponse = await techniciansService.getTechnicians(params);
      setTechnicians(techniciansResponse.results);
      setTotalTechnicians(techniciansResponse.count);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch technicians'));
      console.error('Error fetching technicians:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params?.page,
    params?.page_size,
    params?.sections,
    params?.ordering,
    params?.search,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    technicians,
    totalTechnicians,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useTechnicians;
