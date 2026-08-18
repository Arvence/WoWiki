export class RaidPlan {
  id!: string
  userId!: string
  raidId!: string
  scheduledAtUtc!: string
  raidSize!: number
  notes!: string
  raiders!: RaidPlanRaider[]
  createdAtUtc!: string
  updatedAtUtc!: string
}

export const RAID_PLAN_CLASS_IDS = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid'] as const
export const RAID_PLAN_ROLES = ['tank', 'healer', 'damage'] as const

export type RaidPlanClassId = (typeof RAID_PLAN_CLASS_IDS)[number]
export type RaidPlanRole = (typeof RAID_PLAN_ROLES)[number]

export class RaidPlanRaider {
  id!: string
  name!: string
  classId!: RaidPlanClassId
  role!: RaidPlanRole
  group!: number
}
