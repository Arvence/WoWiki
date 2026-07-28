import { BadRequestException, Injectable } from '@nestjs/common'
import { DatabaseService } from '../../common/database/database.service'
import { SqliteRepository } from '../../common/repositories/sqlite.repository'
import { CreateReportDto } from './dto/create-report.dto'
import { Report } from './models/report.model'

@Injectable()
export class ReportsService {
  private readonly repository: SqliteRepository<Report>

  constructor(database: DatabaseService) {
    this.repository = new SqliteRepository(database, 'reports', [], 'Report')
  }

  create(createReportDto: CreateReportDto): Report {
    return this.repository.create({
      ...createReportDto,
      status: 'pending',
      createdAt: new Date().toISOString(),
      taskForgeSubmissionStatus: 'pending',
      taskForgeSubmissionAttempts: 0,
    })
  }

  findOne(reportId: string): Report {
    return this.repository.findOne(reportId)
  }

  findAwaitingTaskForgeSubmission(maxAttempts = 3): Report[] {
    return this.repository.findAll().filter(
      (report) => (
        !report.taskForgeJobId
        && report.taskForgeSubmissionStatus !== 'submitted'
        && (report.taskForgeSubmissionAttempts ?? 0) < maxAttempts
      ),
    )
  }

  markTaskForgeSubmitted(
    reportId: string,
    taskForgeJobId: string,
    taskForgeJobStatus: string,
  ): Report {
    const report = this.repository.findOne(reportId)
    const attemptedAt = new Date().toISOString()

    return this.repository.update(reportId, {
      taskForgeSubmissionStatus: 'submitted',
      taskForgeSubmissionAttempts: (report.taskForgeSubmissionAttempts ?? 0) + 1,
      taskForgeJobId,
      taskForgeJobStatus,
      taskForgeLastSubmissionAt: attemptedAt,
      taskForgeSubmissionError: undefined,
    })
  }

  markTaskForgeSubmissionFailed(reportId: string, error: string): Report {
    const report = this.repository.findOne(reportId)
    const attemptedAt = new Date().toISOString()

    return this.repository.update(reportId, {
      taskForgeSubmissionStatus: 'failed',
      taskForgeSubmissionAttempts: (report.taskForgeSubmissionAttempts ?? 0) + 1,
      taskForgeLastSubmissionAt: attemptedAt,
      taskForgeSubmissionError: error,
    })
  }

  markReadyForReview(reportId: string, externalReference: string): Report {
    const report = this.repository.findOne(reportId)
    if (externalReference !== `WOW-${report.id}`) {
      throw new BadRequestException('Report reference does not match the requested report')
    }

    if (report.status === 'ready-for-review') return report
    return this.repository.update(reportId, { status: 'ready-for-review' })
  }
}
