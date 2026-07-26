import { BadRequestException, Injectable } from '@nestjs/common'
import { DatabaseService } from '../../common/database/database.service'
import { SqliteRepository } from '../../common/repositories/sqlite.repository'
import { CreateCommentDto } from './dto/create-comment.dto'
import { UpdateCommentDto } from './dto/update-comment.dto'
import { Comment, CommentTargetType } from './models/comment.model'
import { COMMENTS } from './seeds/comments.seed'

@Injectable()
export class CommentsService {
  private readonly repository: SqliteRepository<Comment>

  constructor(database: DatabaseService) {
    this.repository = new SqliteRepository(database, 'comments', COMMENTS, 'Comment')
  }

  findForTarget(targetType: CommentTargetType, targetId: string): Comment[] {
    return this.repository.findAll().filter(
      (comment) => comment.targetType === targetType && comment.targetId === targetId,
    )
  }

  countForTarget(targetType: CommentTargetType, targetId: string): number {
    return this.findForTarget(targetType, targetId).length
  }

  findOne(id: string): Comment {
    return this.repository.findOne(id)
  }

  create(
    targetType: CommentTargetType,
    targetId: string,
    createCommentDto: CreateCommentDto & { author: string },
  ): Comment {
    if (createCommentDto.parentId) {
      const parent = this.repository.findOne(createCommentDto.parentId)
      if (parent.targetType !== targetType || parent.targetId !== targetId) {
        throw new BadRequestException('Reply parent must belong to the same target')
      }
    }

    return this.repository.create({
      targetType,
      targetId,
      ...createCommentDto,
      createdAt: new Date().toISOString(),
      likeCount: 0,
    })
  }

  update(id: string, updateCommentDto: UpdateCommentDto): Comment {
    return this.repository.update(id, updateCommentDto)
  }

  like(id: string): Comment {
    const comment = this.repository.findOne(id)
    return this.repository.update(id, { likeCount: comment.likeCount + 1 })
  }

  remove(id: string): void {
    this.repository.findOne(id)
    const idsToRemove = new Set([id])
    const comments = this.repository.findAll()
    let foundDescendant = true

    while (foundDescendant) {
      foundDescendant = false
      for (const comment of comments) {
        if (comment.parentId && idsToRemove.has(comment.parentId) && !idsToRemove.has(comment.id)) {
          idsToRemove.add(comment.id)
          foundDescendant = true
        }
      }
    }

    this.repository.removeMany(idsToRemove)
  }

  removeForTarget(targetType: CommentTargetType, targetId: string): void {
    const idsToRemove = new Set(
      this.findForTarget(targetType, targetId).map((comment) => comment.id),
    )
    this.repository.removeMany(idsToRemove)
  }
}
