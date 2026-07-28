import { Injectable, Logger } from '@nestjs/common'
import type { Report } from '../models/report.model'
import { ReportsService } from '../reports.service'
import { TaskForgeClient } from './taskforge.client'

@Injectable()
export class TaskForgeUserReportDispatcher {
  private readonly logger = new Logger(TaskForgeUserReportDispatcher.name)

  constructor(
    private readonly reportsService: ReportsService,
    private readonly taskForgeClient: TaskForgeClient,
  ) {}

  dispatch(reportId: string): void {
    void this.dispatchNow(reportId).catch((error: unknown) => {
      this.logger.error(
        `Unexpected TaskForge dispatch failure for WOW-${reportId}`,
        error instanceof Error ? error.stack : undefined,
      )
    })
  }

  async dispatchNow(reportId: string): Promise<Report> {
    const report = this.reportsService.findOne(reportId)
    if (report.taskForgeJobId) return report

    try {
      const job = await this.taskForgeClient.submitUserReport(report)
      return this.reportsService.markTaskForgeSubmitted(
        report.id,
        job.id,
        job.status,
      )
    } catch (error) {
      const message = getErrorMessage(error)
      this.logger.warn(`Could not submit WOW-${report.id} to TaskForge: ${message}`)
      return this.reportsService.markTaskForgeSubmissionFailed(report.id, message)
    }
  }
}

function getErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown TaskForge submission error'
  return message.slice(0, 500)
}
