import { Module } from '@nestjs/common'
import { RaidsController } from './raids.controller'
import { RaidsService } from './raids.service'
@Module({ controllers: [RaidsController], providers: [RaidsService] })
export class RaidsModule {}
