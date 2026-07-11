import { IsBoolean } from 'class-validator'

export class LikeNewsDto {
  @IsBoolean()
  liked!: boolean
}
