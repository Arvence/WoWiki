import { BadRequestException, Injectable } from '@nestjs/common'
import { InMemoryRepository } from '../../../common/repositories/in-memory.repository'
import { CreateCharacterDto } from './dto/create-character.dto'
import { UpdateCharacterDto } from './dto/update-character.dto'
import { Character } from './models/character.model'
import { CHARACTERS } from './seeds/characters.seed'
import { CLASSES } from '../classes/seeds/classes.seed'
import { GameClass } from '../classes/models/class.model'
import { FACTIONS } from '../factions/seeds/factions.seed'
import { Faction } from '../factions/models/faction.model'

export type CharacterDetails = Character & {
  class: GameClass
  faction: Faction
}

@Injectable()
export class CharactersService {
  private readonly repository = new InMemoryRepository(CHARACTERS, 'Character')

  findAll(): CharacterDetails[] {
    return this.repository.findAll().map((character) => this.resolveRelations(character))
  }

  findOne(id: string): CharacterDetails {
    return this.resolveRelations(this.repository.findOne(id))
  }

  create(createCharacterDto: CreateCharacterDto): CharacterDetails {
    this.validateRelations(createCharacterDto.classId, createCharacterDto.factionId)
    return this.resolveRelations(this.repository.create(createCharacterDto))
  }

  update(id: string, updateCharacterDto: UpdateCharacterDto): CharacterDetails {
    const current = this.repository.findOne(id)
    this.validateRelations(updateCharacterDto.classId ?? current.classId, updateCharacterDto.factionId ?? current.factionId)
    return this.resolveRelations(this.repository.update(id, updateCharacterDto))
  }

  remove(id: string): void {
    this.repository.remove(id)
  }

  private validateRelations(classId: string, factionId: string): void {
    if (!CLASSES.some((gameClass) => gameClass.id === classId)) {
      throw new BadRequestException(`Class with id ${classId} not found`)
    }
    if (!FACTIONS.some((faction) => faction.id === factionId)) {
      throw new BadRequestException(`Faction with id ${factionId} not found`)
    }
  }

  private resolveRelations(character: Character): CharacterDetails {
    const gameClass = CLASSES.find((item) => item.id === character.classId)
    const faction = FACTIONS.find((item) => item.id === character.factionId)
    if (!gameClass || !faction) throw new Error(`Character ${character.id} has invalid game-data relationships`)
    return { ...character, class: gameClass, faction }
  }
}
