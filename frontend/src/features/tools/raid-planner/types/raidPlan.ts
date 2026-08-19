export const RAID_SIZES = [10, 20, 25, 40] as const

export const RAID_OPTIONS = [
  'Molten Core',
  "Onyxia's Lair",
  'Blackwing Lair',
  "Zul'Gurub",
  'Ruins of Ahn\'Qiraj',
  "Temple of Ahn'Qiraj",
  'Naxxramas',
] as const

export const PLAYER_CLASSES = [
  { id: 'warrior', label: 'Warrior', color: 'border-amber-700/55 bg-amber-700/15 text-amber-300' },
  { id: 'paladin', label: 'Paladin', color: 'border-pink-400/55 bg-pink-400/10 text-pink-300' },
  { id: 'hunter', label: 'Hunter', color: 'border-lime-500/55 bg-lime-500/10 text-lime-300' },
  { id: 'rogue', label: 'Rogue', color: 'border-yellow-400/55 bg-yellow-400/10 text-yellow-200' },
  { id: 'priest', label: 'Priest', color: 'border-slate-300/55 bg-slate-200/10 text-slate-100' },
  { id: 'shaman', label: 'Shaman', color: 'border-blue-500/55 bg-blue-500/10 text-blue-300' },
  { id: 'mage', label: 'Mage', color: 'border-cyan-400/55 bg-cyan-400/10 text-cyan-200' },
  { id: 'warlock', label: 'Warlock', color: 'border-violet-500/55 bg-violet-500/10 text-violet-300' },
  { id: 'druid', label: 'Druid', color: 'border-orange-500/55 bg-orange-500/10 text-orange-300' },
] as const

export const RAID_ROLES = [
  { id: 'tank', label: 'Tank', color: 'bg-sky-400' },
  { id: 'healer', label: 'Healer', color: 'bg-emerald-400' },
  { id: 'damage', label: 'Damage', color: 'bg-red-400' },
] as const

export type PlayerClass = (typeof PLAYER_CLASSES)[number]['id']
export type RaiderRole = (typeof RAID_ROLES)[number]['id']

export type Raider = {
  id: string
  name: string
  playerClass: PlayerClass
  role: RaiderRole
  group: number
}

export type RaidPlan = {
  version: 1
  id: string | null
  raid: string
  date: string
  startTime: string
  raidSize: number
  notes: string
  raiders: Raider[]
  updatedAt: string | null
}

export type ApiRaidPlanRaider = {
  id: string
  name: string
  classId: PlayerClass
  role: RaiderRole
  group: number
}

export type ApiRaidPlan = {
  id: string
  userId: string
  raidId: string
  scheduledAtUtc: string
  raidSize: number
  notes: string
  raiders: ApiRaidPlanRaider[]
  createdAtUtc: string
  updatedAtUtc: string
}

export type RaidPlanWriteInput = Pick<ApiRaidPlan, 'raidId' | 'scheduledAtUtc' | 'raidSize' | 'notes' | 'raiders'>

export function emptyRaidPlan(): RaidPlan {
  return {
    version: 1,
    id: null,
    raid: '',
    date: '',
    startTime: '19:00',
    raidSize: 40,
    notes: '',
    raiders: [],
    updatedAt: null,
  }
}

export function createRaidPlanId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function normalizeRaidPlan(value: unknown): RaidPlan | null {
  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  const raidSize = typeof record.raidSize === 'number' && RAID_SIZES.includes(record.raidSize as (typeof RAID_SIZES)[number])
    ? record.raidSize
    : 40
  const groupCount = Math.ceil(raidSize / 5)
  const validClassIds = new Set<string>(PLAYER_CLASSES.map((playerClass) => playerClass.id))
  const validRoleIds = new Set<string>(RAID_ROLES.map((role) => role.id))
  const raiders = Array.isArray(record.raiders)
    ? record.raiders.slice(0, raidSize).flatMap((entry): Raider[] => {
        if (!entry || typeof entry !== 'object') return []
        const raider = entry as Record<string, unknown>
        if (typeof raider.name !== 'string' || !raider.name.trim()) return []
        if (typeof raider.playerClass !== 'string' || !validClassIds.has(raider.playerClass)) return []
        if (typeof raider.role !== 'string' || !validRoleIds.has(raider.role)) return []
        const group = typeof raider.group === 'number'
          ? Math.min(groupCount, Math.max(1, Math.round(raider.group)))
          : 1

        return [{
          id: typeof raider.id === 'string' && raider.id.trim() ? raider.id.trim() : createRaidPlanId(),
          name: raider.name.trim().slice(0, 32),
          playerClass: raider.playerClass as PlayerClass,
          role: raider.role as RaiderRole,
          group,
        }]
      })
    : []

  return {
    version: 1,
    id: typeof record.id === 'string' ? record.id : null,
    raid: typeof record.raid === 'string' ? record.raid.slice(0, 100) : '',
    date: typeof record.date === 'string' ? record.date : '',
    startTime: typeof record.startTime === 'string' ? record.startTime : '19:00',
    raidSize,
    notes: typeof record.notes === 'string' ? record.notes.slice(0, 500) : '',
    raiders,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : null,
  }
}

export function raidPlanFromApi(raidPlan: ApiRaidPlan): RaidPlan {
  const scheduledAt = new Date(raidPlan.scheduledAtUtc)
  if (Number.isNaN(scheduledAt.getTime())) throw new Error('Raid plan has an invalid scheduled date')

  return {
    version: 1,
    id: raidPlan.id,
    raid: raidPlan.raidId,
    date: formatLocalDate(scheduledAt),
    startTime: `${twoDigits(scheduledAt.getHours())}:${twoDigits(scheduledAt.getMinutes())}`,
    raidSize: raidPlan.raidSize,
    notes: raidPlan.notes,
    raiders: raidPlan.raiders.map((raider) => ({
      id: raider.id,
      name: raider.name,
      playerClass: raider.classId,
      role: raider.role,
      group: raider.group,
    })),
    updatedAt: raidPlan.updatedAtUtc,
  }
}

export function raidPlanToApiInput(raidPlan: RaidPlan): RaidPlanWriteInput {
  const scheduledAt = new Date(`${raidPlan.date}T${raidPlan.startTime}:00`)
  if (Number.isNaN(scheduledAt.getTime())) throw new Error('Choose a valid raid date and start time')

  return {
    raidId: raidPlan.raid.trim(),
    scheduledAtUtc: scheduledAt.toISOString(),
    raidSize: raidPlan.raidSize,
    notes: raidPlan.notes.trim(),
    raiders: raidPlan.raiders.map((raider) => ({
      id: raider.id,
      name: raider.name,
      classId: raider.playerClass,
      role: raider.role,
      group: raider.group,
    })),
  }
}

export function sortRaidPlans(raidPlans: RaidPlan[]): RaidPlan[] {
  return [...raidPlans].sort((first, second) => Date.parse(second.updatedAt ?? '') - Date.parse(first.updatedAt ?? ''))
}

function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`
}

function twoDigits(value: number): string {
  return String(value).padStart(2, '0')
}
