import { Module } from '@nestjs/common'
import { CharactersModule } from './modules/characters/characters.module'
import { CommentsModule } from './modules/comments/comments.module'
import { CommunityModule } from './modules/community/community.module'
import { NewsModule } from './modules/news/news.module'
import { TalentsModule } from './modules/talents/talents.module'

@Module({
  imports: [CharactersModule, CommentsModule, NewsModule, CommunityModule, TalentsModule],
})
export class AppModule {}
