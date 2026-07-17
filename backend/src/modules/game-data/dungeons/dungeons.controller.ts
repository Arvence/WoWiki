import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { DungeonsService } from './dungeons.service'
import { CreateDungeonDto } from './dto/create-dungeon.dto'
import { UpdateDungeonDto } from './dto/update-dungeon.dto'
@Controller('dungeons')
export class DungeonsController {
  constructor(private readonly service: DungeonsService) {}
  @Get() findAll() { return this.service.findAll() }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
  @Post() create(@Body() input: CreateDungeonDto) { return this.service.create(input) }
  @Patch(':id') update(@Param('id') id: string, @Body() input: UpdateDungeonDto) { return this.service.update(id, input) }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id) }
}
