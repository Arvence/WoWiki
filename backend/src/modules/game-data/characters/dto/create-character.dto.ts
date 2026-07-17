import { IsNotEmpty, IsString } from 'class-validator'

export class CreateCharacterDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsNotEmpty()
  race!: string

  @IsString()
  @IsNotEmpty()
  classId!: string

  @IsString()
  @IsNotEmpty()
  factionId!: string

  @IsString()
  @IsNotEmpty()
  description!: string
}
