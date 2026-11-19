import { Injectable } from '@nestjs/common'
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
    })
  }
}
