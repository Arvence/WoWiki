import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import type { AuthenticatedRequest } from '../auth/auth.types'
import { CreateNewsDto } from './dto/create-news.dto'
import { SetLikeDto } from '../../common/dto/set-like.dto'
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
  setLiked(@Param('id') id: string, @Body() setLikeDto: SetLikeDto, @Req() request: AuthenticatedRequest) {
    return this.newsService.setLiked(request.user.id, id, setLikeDto.liked)
  }

  @Get(':id/like')
  @UseGuards(AuthGuard)
  getReaction(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.newsService.getReaction(request.user.id, id)
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
