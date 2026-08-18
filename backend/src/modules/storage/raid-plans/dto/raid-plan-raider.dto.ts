import { IsIn, IsInt, IsString, Length, Matches, Max, Min } from 'class-validator'
import { RAID_PLAN_CLASS_IDS, RAID_PLAN_ROLES, type RaidPlanClassId, type RaidPlanRole } from '../models/raid-plan.model'

export class RaidPlanRaiderDto {
  @IsString()
  @Length(1, 100)
  @Matches(/\S/, { message: 'raider id must contain visible text' })
  id!: string

  @IsString()
  @Length(1, 32)
  @Matches(/\S/, { message: 'raider name must contain visible text' })
  name!: string

  @IsIn(RAID_PLAN_CLASS_IDS)
  classId!: RaidPlanClassId

  @IsIn(RAID_PLAN_ROLES)
  role!: RaidPlanRole

  @IsInt()
  @Min(1)
  @Max(8)
  group!: number
}
