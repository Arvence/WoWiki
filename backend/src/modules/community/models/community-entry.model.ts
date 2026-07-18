export class CommunityEntry {
  id!: string
  author!: string
  title!: string
  excerpt!: string
  content!: string
  category!: string
  publishedAt!: string
  viewerCount!: number
  newsId?: string
  image?: string
  hashtags?: string[]
}
