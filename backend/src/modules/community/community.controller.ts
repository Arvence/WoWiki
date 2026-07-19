import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import type { AuthenticatedRequest } from '../auth/auth.types'
import { CommentsService } from '../comments/comments.service'
import { CreateCommentDto } from '../comments/dto/create-comment.dto'
import { CommunityService } from './community.service'
import { CreateCommunityEntryDto } from './dto/create-community-entry.dto'
import { UpdateCommunityEntryDto } from './dto/update-community-entry.dto'

@Controller('community')
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  findAll() {
    return this.communityService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communityService.findOne(id, true)
  }

  @Get(':id/comments')
  findComments(@Param('id') id: string) {
    this.communityService.findOne(id)
    return this.commentsService.findForTarget('community', id)
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard)
  createComment(@Param('id') id: string, @Body() createCommentDto: CreateCommentDto, @Req() request: AuthenticatedRequest) {
    this.communityService.findOne(id)
    return this.commentsService.create('community', id, { ...createCommentDto, author: request.user.displayName })
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createCommunityEntryDto: CreateCommunityEntryDto, @Req() request: AuthenticatedRequest) {
    return this.communityService.create({ ...createCommunityEntryDto, author: request.user.displayName })
  }

  @Patch(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateCommunityEntryDto: UpdateCommunityEntryDto) {
    return this.communityService.update(id, updateCommunityEntryDto)
  }

  @Delete(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.communityService.remove(id)
  }
}
