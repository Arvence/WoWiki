import { Module } from '@nestjs/common'
import { CommentsModule } from '../comments/comments.module'
import { CommunityController } from './community.controller'
import { CommunityService } from './community.service'

@Module({
  imports: [CommentsModule],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
