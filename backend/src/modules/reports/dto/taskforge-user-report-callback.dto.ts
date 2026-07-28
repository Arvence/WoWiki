import { IsString, Matches } from 'class-validator'

export class TaskForgeUserReportCallbackDto {
  @IsString()
  @Matches(/^WOW-[1-9]\d*$/, { message: 'externalReference must be a WoWiki report reference' })
  externalReference!: string
}
