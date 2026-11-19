export const REPORT_TYPES = [
  'incorrect-content',
  'missing-content',
  'outdated-content',
  'broken-link',
  'other',
] as const
export const REPORT_TARGET_TYPES = [
  'news',
  'community',
  'character',
  'class',
  'dungeon',
  'raid',
  'item',
  'guide',
] as const

export type ReportType = (typeof REPORT_TYPES)[number]
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number]
export type ReportStatus = 'pending' | 'ready-for-review'

export class Report {
  id!: string
  type!: ReportType
  title!: string
  description!: string
  pagePath!: string
  targetType?: ReportTargetType
  targetId?: string
  targetTitle?: string
  status!: ReportStatus
  createdAt!: string
}
