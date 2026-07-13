import { Injectable } from '@nestjs/common'
import { InMemoryRepository } from '../../../common/repositories/in-memory.repository'
import { CreateFactionDto } from './dto/create-faction.dto'
import { UpdateFactionDto } from './dto/update-faction.dto'
import { Faction } from './models/faction.model'
import { FACTIONS } from './seeds/factions.seed'

@Injectable()
export class FactionsService {
  private readonly repository = new InMemoryRepository(FACTIONS, 'Faction')

  findAll(): Faction[] {
    return this.repository.findAll()
  }

  findOne(id: string): Faction {
    return this.repository.findOne(id)
  }

  create(input: CreateFactionDto): Faction {
    return this.repository.create(input)
  }

  update(id: string, input: UpdateFactionDto): Faction {
    return this.repository.update(id, input)
  }

  remove(id: string): void {
    this.repository.remove(id)
  }
}
