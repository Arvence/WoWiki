export enum BookmarkTargetType {
  Community = 'community',
  News = 'news',
}

export class Bookmark {
  id!: string
  userId!: string
  targetType!: BookmarkTargetType
  targetId!: string
  createdAtUtc!: string
}
