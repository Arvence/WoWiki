import { IsNotEmpty, IsString } from 'class-validator'

export class CreateCharacterDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  race: string

  @IsString()
  @IsNotEmpty()
  className: string

  @IsString()
  @IsNotEmpty()
  faction: string

  @IsString()
  @IsNotEmpty()
  description: string
}
