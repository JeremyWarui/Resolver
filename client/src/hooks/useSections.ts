import { useState, useEffect, useCallback } from 'react'
import { getDepartmentSections, getSections } from '@/api/services/organisationService'
import type { Section } from '@/types'

export function useSections(departmentId?: number) {
  const [data, setData] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = departmentId != null
        ? await getDepartmentSections(departmentId)
        : await getSections()
      setData(res.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load sections')
    } finally {
      setIsLoading(false)
    }
  }, [departmentId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
