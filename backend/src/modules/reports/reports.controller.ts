import { Body, Controller, Post } from '@nestjs/common'
import { CreateReportDto } from './dto/create-report.dto'
import { ReportsService } from './reports.service'

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto)
  }
}
