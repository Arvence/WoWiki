import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { CreateNewsDto } from './dto/create-news.dto'
import { LikeNewsDto } from './dto/like-news.dto'
import { UpdateNewsDto } from './dto/update-news.dto'
import { NewsService } from './news.service'

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll() {
    return this.newsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id)
  }

  @Post(':id/like')
  setLiked(@Param('id') id: string, @Body() likeNewsDto: LikeNewsDto) {
    return this.newsService.setLiked(id, likeNewsDto.liked)
  }

  @Post()
  create(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.create(createNewsDto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, updateNewsDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsService.remove(id)
  }
}
