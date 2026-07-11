import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CreateCommentDto } from './dto/create-comment.dto'
import { UpdateCommentDto } from './dto/update-comment.dto'
import { Comment, CommentTargetType } from './models/comment.model'
import { COMMENTS } from './seeds/comments.seed'

@Injectable()
export class CommentsService {
  private comments: Comment[] = [...COMMENTS]
  private nextId = Math.max(0, ...this.comments.map((comment) => Number(comment.id))) + 1

  findForTarget(targetType: CommentTargetType, targetId: string): Comment[] {
    return this.comments.filter(
      (comment) => comment.targetType === targetType && comment.targetId === targetId,
    )
  }

  countForTarget(targetType: CommentTargetType, targetId: string): number {
    return this.findForTarget(targetType, targetId).length
  }

  findOne(id: string): Comment {
    const comment = this.comments.find((item) => item.id === id)
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`)
    }
    return comment
  }

  create(
    targetType: CommentTargetType,
    targetId: string,
    createCommentDto: CreateCommentDto,
  ): Comment {
    if (createCommentDto.parentId) {
      const parent = this.findOne(createCommentDto.parentId)
      if (parent.targetType !== targetType || parent.targetId !== targetId) {
        throw new BadRequestException('Reply parent must belong to the same target')
      }
    }

    const comment: Comment = {
      id: String(this.nextId++),
      targetType,
      targetId,
      ...createCommentDto,
      createdAt: new Date().toISOString(),
      likeCount: 0,
    }
    this.comments.push(comment)
    return comment
  }

  update(id: string, updateCommentDto: UpdateCommentDto): Comment {
    const comment = this.findOne(id)
    Object.assign(comment, updateCommentDto)
    return comment
  }

  like(id: string): Comment {
    const comment = this.findOne(id)
    comment.likeCount += 1
    return comment
  }

  remove(id: string): void {
    this.findOne(id)
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
}
