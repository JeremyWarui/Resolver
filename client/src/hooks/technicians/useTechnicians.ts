import { useState, useEffect, useCallback } from 'react';
import techniciansService, { type TechnicianFilters } from '@/api/services/techniciansService';
import type { Technician } from '@/types';

interface UseTechniciansResult {
  technicians: Technician[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useTechnicians = (filters?: TechnicianFilters): UseTechniciansResult => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTechnicians([]); // clear stale data immediately so previous results don't flash
    try {
      const data = await techniciansService.getTechnicians(filters);
      setTechnicians(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch technicians'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.campus_department_id, filters?.section_ids, filters?.section_id, filters?.campus_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { technicians, loading, error, refetch: fetchData };
};

export default useTechnicians;
