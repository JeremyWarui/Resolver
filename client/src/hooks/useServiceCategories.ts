import { useState, useEffect, useCallback } from 'react'
import { getCategoriesBySectionType } from '@/api/services/catalogueService'
import type { ServiceCategory } from '@/types/catalogue'

export function useServiceCategories(sectionTypeId: number | null) {
  const [data, setData] = useState<ServiceCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (sectionTypeId == null) {
      setData([])
      return
    }
    try {
      setIsLoading(true)
      const res = await getCategoriesBySectionType(sectionTypeId)
      setData(res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }, [sectionTypeId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
