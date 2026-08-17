import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseEnumPipe, Put, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../auth/auth.guard'
import type { AuthenticatedRequest } from '../../auth/auth.types'
import { BookmarksService } from './bookmarks.service'
import { BookmarkTargetType } from './models/bookmark.model'

@Controller('bookmarks')
@UseGuards(AuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.bookmarksService.findAll(request.user.id)
  }

  @Put(':targetType/:targetId')
  save(@Param('targetType', new ParseEnumPipe(BookmarkTargetType)) targetType: BookmarkTargetType, @Param('targetId') targetId: string, @Req() request: AuthenticatedRequest) {
    return this.bookmarksService.save(request.user.id, targetType, targetId)
  }

  @Delete(':targetType/:targetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('targetType', new ParseEnumPipe(BookmarkTargetType)) targetType: BookmarkTargetType, @Param('targetId') targetId: string, @Req() request: AuthenticatedRequest): void {
    this.bookmarksService.remove(request.user.id, targetType, targetId)
  }
}
