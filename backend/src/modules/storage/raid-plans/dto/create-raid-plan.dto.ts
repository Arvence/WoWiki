import { Type } from 'class-transformer'
import { ArrayMaxSize, IsArray, IsInt, IsISO8601, IsOptional, IsString, Length, Matches, Max, MaxLength, Min, ValidateNested } from 'class-validator'
import { RaidPlanRaiderDto } from './raid-plan-raider.dto'

export class CreateRaidPlanDto {
  @IsString()
  @Length(1, 100)
  @Matches(/\S/, { message: 'raidId must contain visible text' })
  raidId!: string

  @IsISO8601({ strict: true })
  @Matches(/Z$/, { message: 'scheduledAtUtc must be a UTC datetime ending in Z' })
  scheduledAtUtc!: string

  @IsInt()
  @Min(1)
  @Max(40)
  raidSize!: number

  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string

  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => RaidPlanRaiderDto)
  @IsOptional()
  raiders?: RaidPlanRaiderDto[]
}
