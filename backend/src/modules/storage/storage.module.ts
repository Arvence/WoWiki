import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { BookmarksController } from './bookmarks/bookmarks.controller'
import { BookmarksService } from './bookmarks/bookmarks.service'
import { RaidPlansController } from './raid-plans/raid-plans.controller'
import { RaidPlansService } from './raid-plans/raid-plans.service'

@Module({
  controllers: [BookmarksController, RaidPlansController],
  imports: [AuthModule],
  providers: [BookmarksService, RaidPlansService],
})
export class StorageModule {}
