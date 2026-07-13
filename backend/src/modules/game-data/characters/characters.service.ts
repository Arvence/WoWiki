import { Injectable } from '@nestjs/common'
import { InMemoryRepository } from '../../../common/repositories/in-memory.repository'
import { CreateCharacterDto } from './dto/create-character.dto'
import { UpdateCharacterDto } from './dto/update-character.dto'
import { Character } from './models/character.model'
import { CHARACTERS } from './seeds/characters.seed'

@Injectable()
export class CharactersService {
  private readonly repository = new InMemoryRepository(CHARACTERS, 'Character')

  findAll(): Character[] {
    return this.repository.findAll()
  }

  findOne(id: string): Character {
    return this.repository.findOne(id)
  }

  create(createCharacterDto: CreateCharacterDto): Character {
    return this.repository.create(createCharacterDto)
  }

  update(id: string, updateCharacterDto: UpdateCharacterDto): Character {
    return this.repository.update(id, updateCharacterDto)
  }

  remove(id: string): void {
    this.repository.remove(id)
  }
}
