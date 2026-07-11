import type { CommunityEntryData } from '../types/community'

export async function fetchCommunityEntries(): Promise<CommunityEntryData[]> {
  const response = await fetch('/api/community')

  if (!response.ok) {
    throw new Error('Failed to load community entries')
  }

  return (await response.json()) as CommunityEntryData[]
}

export type CreateCommunityEntryInput = Omit<CommunityEntryData, 'id' | 'commentCount'>

export async function createCommunityEntry(input: CreateCommunityEntryInput): Promise<CommunityEntryData> {
  const response = await fetch('/api/community', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error('Failed to create community entry')
  }

  return (await response.json()) as CommunityEntryData
}
