import { useState, useEffect, useCallback } from 'react'
import { getServiceItemsByCategory } from '@/api/services/catalogueService'
import type { ServiceItem } from '@/types/catalogue'

export function useServiceItems(categoryId: number | null) {
  const [data, setData] = useState<ServiceItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (categoryId == null) {
      setData([])
      return
    }
    try {
      setIsLoading(true)
      const res = await getServiceItemsByCategory(categoryId)
      setData(res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load service items')
    } finally {
      setIsLoading(false)
    }
  }, [categoryId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
