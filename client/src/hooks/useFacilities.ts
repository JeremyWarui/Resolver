import { useState, useEffect, useCallback } from 'react'
import { getCampusFacilities, getFacilities } from '@/api/services/organisationService'
import type { Facility } from '@/types'

export function useFacilities(campusId?: number) {
  const [data, setData] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = campusId != null
        ? await getCampusFacilities(campusId)
        : await getFacilities()
      setData(res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load facilities')
    } finally {
      setIsLoading(false)
    }
  }, [campusId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
