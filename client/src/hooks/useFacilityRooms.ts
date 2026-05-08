import { useState, useEffect, useCallback } from 'react'
import { getFloorRooms } from '@/api/services/organisationService'
import type { FacilityRoom } from '@/types'

export function useFacilityRooms(floorId: number | null) {
  const [data, setData] = useState<FacilityRoom[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (floorId == null) {
      setData([])
      return
    }
    try {
      setIsLoading(true)
      const res = await getFloorRooms(floorId)
      setData(res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load rooms')
    } finally {
      setIsLoading(false)
    }
  }, [floorId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
