import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { SetLikeDto } from '../../common/dto/set-like.dto'
import type { AuthenticatedRequest } from '../auth/auth.types'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { CommentsService } from './comments.service'
import { UpdateCommentDto } from './dto/update-comment.dto'

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id)
  }

  @Patch(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto)
  }

  @Post(':id/like')
  @UseGuards(AuthGuard)
  setLiked(@Param('id') id: string, @Body() setLikeDto: SetLikeDto, @Req() request: AuthenticatedRequest) {
    return this.commentsService.setLiked(request.user.id, id, setLikeDto.liked)
  }

  @Get(':id/like')
  @UseGuards(AuthGuard)
  getReaction(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.commentsService.getReaction(request.user.id, id)
  }

  @Delete(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id)
  }
}
