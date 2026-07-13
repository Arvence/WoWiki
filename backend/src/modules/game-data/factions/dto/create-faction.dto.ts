import { ArrayNotEmpty, IsArray, IsIn, IsNotEmpty, IsString } from 'class-validator'
import { FACTION_ALIGNMENTS, FactionAlignment } from '../models/faction.model'

export class CreateFactionDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsIn(FACTION_ALIGNMENTS)
  alignment!: FactionAlignment

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  races!: string[]

  @IsString()
  @IsNotEmpty()
  headquarters!: string

  @IsString()
  @IsNotEmpty()
  description!: string
}
