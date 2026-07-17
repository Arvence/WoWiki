import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { CreateRaidDto } from './dto/create-raid.dto'
import { UpdateRaidDto } from './dto/update-raid.dto'
import { RaidsService } from './raids.service'
@Controller('raids')
export class RaidsController {
  constructor(private readonly service: RaidsService) {}
  @Get() findAll() { return this.service.findAll() }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
  @Post() create(@Body() input: CreateRaidDto) { return this.service.create(input) }
  @Patch(':id') update(@Param('id') id: string, @Body() input: UpdateRaidDto) { return this.service.update(id, input) }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id) }
}
