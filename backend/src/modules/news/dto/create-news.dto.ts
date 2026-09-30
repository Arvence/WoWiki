import { IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator'
import { IsImageUrl } from '../../../common/validators/is-image-url.decorator'

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 160)
  @Matches(/\S/, { message: 'title must contain visible text' })
  title!: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  @Matches(/\S/, { message: 'summary must contain visible text' })
  summary!: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 50000)
  @Matches(/\S/, { message: 'content must contain visible text' })
  content!: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 80)
  @Matches(/\S/, { message: 'category must contain visible text' })
  category!: string

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  @IsImageUrl({ message: 'imageUrl must be an HTTP(S) URL or a local /images path' })
  imageUrl?: string
}
