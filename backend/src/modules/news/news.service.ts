import { Injectable } from '@nestjs/common'
import { InMemoryRepository } from '../../common/repositories/in-memory.repository'
import { CreateNewsDto } from './dto/create-news.dto'
import { UpdateNewsDto } from './dto/update-news.dto'
import { News } from './models/news.model'
import { NEWS } from './seeds/news.seed'

@Injectable()
export class NewsService {
  private readonly repository = new InMemoryRepository(NEWS, 'News item')

  findAll(): News[] {
    return this.repository.findAll()
  }

  findOne(id: string): News {
    return this.repository.findOne(id)
  }

  create(createNewsDto: CreateNewsDto): News {
    return this.repository.create({ ...createNewsDto, likeCount: 0 })
  }

  setLiked(id: string, liked: boolean): News {
    const newsItem = this.repository.findOne(id)
    const likeCount = Math.max(0, (newsItem.likeCount ?? 0) + (liked ? 1 : -1))
    return this.repository.update(id, { likeCount })
  }

  update(id: string, updateNewsDto: UpdateNewsDto): News {
    return this.repository.update(id, updateNewsDto)
  }

  remove(id: string): void {
    this.repository.remove(id)
  }
}
