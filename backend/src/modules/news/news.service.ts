import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateNewsDto } from './dto/create-news.dto'
import { UpdateNewsDto } from './dto/update-news.dto'
import { News } from './models/news.model'
import { NEWS } from './seeds/news.seed'

@Injectable()
export class NewsService {
  private news: News[] = [...NEWS]
  private nextId = this.news.length + 1

  findAll(): News[] {
    return this.news
  }

  findOne(id: string): News {
    const newsItem = this.news.find((item) => item.id === id)
    if (!newsItem) {
      throw new NotFoundException(`News item with id ${id} not found`)
    }
    return newsItem
  }

  create(createNewsDto: CreateNewsDto): News {
    const newsItem: News = { id: String(this.nextId++), ...createNewsDto, likeCount: 0 }
    this.news.push(newsItem)
    return newsItem
  }

  setLiked(id: string, liked: boolean): News {
    const newsItem = this.news.find((item) => item.id === id)
    if (!newsItem) {
      throw new NotFoundException(`News item with id ${id} not found`)
    }

    newsItem.likeCount = Math.max(0, (newsItem.likeCount ?? 0) + (liked ? 1 : -1))
    return newsItem
  }

  update(id: string, updateNewsDto: UpdateNewsDto): News {
    const index = this.news.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new NotFoundException(`News item with id ${id} not found`)
    }
    const updatedNews = { ...this.news[index], ...updateNewsDto }
    this.news[index] = updatedNews
    return updatedNews
  }

  remove(id: string): void {
    const index = this.news.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new NotFoundException(`News item with id ${id} not found`)
    }
    this.news.splice(index, 1)
  }
}
