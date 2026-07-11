import { Injectable, NotFoundException } from '@nestjs/common'
import { CommentsService } from '../comments/comments.service'
import { CreateCommunityEntryDto } from './dto/create-community-entry.dto'
import { UpdateCommunityEntryDto } from './dto/update-community-entry.dto'
import { CommunityEntry } from './models/community-entry.model'
import { COMMUNITY_ENTRIES } from './seeds/community-entries.seed'

@Injectable()
export class CommunityService {
  private entries: CommunityEntry[] = [...COMMUNITY_ENTRIES]
  private nextId = this.entries.length + 1

  constructor(private readonly commentsService: CommentsService) {}

  findAll(): Array<CommunityEntry & { commentCount: number }> {
    return this.entries.map((entry) => this.withCommentCount(entry))
  }

  findOne(id: string): CommunityEntry & { commentCount: number } {
    const entry = this.entries.find((item) => item.id === id)
    if (!entry) {
      throw new NotFoundException(`Community entry with id ${id} not found`)
    }
    return this.withCommentCount(entry)
  }

  create(createCommunityEntryDto: CreateCommunityEntryDto): CommunityEntry {
    const entry: CommunityEntry = {
      id: String(this.nextId++),
      ...createCommunityEntryDto,
    }
    this.entries.push(entry)
    return this.withCommentCount(entry)
  }

  update(id: string, updateCommunityEntryDto: UpdateCommunityEntryDto): CommunityEntry {
    const index = this.entries.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new NotFoundException(`Community entry with id ${id} not found`)
    }

    const updatedEntry = { ...this.entries[index], ...updateCommunityEntryDto }
    this.entries[index] = updatedEntry
    return this.withCommentCount(updatedEntry)
  }

  remove(id: string): void {
    const index = this.entries.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new NotFoundException(`Community entry with id ${id} not found`)
    }
    this.entries.splice(index, 1)
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
