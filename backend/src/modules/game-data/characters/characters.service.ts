import { BadRequestException, Injectable } from '@nestjs/common'
import { DatabaseService } from '../../../common/database/database.service'
import { SqliteRepository } from '../../../common/repositories/sqlite.repository'
import { CreateCharacterDto } from './dto/create-character.dto'
import { UpdateCharacterDto } from './dto/update-character.dto'
import { Character } from './models/character.model'
import { CHARACTERS } from './seeds/characters.seed'
import { ClassesService } from '../classes/classes.service'
import { GameClass } from '../classes/models/class.model'
import { FactionsService } from '../factions/factions.service'
import { Faction } from '../factions/models/faction.model'

export type CharacterDetails = Character & {
  class: GameClass
  faction: Faction
}

@Injectable()
export class CharactersService {
  private readonly repository: SqliteRepository<Character>

  constructor(
    database: DatabaseService,
    private readonly classesService: ClassesService,
    private readonly factionsService: FactionsService,
  ) {
    this.repository = new SqliteRepository(database, 'characters', CHARACTERS, 'Character')
  }

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
    if (!this.classesService.findAll().some((gameClass) => gameClass.id === classId)) {
      throw new BadRequestException(`Class with id ${classId} not found`)
    }
    if (!this.factionsService.findAll().some((faction) => faction.id === factionId)) {
      throw new BadRequestException(`Faction with id ${factionId} not found`)
    }
  }

  private resolveRelations(character: Character): CharacterDetails {
    const gameClass = this.classesService.findAll().find((item) => item.id === character.classId)
    const faction = this.factionsService.findAll().find((item) => item.id === character.factionId)
    if (!gameClass || !faction) throw new Error(`Character ${character.id} has invalid game-data relationships`)
    return { ...character, class: gameClass, faction }
  }
}
