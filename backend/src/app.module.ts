import { Module } from '@nestjs/common'
import { CharactersModule } from './modules/game-data/characters/characters.module'
import { FactionsModule } from './modules/game-data/factions/factions.module'
import { CommentsModule } from './modules/comments/comments.module'
import { CommunityModule } from './modules/community/community.module'
import { NewsModule } from './modules/news/news.module'
import { TalentsModule } from './modules/game-data/talents/talents.module'
import { ClassesModule } from './modules/game-data/classes/classes.module'
import { DungeonsModule } from './modules/game-data/dungeons/dungeons.module'
import { RaidsModule } from './modules/game-data/raids/raids.module'
import { ItemsModule } from './modules/game-data/items/items.module'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    AuthModule,
    CharactersModule,
    FactionsModule,
    ClassesModule,
    DungeonsModule,
    RaidsModule,
    ItemsModule,
    CommentsModule,
    NewsModule,
    CommunityModule,
    TalentsModule,
  ],
})
export class AppModule {}
