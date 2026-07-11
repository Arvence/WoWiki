import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  author?: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content?: string
}
