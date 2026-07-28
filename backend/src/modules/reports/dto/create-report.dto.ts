import { IsIn, IsOptional, IsString, Length, Matches } from 'class-validator'
import { REPORT_TARGET_TYPES, REPORT_TYPES, type ReportTargetType, type ReportType } from '../models/report.model'

export class CreateReportDto {
  @IsIn(REPORT_TYPES)
  type!: ReportType

  @IsString()
  @Length(5, 120)
  @Matches(/\S/, { message: 'title must contain visible text' })
  title!: string

  @IsString()
  @Length(20, 2000)
  @Matches(/\S/, { message: 'description must contain visible text' })
  description!: string

  @IsString()
  @Length(1, 500)
  @Matches(/^\/(?!\/)/, { message: 'pagePath must be a local application path' })
  pagePath!: string

  @IsIn(REPORT_TARGET_TYPES)
  @IsOptional()
  targetType?: ReportTargetType

  @IsString()
  @Length(1, 100)
  @IsOptional()
  targetId?: string

  @IsString()
  @Length(1, 200)
  @IsOptional()
  targetTitle?: string
}
