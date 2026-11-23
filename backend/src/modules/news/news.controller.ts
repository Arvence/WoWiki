import { Body, Controller, Delete, Get, Header, HttpCode, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import type { AuthenticatedRequest } from '../auth/auth.types'
import { CreateNewsDto } from './dto/create-news.dto'
import { SetLikeDto } from '../../common/dto/set-like.dto'
import { UpdateNewsDto } from './dto/update-news.dto'
import { PrepareNewsScheduleDto } from './dto/prepare-news-schedule.dto'
import { NewsService } from './news.service'
import { NewsSchedulingService } from './news-scheduling.service'

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService, private readonly scheduling: NewsSchedulingService) {}

  @Get()
  findAll() {
    return this.newsService.findAll()
  }

  @Get('editor')
  @Header('Cache-Control', 'no-store')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  findForEditor(@Query('q') query?: string) {
    return this.newsService.findForEditor(query)
  }

  @Get('editor/scheduling-availability')
  @Header('Cache-Control', 'no-store')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  schedulingAvailability() {
    return this.scheduling.availability()
  }

  @Get('editor/:id')
  @Header('Cache-Control', 'no-store')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  findOneForEditor(@Param('id') id: string) {
    return this.newsService.findOneForEditor(id)
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

  @Post('drafts')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  createDraft(@Body() draft: CreateNewsDto, @Req() request: AuthenticatedRequest) {
    return this.newsService.createDraft({ ...draft, author: request.user.displayName, updatedAt: new Date().toISOString() })
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

  @Put(':id/schedule')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  prepareSchedule(@Param('id') id: string, @Body() schedule: PrepareNewsScheduleDto) {
    return this.scheduling.schedule(id, schedule.scheduledAtLocal, schedule.enforcePublicationDeadline)
  }

  @Post(':id/schedule/retry')
  @HttpCode(200)
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  retrySchedule(@Param('id') id: string) {
    return this.scheduling.retry(id)
  }

  @Post(':id/unschedule')
  @HttpCode(200)
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  removeSchedule(@Param('id') id: string) {
    return this.scheduling.removeSchedule(id)
  }

  @Post(':id/publish')
  @HttpCode(200)
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  publishNow(@Param('id') id: string) {
    return this.scheduling.publishNow(id)
  }

  @Delete(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.scheduling.remove(id)
  }
}
