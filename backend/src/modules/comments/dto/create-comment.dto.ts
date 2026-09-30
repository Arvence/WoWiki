import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator'

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 5000)
  @Matches(/\S/, { message: 'content must contain visible text' })
  content!: string

  @IsString()
  @IsOptional()
  @Length(1, 100)
  @Matches(/\S/, { message: 'parentId must contain visible text' })
  parentId?: string
}
