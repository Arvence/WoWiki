import { Injectable } from '@nestjs/common'
import { InMemoryRepository } from '../../../common/repositories/in-memory.repository'
import { CreateItemDto } from './dto/create-item.dto'
import { UpdateItemDto } from './dto/update-item.dto'
import { Item } from './models/item.model'
import { ITEMS } from './seeds/items.seed'
@Injectable()
export class ItemsService {
  private readonly repository = new InMemoryRepository(ITEMS, 'Item')
  findAll(): Item[] { return this.repository.findAll() }
  findOne(id: string): Item { return this.repository.findOne(id) }
  create(input: CreateItemDto): Item { return this.repository.create(input) }
  update(id: string, input: UpdateItemDto): Item { return this.repository.update(id, input) }
  remove(id: string): void { this.repository.remove(id) }
}
