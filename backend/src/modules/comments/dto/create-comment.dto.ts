import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  author!: string

  @IsString()
  @IsNotEmpty()
  content!: string

  @IsString()
  @IsOptional()
  parentId?: string
}
