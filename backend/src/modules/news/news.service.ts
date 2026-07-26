import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../common/database/database.service'
import { SqliteRepository } from '../../common/repositories/sqlite.repository'
import { CreateNewsDto } from './dto/create-news.dto'
import { UpdateNewsDto } from './dto/update-news.dto'
import { News } from './models/news.model'
import { NEWS } from './seeds/news.seed'

@Injectable()
export class NewsService {
  private readonly repository: SqliteRepository<News>

  constructor(database: DatabaseService) {
    this.repository = new SqliteRepository(database, 'news', NEWS, 'News item')
  }

  findAll(): News[] {
    return this.repository.findAll()
  }

  findOne(id: string): News {
    return this.repository.findOne(id)
  }

  create(createNewsDto: CreateNewsDto & { author: string; updatedAt: string }): News {
    return this.repository.create({ ...createNewsDto, likeCount: 0 })
  }

  setLiked(id: string, liked: boolean): News {
    const newsItem = this.repository.findOne(id)
    const likeCount = Math.max(0, (newsItem.likeCount ?? 0) + (liked ? 1 : -1))
    return this.repository.update(id, { likeCount })
  }

  update(id: string, updateNewsDto: UpdateNewsDto & { updatedAt: string }): News {
    return this.repository.update(id, updateNewsDto)
  }

  remove(id: string): void {
    this.repository.remove(id)
  }
}
