import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CharactersModule } from './modules/characters/characters.module'
import { CommentsModule } from './modules/comments/comments.module'
import { CommunityModule } from './modules/community/community.module'
import { NewsModule } from './modules/news/news.module'

@Module({
  imports: [CharactersModule, CommentsModule, NewsModule, CommunityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
