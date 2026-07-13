import { IsObject } from 'class-validator'

export class ValidateTalentBuildDto {
  @IsObject()
  ranks!: Record<string, number>
}
