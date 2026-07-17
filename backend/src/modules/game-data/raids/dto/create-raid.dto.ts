import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsPositive, IsString, Max, Min } from 'class-validator'
export class CreateRaidDto {
  @IsString() @IsNotEmpty() name!: string
  @IsString() @IsNotEmpty() location!: string
  @IsInt() @Min(1) @Max(60) level!: number
  @IsInt() @IsPositive() playerLimit!: number
  @IsArray() @ArrayNotEmpty() @IsString({ each: true }) bosses!: string[]
  @IsString() @IsNotEmpty() description!: string
}
