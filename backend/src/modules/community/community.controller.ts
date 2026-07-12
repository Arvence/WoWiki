import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
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
  createComment(@Param('id') id: string, @Body() createCommentDto: CreateCommentDto) {
    this.communityService.findOne(id)
    return this.commentsService.create('community', id, createCommentDto)
  }

  @Post()
  create(@Body() createCommunityEntryDto: CreateCommunityEntryDto) {
    return this.communityService.create(createCommunityEntryDto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommunityEntryDto: UpdateCommunityEntryDto) {
    return this.communityService.update(id, updateCommunityEntryDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityService.remove(id)
  }
}
