import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateCharacterDto } from './dto/create-character.dto'
import { UpdateCharacterDto } from './dto/update-character.dto'
import { Character } from './models/character.model'
import { CHARACTERS } from './seeds/characters.seed'

@Injectable()
export class CharactersService {
  private characters: Character[] = [...CHARACTERS]
  private nextId = this.characters.length + 1

  findAll(): Character[] {
    return this.characters
  }

  findOne(id: string): Character {
    const character = this.characters.find((item) => item.id === id)
    if (!character) {
      throw new NotFoundException(`Character with id ${id} not found`)
    }
    return character
  }

  create(createCharacterDto: CreateCharacterDto): Character {
    const character: Character = {
      id: String(this.nextId++),
      ...createCharacterDto,
    }
    this.characters.push(character)
    return character
  }

  update(id: string, updateCharacterDto: UpdateCharacterDto): Character {
    const index = this.characters.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new NotFoundException(`Character with id ${id} not found`)
    }

    const updatedCharacter = {
      ...this.characters[index],
      ...updateCharacterDto,
    }
    this.characters[index] = updatedCharacter
    return updatedCharacter
  }

  remove(id: string): void {
    const index = this.characters.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new NotFoundException(`Character with id ${id} not found`)
    }
    this.characters.splice(index, 1)
  }
}
