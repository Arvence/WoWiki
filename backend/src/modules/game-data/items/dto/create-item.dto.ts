import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator'
import { ITEM_QUALITIES, ItemQuality } from '../models/item.model'
export class CreateItemDto {
  @IsString() @IsNotEmpty() name!: string
  @IsIn(ITEM_QUALITIES) quality!: ItemQuality
  @IsString() @IsNotEmpty() type!: string
  @IsInt() @Min(1) itemLevel!: number
  @IsInt() @Min(0) requiredLevel!: number
  @IsString() @IsNotEmpty() source!: string
  @IsString() @IsNotEmpty() description!: string
}
