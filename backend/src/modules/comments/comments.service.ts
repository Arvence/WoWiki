import { BadRequestException, Injectable } from '@nestjs/common'
import { findByIdOrThrow } from '../../common/errors/find-by-id-or-throw'
import { cloneValue } from '../../common/utils/clone-value'
import { CreateCommentDto } from './dto/create-comment.dto'
import { UpdateCommentDto } from './dto/update-comment.dto'
import { Comment, CommentTargetType } from './models/comment.model'
import { COMMENTS } from './seeds/comments.seed'

@Injectable()
export class CommentsService {
  private comments: Comment[] = cloneValue(COMMENTS)
  private nextId = Math.max(0, ...this.comments.map((comment) => Number(comment.id))) + 1

  findForTarget(targetType: CommentTargetType, targetId: string): Comment[] {
    return cloneValue(this.comments.filter((comment) => comment.targetType === targetType && comment.targetId === targetId))
  }

  countForTarget(targetType: CommentTargetType, targetId: string): number {
    return this.comments.filter((comment) => comment.targetType === targetType && comment.targetId === targetId).length
  }

  findOne(id: string): Comment {
    return cloneValue(this.findEntity(id))
  }

  create(
    targetType: CommentTargetType,
    targetId: string,
    createCommentDto: CreateCommentDto,
  ): Comment {
    if (createCommentDto.parentId) {
      const parent = this.findEntity(createCommentDto.parentId)
      if (parent.targetType !== targetType || parent.targetId !== targetId) {
        throw new BadRequestException('Reply parent must belong to the same target')
      }
    }

    const comment: Comment = cloneValue({
      id: String(this.nextId++),
      targetType,
      targetId,
      ...createCommentDto,
      createdAt: new Date().toISOString(),
      likeCount: 0,
    })
    this.comments.push(comment)
    return cloneValue(comment)
  }

  update(id: string, updateCommentDto: UpdateCommentDto): Comment {
    const comment = this.findEntity(id)
    Object.assign(comment, cloneValue(updateCommentDto))
    return cloneValue(comment)
  }

  like(id: string): Comment {
    const comment = this.findEntity(id)
    comment.likeCount += 1
    return cloneValue(comment)
  }

  remove(id: string): void {
    this.findEntity(id)
    const idsToRemove = new Set([id])
    let foundDescendant = true

    while (foundDescendant) {
      foundDescendant = false
      for (const comment of this.comments) {
        if (comment.parentId && idsToRemove.has(comment.parentId) && !idsToRemove.has(comment.id)) {
          idsToRemove.add(comment.id)
          foundDescendant = true
        }
      }
    }

    this.comments = this.comments.filter((comment) => !idsToRemove.has(comment.id))
  }

  removeForTarget(targetType: CommentTargetType, targetId: string): void {
    this.comments = this.comments.filter(
      (comment) => comment.targetType !== targetType || comment.targetId !== targetId,
    )
  }

  private findEntity(id: string): Comment {
    return findByIdOrThrow(this.comments, id, 'Comment')
  }
}
