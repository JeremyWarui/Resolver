import { useState, useEffect, useCallback } from 'react';
import sectionsService from '@/api/services/sectionsService';
import type { Section, SectionsResponse } from '@/types';

interface UseSectionsResult {
  sections: Section[];
  totalSections: number;
  loading: boolean;
  error: Error | null;
  createSection: (data: { name: string; description?: string }) => Promise<Section | null>;
  updateSection: (id: number, data: Partial<Section>) => Promise<Section | null>;
  deleteSection: (id: number) => Promise<boolean>;
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
      const response: SectionsResponse = await sectionsService.getSections();
      setSections(response.results);
      setTotalSections(response.count);
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

  const createSection = async (data: { name: string; description?: string }) => {
    try {
      const result = await sectionsService.createSection(data);
      // Optimistically refresh
      await fetchData();
      return result;
    } catch (err) {
      console.error('Failed to create section:', err);
      return null;
    }
  };

  const updateSection = async (id: number, data: Partial<Section>) => {
    try {
      const result = await sectionsService.updateSection(id, data);
      await fetchData();
      return result;
    } catch (err) {
      console.error('Failed to update section:', err);
      return null;
    }
  };

  const deleteSection = async (id: number) => {
    try {
      await sectionsService.deleteSection(id);
      await fetchData();
      return true;
    } catch (err) {
      console.error('Failed to delete section:', err);
      return false;
    }
  };

  return {
    sections,
    totalSections,
    loading,
    error,
    createSection,
    updateSection,
    deleteSection,
    refetch: fetchData,
  };
};

export default useSections;
