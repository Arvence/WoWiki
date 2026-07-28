import { http } from '../../../shared/api/http'

export type ReportType = 'incorrect-content' | 'missing-content' | 'outdated-content' | 'broken-link' | 'other'
export type ReportTargetType = 'news' | 'community' | 'character' | 'class' | 'dungeon' | 'raid' | 'item' | 'guide'

export type CreateReportInput = {
  type: ReportType
  title: string
  description: string
  pagePath: string
  targetType?: ReportTargetType
  targetId?: string
  targetTitle?: string
}

type CreatedReport = CreateReportInput & {
  id: string
  status: 'pending'
  createdAt: string
  taskForgeSubmissionStatus: 'pending' | 'submitted' | 'failed'
}

export async function createReport(input: CreateReportInput): Promise<CreatedReport> {
  return http.post<CreatedReport>('/api/reports', input, {
    errorMessage: 'Could not send your report. Please try again.',
  })
}
