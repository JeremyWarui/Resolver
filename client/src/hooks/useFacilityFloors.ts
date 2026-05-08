import { useState, useEffect, useCallback } from 'react'
import { getFacilityFloors } from '@/api/services/organisationService'
import type { FacilityFloor } from '@/types'

export function useFacilityFloors(facilityId: number | null) {
  const [data, setData] = useState<FacilityFloor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (facilityId == null) {
      setData([])
      return
    }
    try {
      setIsLoading(true)
      const res = await getFacilityFloors(facilityId)
      setData(res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load floors')
    } finally {
      setIsLoading(false)
    }
  }, [facilityId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
