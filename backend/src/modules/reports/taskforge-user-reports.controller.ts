import { Body, Controller, Headers, NotFoundException, Param, Post } from '@nestjs/common'
import { TaskForgeUserReportCallbackDto } from './dto/taskforge-user-report-callback.dto'
import { ReportsService } from './reports.service'

@Controller('internal/taskforge/user-reports')
export class TaskForgeUserReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post(':reportId/ready')
  markReadyForReview(
    @Param('reportId') reportId: string,
    @Headers('x-taskforge-source') source: string | undefined,
    @Body() callback: TaskForgeUserReportCallbackDto,
  ) {
    if (source !== 'wowiki-user-reports') throw new NotFoundException()

    const report = this.reportsService.markReadyForReview(
      reportId,
      callback.externalReference,
    )
    return {
      externalReference: `WOW-${report.id}`,
      status: report.status,
    }
  }
}
