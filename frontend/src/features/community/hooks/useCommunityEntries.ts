import { useCallback, useEffect, useState } from 'react'
import { fetchCommunityEntries } from '../api/communityService'
import type { CommunityEntryData } from '../types/community'

type CommunityEntriesState = {
  entries: CommunityEntryData[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

export function useCommunityEntries(): CommunityEntriesState {
  const [entries, setEntries] = useState<CommunityEntryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setEntries(await fetchCommunityEntries())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
    window.addEventListener('wowiki:community-entry-created', reload)
    return () => window.removeEventListener('wowiki:community-entry-created', reload)
  }, [reload])

  return { entries, loading, error, reload }
}
