import { PartialType } from '@nestjs/mapped-types'
import { CreateCommunityEntryDto } from './create-community-entry.dto'

export class UpdateCommunityEntryDto extends PartialType(CreateCommunityEntryDto) {}
