import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator'

export class CreateCommunityEntryDto {
  @IsString()
  @IsNotEmpty()
  author!: string

  @IsString()
  @IsNotEmpty()
  title!: string

  @IsString()
  @IsNotEmpty()
  excerpt!: string

  @IsString()
  @IsNotEmpty()
  category!: string

  @IsString()
  @IsNotEmpty()
  publishedAt!: string

  @IsInt()
  @Min(0)
  comments!: number
}
