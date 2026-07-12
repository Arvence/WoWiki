export interface CommunityEntryData {
  id: string
  author: string
  title: string
  excerpt: string
  content: string
  category: string
  publishedAt: string
  commentCount: number
  newsId?: string
}

export interface CommunityCommentData {
  id: string
  parentId?: string
  author: string
  content: string
  createdAt: string
  likeCount: number
}
