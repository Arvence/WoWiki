import type { CommunityCommentData, CommunityEntryData } from '../types/community'

export async function fetchCommunityEntries(): Promise<CommunityEntryData[]> {
  const response = await fetch('/api/community')

  if (!response.ok) {
    throw new Error('Failed to load community entries')
  }

  return (await response.json()) as CommunityEntryData[]
}

export async function fetchCommunityEntryById(entryId: string): Promise<CommunityEntryData> {
  const response = await fetch(`/api/community/${entryId}`)

  if (!response.ok) {
    throw new Error(response.status === 404 ? 'Community entry not found' : 'Failed to load community entry')
  }

  return (await response.json()) as CommunityEntryData
}

export async function fetchCommunityComments(entryId: string): Promise<CommunityCommentData[]> {
  const response = await fetch(`/api/community/${entryId}/comments`)

  if (!response.ok) {
    throw new Error('Failed to load comments')
  }

  return (await response.json()) as CommunityCommentData[]
}

export async function createCommunityComment(entryId: string, input: { author: string; content: string; parentId?: string }): Promise<CommunityCommentData> {
  const response = await fetch(`/api/community/${entryId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error('Failed to post comment')
  }

  return (await response.json()) as CommunityCommentData
}

export async function likeCommunityComment(commentId: string): Promise<CommunityCommentData> {
  const response = await fetch(`/api/comments/${commentId}/like`, { method: 'POST' })

  if (!response.ok) {
    throw new Error('Failed to like comment')
  }

  return (await response.json()) as CommunityCommentData
}

export type CreateCommunityEntryInput = Omit<CommunityEntryData, 'id' | 'commentCount' | 'viewerCount'>

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
