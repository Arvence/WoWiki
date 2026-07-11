import type { CommunityEntryData } from '../types/community'

export async function fetchCommunityEntries(): Promise<CommunityEntryData[]> {
  const response = await fetch('/api/community')

  if (!response.ok) {
    throw new Error('Failed to load community entries')
  }

  return (await response.json()) as CommunityEntryData[]
}
