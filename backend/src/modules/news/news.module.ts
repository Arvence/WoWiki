import { Module } from '@nestjs/common'
import { NewsController } from './news.controller'
import { NewsService } from './news.service'
import { NewsSchedulingService } from './news-scheduling.service'
import { TaskForgeClient } from './taskforge.client'
import { TaskForgeWorker } from './taskforge.worker'

@Module({
  controllers: [NewsController],
  providers: [NewsService, NewsSchedulingService, TaskForgeClient, TaskForgeWorker],
})
export class NewsModule {}
