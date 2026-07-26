import { Controller, Get } from '@nestjs/common'
import { DatabaseService } from './common/database/database.service'

@Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  check() {
    return {
      status: 'healthy',
      service: 'wowiki-backend',
      database: this.database.isHealthy() ? 'connected' : 'unavailable',
      timestampUtc: new Date().toISOString(),
    }
  }
}
