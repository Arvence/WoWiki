import { Injectable } from '@nestjs/common'
import { InMemoryRepository } from '../../../common/repositories/in-memory.repository'
import { CreateRaidDto } from './dto/create-raid.dto'
import { UpdateRaidDto } from './dto/update-raid.dto'
import { Raid } from './models/raid.model'
import { RAIDS } from './seeds/raids.seed'
@Injectable()
export class RaidsService {
  private readonly repository = new InMemoryRepository(RAIDS, 'Raid')
  findAll(): Raid[] { return this.repository.findAll() }
  findOne(id: string): Raid { return this.repository.findOne(id) }
  create(input: CreateRaidDto): Raid { return this.repository.create(input) }
  update(id: string, input: UpdateRaidDto): Raid { return this.repository.update(id, input) }
  remove(id: string): void { this.repository.remove(id) }
}
