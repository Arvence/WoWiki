import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

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
  content!: string

  @IsString()
  @IsNotEmpty()
  category!: string

  @IsString()
  @IsNotEmpty()
  publishedAt!: string

  @IsString()
  @IsOptional()
  newsId?: string

  @IsString()
  @IsOptional()
  image?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hashtags?: string[]

}
