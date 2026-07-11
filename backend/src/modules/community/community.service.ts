import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateCommunityEntryDto } from './dto/create-community-entry.dto'
import { UpdateCommunityEntryDto } from './dto/update-community-entry.dto'
import { CommunityEntry } from './models/community-entry.model'
import { COMMUNITY_ENTRIES } from './seeds/community-entries.seed'

@Injectable()
export class CommunityService {
  private entries: CommunityEntry[] = [...COMMUNITY_ENTRIES]
  private nextId = this.entries.length + 1

  findAll(): CommunityEntry[] {
    return this.entries
  }

  findOne(id: string): CommunityEntry {
    const entry = this.entries.find((item) => item.id === id)
    if (!entry) {
      throw new NotFoundException(`Community entry with id ${id} not found`)
    }
    return entry
  }

  create(createCommunityEntryDto: CreateCommunityEntryDto): CommunityEntry {
    const entry: CommunityEntry = {
      id: String(this.nextId++),
      ...createCommunityEntryDto,
    }
    this.entries.push(entry)
    return entry
  }

  update(id: string, updateCommunityEntryDto: UpdateCommunityEntryDto): CommunityEntry {
    const index = this.entries.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new NotFoundException(`Community entry with id ${id} not found`)
    }

    const updatedEntry = { ...this.entries[index], ...updateCommunityEntryDto }
    this.entries[index] = updatedEntry
    return updatedEntry
  }

  remove(id: string): void {
    const index = this.entries.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new NotFoundException(`Community entry with id ${id} not found`)
    }
    this.entries.splice(index, 1)
  }
}
