import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator'
export class CreateDungeonDto {
  @IsString() @IsNotEmpty() name!: string
  @IsString() @IsNotEmpty() location!: string
  @IsString() @IsNotEmpty() levelRange!: string
  @IsInt() @IsPositive() playerLimit!: number
  @IsArray() @ArrayNotEmpty() @IsString({ each: true }) bosses!: string[]
  @IsString() @IsNotEmpty() description!: string
}
