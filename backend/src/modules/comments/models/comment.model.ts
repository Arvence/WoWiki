export type CommentTargetType = 'community'

export class Comment {
  id!: string
  targetType!: CommentTargetType
  targetId!: string
  parentId?: string
  author!: string
  content!: string
  createdAt!: string
  likeCount!: number
}
