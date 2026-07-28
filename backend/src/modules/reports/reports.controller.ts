import { Body, Controller, Post } from '@nestjs/common'
import { CreateReportDto } from './dto/create-report.dto'
import { ReportsService } from './reports.service'
import { TaskForgeUserReportDispatcher } from './taskforge/taskforge-user-report.dispatcher'

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly taskForgeDispatcher: TaskForgeUserReportDispatcher,
  ) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    const report = this.reportsService.create(createReportDto)
    this.taskForgeDispatcher.dispatch(report.id)
    return report
  }
}
