import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../common/database/database.service'
import { SqliteRepository } from '../../common/repositories/sqlite.repository'
import { CommentsService } from '../comments/comments.service'
import { CreateCommunityEntryDto } from './dto/create-community-entry.dto'
import { UpdateCommunityEntryDto } from './dto/update-community-entry.dto'
import { CommunityEntry } from './models/community-entry.model'
import { COMMUNITY_ENTRIES } from './seeds/community-entries.seed'

@Injectable()
export class CommunityService {
  private readonly repository: SqliteRepository<CommunityEntry>

  constructor(
    database: DatabaseService,
    private readonly commentsService: CommentsService,
  ) {
    this.repository = new SqliteRepository(
      database,
      'community',
      COMMUNITY_ENTRIES,
      'Community entry',
    )
  }

  findAll(): Array<CommunityEntry & { commentCount: number }> {
    return this.repository.findAll().map((entry) => this.withCommentCount(entry))
  }

  findOne(id: string, countView = false): CommunityEntry & { commentCount: number } {
    let entry = this.repository.findOne(id)
    if (countView) entry = this.repository.update(id, { viewerCount: entry.viewerCount + 1 })
    return this.withCommentCount(entry)
  }

  create(createCommunityEntryDto: CreateCommunityEntryDto & { author: string; publishedAt: string }): CommunityEntry {
    const entry = this.repository.create({ ...createCommunityEntryDto, viewerCount: 0 })
    return this.withCommentCount(entry)
  }

  update(id: string, updateCommunityEntryDto: UpdateCommunityEntryDto): CommunityEntry {
    const updatedEntry = this.repository.update(id, updateCommunityEntryDto)
    return this.withCommentCount(updatedEntry)
  }

  remove(id: string): void {
    this.repository.remove(id)
    this.commentsService.removeForTarget('community', id)
  }

  private withCommentCount(
    entry: CommunityEntry,
  ): CommunityEntry & { commentCount: number } {
    return {
      ...entry,
      commentCount: this.commentsService.countForTarget('community', entry.id),
    }
  }
}
