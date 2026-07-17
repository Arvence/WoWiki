import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { CreateItemDto } from './dto/create-item.dto'
import { UpdateItemDto } from './dto/update-item.dto'
import { ItemsService } from './items.service'
@Controller('items')
export class ItemsController {
  constructor(private readonly service: ItemsService) {}
  @Get() findAll() { return this.service.findAll() }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
  @Post() create(@Body() input: CreateItemDto) { return this.service.create(input) }
  @Patch(':id') update(@Param('id') id: string, @Body() input: UpdateItemDto) { return this.service.update(id, input) }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id) }
}
