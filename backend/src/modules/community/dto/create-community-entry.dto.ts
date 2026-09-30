import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator'
import { IsImageUrl } from '../../../common/validators/is-image-url.decorator'

export class CreateCommunityEntryDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 160)
  @Matches(/\S/, { message: 'title must contain visible text' })
  title!: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  @Matches(/\S/, { message: 'excerpt must contain visible text' })
  excerpt!: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 30000)
  @Matches(/\S/, { message: 'content must contain visible text' })
  content!: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 80)
  @Matches(/\S/, { message: 'category must contain visible text' })
  category!: string

  @IsString()
  @IsOptional()
  @Length(1, 100)
  @Matches(/\S/, { message: 'newsId must contain visible text' })
  newsId?: string

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  @IsImageUrl({ message: 'image must be an HTTP(S) URL or a local /images path' })
  image?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @Length(1, 32, { each: true })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, {
    each: true,
    message: 'hashtags must contain only letters, numbers, and single hyphens',
  })
  hashtags?: string[]
}
