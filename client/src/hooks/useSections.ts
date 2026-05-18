import { useState, useEffect, useCallback } from 'react'
import { sectionsService } from '@/api/services/organizationsService'
import type { Section } from '@/types'

export function useSections(departmentId?: number, skip = false) {
  const [data, setData] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (skip) return
    try {
      setIsLoading(true)
      const sections = departmentId != null
        ? await sectionsService.getDepartmentSections(departmentId)
        : await sectionsService.getSections()
      setData(sections)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load sections')
    } finally {
      setIsLoading(false)
    }
  }, [departmentId, skip])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
