import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { CommunityService } from './community.service'
import { CreateCommunityEntryDto } from './dto/create-community-entry.dto'
import { UpdateCommunityEntryDto } from './dto/update-community-entry.dto'

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  findAll() {
    return this.communityService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communityService.findOne(id)
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
