import { Module } from '@nestjs/common'
import { ReportsController } from './reports.controller'
import { ReportsService } from './reports.service'
import { TaskForgeUserReportsController } from './taskforge-user-reports.controller'
import { TaskForgeClient } from './taskforge/taskforge.client'
import { TaskForgeUserReportDispatcher } from './taskforge/taskforge-user-report.dispatcher'

@Module({
  controllers: [ReportsController, TaskForgeUserReportsController],
  providers: [ReportsService, TaskForgeClient, TaskForgeUserReportDispatcher],
})
export class ReportsModule {}
