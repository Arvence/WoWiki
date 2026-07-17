import { PartialType } from '@nestjs/mapped-types'
import { CreateDungeonDto } from './create-dungeon.dto'
export class UpdateDungeonDto extends PartialType(CreateDungeonDto) {}
