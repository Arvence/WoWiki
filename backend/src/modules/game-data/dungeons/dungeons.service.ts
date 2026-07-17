import { Injectable } from '@nestjs/common'
import { InMemoryRepository } from '../../../common/repositories/in-memory.repository'
import { CreateDungeonDto } from './dto/create-dungeon.dto'
import { UpdateDungeonDto } from './dto/update-dungeon.dto'
import { Dungeon } from './models/dungeon.model'
import { DUNGEONS } from './seeds/dungeons.seed'
@Injectable()
export class DungeonsService {
  private readonly repository = new InMemoryRepository(DUNGEONS, 'Dungeon')
  findAll(): Dungeon[] { return this.repository.findAll() }
  findOne(id: string): Dungeon { return this.repository.findOne(id) }
  create(input: CreateDungeonDto): Dungeon { return this.repository.create(input) }
  update(id: string, input: UpdateDungeonDto): Dungeon { return this.repository.update(id, input) }
  remove(id: string): void { this.repository.remove(id) }
}
