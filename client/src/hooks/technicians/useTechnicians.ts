import { useState, useEffect, useCallback } from 'react';
import techniciansService from '@/api/services/techniciansService';
import sectionsService from '@/api/services/sectionsService';
import type { Technician, TechniciansParams, Section } from '@/types';

interface UseTechniciansResult {
  technicians: Technician[];
  totalTechnicians: number;
  sections: Section[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useTechnicians = (params?: TechniciansParams): UseTechniciansResult => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [totalTechnicians, setTotalTechnicians] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch technicians and sections in parallel
      const [techniciansResponse, sectionsResponse] = await Promise.all([
        techniciansService.getTechnicians(params),
        sectionsService.getSections(),
      ]);

      setTechnicians(techniciansResponse.results);
      setTotalTechnicians(techniciansResponse.count);
      setSections(sectionsResponse.results);
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
    sections,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useTechnicians;
