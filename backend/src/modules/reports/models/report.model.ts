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
export const TASK_FORGE_SUBMISSION_STATUSES = ['pending', 'submitted', 'failed'] as const

export type ReportType = (typeof REPORT_TYPES)[number]
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number]
export type ReportStatus = 'pending' | 'ready-for-review'
export type TaskForgeSubmissionStatus = (typeof TASK_FORGE_SUBMISSION_STATUSES)[number]

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
  taskForgeSubmissionStatus!: TaskForgeSubmissionStatus
  taskForgeSubmissionAttempts!: number
  taskForgeJobId?: string
  taskForgeJobStatus?: string
  taskForgeLastSubmissionAt?: string
  taskForgeSubmissionError?: string
}
