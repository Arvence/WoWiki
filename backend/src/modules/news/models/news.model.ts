export type NewsStatus = 'draft' | 'scheduled' | 'published'

export class News {
  id!: string
  title!: string
  summary!: string
  content!: string
  category!: string
  author!: string
  updatedAt!: string
  imageUrl?: string
  viewerCount?: number
  likeCount?: number
}

export type NewsRecord = News & {
  status?: NewsStatus
  scheduledAtUtc?: string
  scheduleId?: string
  taskForgeJobId?: string
  enforcePublicationDeadline?: boolean
}
