import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
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
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto)
  }

  @Post(':id/like')
  like(@Param('id') id: string) {
    return this.commentsService.like(id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id)
  }
}
