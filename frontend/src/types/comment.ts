export type CommentTargetType = 'news' | 'community'

export interface CommentData {
  id: string
  targetType: CommentTargetType
  targetId: string
  parentId?: string
  author: string
  content: string
  createdAt: string
  likeCount: number
}

export interface CreateCommentData {
  author: string
  content: string
  parentId?: string
}
