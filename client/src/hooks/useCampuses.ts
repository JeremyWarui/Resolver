import { useState, useEffect, useCallback } from 'react'
import { getCampuses } from '@/api/services/organisationService'
import type { Campus } from '@/types'

export function useCampuses() {
  const [data, setData] = useState<Campus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await getCampuses()
      setData(res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load campuses')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
