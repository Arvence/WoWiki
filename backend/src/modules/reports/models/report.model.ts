export const REPORT_TYPES = ['bug', 'content', 'broken-link', 'other'] as const
export const REPORT_TARGET_TYPES = ['news', 'community'] as const

export type ReportType = (typeof REPORT_TYPES)[number]
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number]
export type ReportStatus = 'pending'

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
  taskForgeId?: string
}
