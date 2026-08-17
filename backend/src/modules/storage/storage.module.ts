import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { BookmarksController } from './bookmarks/bookmarks.controller'
import { BookmarksService } from './bookmarks/bookmarks.service'

@Module({
  controllers: [BookmarksController],
  imports: [AuthModule],
  providers: [BookmarksService],
})
export class StorageModule {}
