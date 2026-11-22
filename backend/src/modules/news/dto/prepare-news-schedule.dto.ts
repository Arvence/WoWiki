import { IsBoolean, Matches, ValidateIf } from 'class-validator'

export class PrepareNewsScheduleDto {
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, { message: 'Choose a date and time in EU (CET/CEST)' })
  scheduledAtLocal!: string

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  enforcePublicationDeadline?: boolean
}
