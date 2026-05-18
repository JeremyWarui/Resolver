import { useState, useEffect, useCallback } from 'react'
import { campusesService } from '@/api/services/organizationsService'
import type { Campus } from '@/types'

export function useCampuses() {
  const [data, setData] = useState<Campus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const campuses = await campusesService.getCampuses()
      setData(campuses)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load campuses')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
