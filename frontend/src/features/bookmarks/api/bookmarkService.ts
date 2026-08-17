import { http } from '../../../shared/api/http'
import type { Bookmark, BookmarkTargetType } from '../types/bookmark'

export function getBookmarks(): Promise<Bookmark[]> {
  return http.get<Bookmark[]>('/api/bookmarks', { errorMessage: 'Could not load bookmarks' })
}

export function saveBookmark(targetType: BookmarkTargetType, targetId: string): Promise<Bookmark> {
  return http.put<Bookmark>(`/api/bookmarks/${targetType}/${encodeURIComponent(targetId)}`, undefined, { errorMessage: 'Could not save bookmark' })
}

export function deleteBookmark(targetType: BookmarkTargetType, targetId: string): Promise<void> {
  return http.delete(`/api/bookmarks/${targetType}/${encodeURIComponent(targetId)}`, { errorMessage: 'Could not remove bookmark' })
}
