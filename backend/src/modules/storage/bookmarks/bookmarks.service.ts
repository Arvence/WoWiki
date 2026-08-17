import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../../common/database/database.service'
import { SqliteRepository } from '../../../common/repositories/sqlite.repository'
import { Bookmark, BookmarkTargetType } from './models/bookmark.model'

@Injectable()
export class BookmarksService {
  private readonly repository: SqliteRepository<Bookmark>

  constructor(database: DatabaseService) {
    this.repository = new SqliteRepository(database, 'bookmarks', [], 'Bookmark')
  }

  findAll(userId: string): Bookmark[] {
    return this.repository.findAll().filter((bookmark) => bookmark.userId === userId)
  }

  save(userId: string, targetType: BookmarkTargetType, targetId: string): Bookmark {
    const existingBookmark = this.find(userId, targetType, targetId)
    if (existingBookmark) return existingBookmark

    return this.repository.create({
      userId,
      targetType,
      targetId,
      createdAtUtc: new Date().toISOString(),
    })
  }

  remove(userId: string, targetType: BookmarkTargetType, targetId: string): void {
    const bookmark = this.find(userId, targetType, targetId)
    if (!bookmark) return
    this.repository.remove(bookmark.id)
  }

  private find(userId: string, targetType: BookmarkTargetType, targetId: string): Bookmark | undefined {
    return this.repository.findAll().find(
      (bookmark) => bookmark.userId === userId
        && bookmark.targetType === targetType
        && bookmark.targetId === targetId,
    )
  }
}
