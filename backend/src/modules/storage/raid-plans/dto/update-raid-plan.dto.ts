import { PartialType } from '@nestjs/mapped-types'
import { CreateRaidPlanDto } from './create-raid-plan.dto'

export class UpdateRaidPlanDto extends PartialType(CreateRaidPlanDto) {}
