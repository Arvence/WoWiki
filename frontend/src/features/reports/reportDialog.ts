import type { ReportType, ReportTargetType } from './api/reportService'

export const REPORT_DIALOG_EVENT = 'wowiki:open-report-dialog'

export type ReportDialogRequest = {
  type?: ReportType
  title?: string
  pagePath?: string
  target?: {
    type: ReportTargetType
    id: string
    title: string
  }
}

export function openReportDialog(request: ReportDialogRequest): void {
  window.dispatchEvent(new CustomEvent<ReportDialogRequest>(REPORT_DIALOG_EVENT, {
    detail: request,
  }))
}
