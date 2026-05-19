import { useEffect, useState } from 'react';

interface UseCRUDPageOptions {
  initialPageSize?: number;
}

interface UseCRUDPageResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pageIndex: number;
  setPageIndex: (index: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalCount: number;
  searchValue: string;
  setSearchValue: (value: string) => void;
  sorting: Array<{ id: string; desc: boolean }>;
  setSorting: (sorting: Array<{ id: string; desc: boolean }>) => void;
  refetch: () => void;
}

/**
 * Hook for managing CRUD page state and data fetching.
 * Consolidates pagination, search, sorting, and loading states.
 *
 * @param fetcher - Async function that fetches data. Should return { data: T[], count: number }
 * @param options - Configuration options
 * @returns Object with state and setters
 */
export function useCRUDPage<T>(
  fetcher: (
    pageIndex: number,
    pageSize: number,
    searchValue: string,
    sorting: Array<{ id: string; desc: boolean }>
  ) => Promise<{ data: T[]; count: number }>,
  options: UseCRUDPageOptions = {}
): UseCRUDPageResult<T> {
  const { initialPageSize = 10 } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(pageIndex, pageSize, searchValue, sorting);
      setData(result.data);
      setTotalCount(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when dependencies change
  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, searchValue, sorting]);

  return {
    data,
    loading,
    error,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    totalCount,
    searchValue,
    setSearchValue,
    sorting,
    setSorting,
    refetch: fetchData,
  };
}
