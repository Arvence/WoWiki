import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../auth/auth.guard'
import { Roles } from '../../auth/roles.decorator'
import { RolesGuard } from '../../auth/roles.guard'
import { CreateItemDto } from './dto/create-item.dto'
import { UpdateItemDto } from './dto/update-item.dto'
import { ItemsService } from './items.service'
@Controller('items')
export class ItemsController {
  constructor(private readonly service: ItemsService) {}
  @Get() findAll() { return this.service.findAll() }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
  @Post()
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() input: CreateItemDto) { return this.service.create(input) }
  @Patch(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() input: UpdateItemDto) { return this.service.update(id, input) }
  @Delete(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string) { return this.service.remove(id) }
}
