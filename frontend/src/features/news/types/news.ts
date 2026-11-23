export interface News {
  id: string
  title: string
  summary: string
  content: string
  category: string
  author: string
  updatedAt: string
  imageUrl?: string
  viewerCount?: number
  likeCount?: number
}

export type NewsContent = Pick<News, 'title' | 'summary' | 'content' | 'category'> & { imageUrl: string | null }

export type EditorNews = News & {
  status: 'draft' | 'scheduled' | 'published'
  scheduledAtUtc?: string
  scheduleId?: string
  taskForgeJobId?: string
  enforcePublicationDeadline: boolean
}

export type EditorNewsPreview = Pick<EditorNews, 'id' | 'title' | 'summary' | 'category' | 'updatedAt' | 'imageUrl' | 'status' | 'scheduledAtUtc'>
