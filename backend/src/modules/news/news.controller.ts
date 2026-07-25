import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import type { AuthenticatedRequest } from '../auth/auth.types'
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
  @UseGuards(AuthGuard)
  setLiked(@Param('id') id: string, @Body() likeNewsDto: LikeNewsDto) {
    return this.newsService.setLiked(id, likeNewsDto.liked)
  }

  @Post()
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() createNewsDto: CreateNewsDto, @Req() request: AuthenticatedRequest) {
    return this.newsService.create({
      ...createNewsDto,
      author: request.user.displayName,
      updatedAt: new Date().toISOString(),
    })
  }

  @Patch(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, {
      ...updateNewsDto,
      updatedAt: new Date().toISOString(),
    })
  }

  @Delete(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.newsService.remove(id)
  }
}
