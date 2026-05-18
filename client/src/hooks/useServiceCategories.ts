import { useState, useEffect, useCallback } from 'react'
import { getCategoriesByDepartment } from '@/api/services/catalogueService'
import type { ServiceCategory } from '@/types/catalogue'

export function useServiceCategories(departmentId: number | null) {
  const [data, setData] = useState<ServiceCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (departmentId == null) {
      setData([])
      return
    }
    try {
      setIsLoading(true)
      const res = await getCategoriesByDepartment(departmentId)
      setData(res.data.results || res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }, [departmentId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
