export type BookmarkTargetType = 'news' | 'community'

export interface Bookmark {
  id: string
  userId: string
  targetType: BookmarkTargetType
  targetId: string
  createdAtUtc: string
}
