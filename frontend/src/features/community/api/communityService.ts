import type { CommunityCommentData, CommunityEntryData } from '../types/community'
import { http } from '../../../shared/api/http'

export async function fetchCommunityEntries(): Promise<CommunityEntryData[]> {
  return http.get<CommunityEntryData[]>('/api/community', { errorMessage: 'Failed to load community entries' })
}

export async function fetchCommunityEntryById(entryId: string): Promise<CommunityEntryData> {
  return http.get<CommunityEntryData>(`/api/community/${entryId}`, {
    errorMessage: 'Failed to load community entry',
    notFoundMessage: 'Community entry not found',
  })
}

export async function fetchCommunityComments(entryId: string): Promise<CommunityCommentData[]> {
  return http.get<CommunityCommentData[]>(`/api/community/${entryId}/comments`, { errorMessage: 'Failed to load comments' })
}

export async function createCommunityComment(entryId: string, input: { author: string; content: string; parentId?: string }): Promise<CommunityCommentData> {
  return http.post<CommunityCommentData>(`/api/community/${entryId}/comments`, input, { errorMessage: 'Failed to post comment' })
}

export async function likeCommunityComment(commentId: string): Promise<CommunityCommentData> {
  return http.post<CommunityCommentData>(`/api/comments/${commentId}/like`, undefined, { errorMessage: 'Failed to like comment' })
}

export type CreateCommunityEntryInput = Omit<CommunityEntryData, 'id' | 'commentCount' | 'viewerCount'>

export async function createCommunityEntry(input: CreateCommunityEntryInput): Promise<CommunityEntryData> {
  return http.post<CommunityEntryData>('/api/community', input, { errorMessage: 'Failed to create community entry' })
}
