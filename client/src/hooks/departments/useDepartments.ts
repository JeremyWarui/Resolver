import { useEffect, useState } from 'react';
import { departmentsService } from '@/api/services';
import type { Department } from '@/types/organisationStructure';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await departmentsService.getDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch departments');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const refetch = () => fetchDepartments();

  return {
    departments,
    loading,
    error,
    refetch,
  };
};

export default useDepartments;
