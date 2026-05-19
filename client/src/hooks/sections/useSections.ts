import { useState, useEffect, useCallback } from 'react';
import { sectionsService } from '@/api/services/organizationsService';
import type { Section } from '@/types';

interface UseSectionsResult {
  sections: Section[];
  totalSections: number;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useSections = (): UseSectionsResult => {
  const [sections, setSections] = useState<Section[]>([]);
  const [totalSections, setTotalSections] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await sectionsService.getSections();
      setSections(data);
      setTotalSections(data.length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sections'));
      console.error('Error fetching sections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    sections,
    totalSections,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useSections;
