import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title!: string

  @IsString()
  @IsNotEmpty()
  summary!: string

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsString()
  @IsNotEmpty()
  category!: string

  @IsString()
  @IsOptional()
  imageUrl?: string

}
