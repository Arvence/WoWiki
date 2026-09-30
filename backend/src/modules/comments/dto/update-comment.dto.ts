import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator'

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Length(1, 100)
  @Matches(/\S/, { message: 'author must contain visible text' })
  author?: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Length(1, 5000)
  @Matches(/\S/, { message: 'content must contain visible text' })
  content?: string
}
