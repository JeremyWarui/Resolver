import { useState, useEffect, useCallback } from 'react'
import { getCampusDepartments, getDepartments } from '@/api/services/organisationService'
import type { Department } from '@/types'

export function useDepartments(campusId?: number) {
  const [data, setData] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = campusId != null
        ? await getCampusDepartments(campusId)
        : await getDepartments()
      setData(res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load departments')
    } finally {
      setIsLoading(false)
    }
  }, [campusId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
