import { PartialType } from '@nestjs/mapped-types'
import { CreateFactionDto } from './create-faction.dto'

export class UpdateFactionDto extends PartialType(CreateFactionDto) {}
