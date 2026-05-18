import { useState, useEffect, useCallback } from 'react'
import { facilitiesService } from '@/api/services/organizationsService'
import type { Facility } from '@/types'

export function useFacilities(campusId?: number, skip = false) {
  const [data, setData] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (skip) return
    try {
      setIsLoading(true)
      const facilities = campusId != null
        ? await facilitiesService.getCampusFacilities(campusId)
        : await facilitiesService.getFacilities()
      setData(facilities)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load facilities')
    } finally {
      setIsLoading(false)
    }
  }, [campusId, skip])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
