import { Module } from '@nestjs/common'
import { CharactersModule } from './modules/game-data/characters/characters.module'
import { FactionsModule } from './modules/game-data/factions/factions.module'
import { CommentsModule } from './modules/comments/comments.module'
import { CommunityModule } from './modules/community/community.module'
import { NewsModule } from './modules/news/news.module'
import { TalentsModule } from './modules/game-data/talents/talents.module'

@Module({
  imports: [CharactersModule, FactionsModule, CommentsModule, NewsModule, CommunityModule, TalentsModule],
})
export class AppModule {}
