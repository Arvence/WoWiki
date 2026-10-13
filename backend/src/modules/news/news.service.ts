import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../common/database/database.service'
import { SqliteRepository } from '../../common/repositories/sqlite.repository'
import { ReactionRepository } from '../../common/repositories/reaction.repository'
import { CreateNewsDto } from './dto/create-news.dto'
import { UpdateNewsDto } from './dto/update-news.dto'
import { News } from './models/news.model'
import { NEWS } from './seeds/news.seed'

@Injectable()
export class NewsService {
  private readonly repository: SqliteRepository<News>
  private readonly reactions: ReactionRepository

  constructor(database: DatabaseService) {
    this.repository = new SqliteRepository(database, 'news', NEWS, 'News item')
    this.reactions = new ReactionRepository(database, 'news')
  }

  findAll(): News[] {
    return this.reactions.withCounts(this.repository.findAll())
  }

  findOne(id: string): News {
    return this.reactions.withCounts([this.repository.findOne(id)])[0]
  }

  create(createNewsDto: CreateNewsDto & { author: string; updatedAt: string }): News {
    return this.repository.create({ ...createNewsDto, likeCount: 0 })
  }

  getReaction(userId: string, id: string) {
    return this.reactions.getState(userId, id)
  }

  setLiked(userId: string, id: string, liked: boolean): News {
    this.reactions.setLiked(userId, id, liked)
    return this.findOne(id)
  }

  update(id: string, updateNewsDto: UpdateNewsDto & { updatedAt: string }): News {
    return this.reactions.withCounts([this.repository.update(id, updateNewsDto)])[0]
  }

  remove(id: string): void {
    this.repository.remove(id)
  }
}
