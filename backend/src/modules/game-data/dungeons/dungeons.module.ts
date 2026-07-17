import { Module } from '@nestjs/common'
import { DungeonsController } from './dungeons.controller'
import { DungeonsService } from './dungeons.service'
@Module({ controllers: [DungeonsController], providers: [DungeonsService] })
export class DungeonsModule {}
