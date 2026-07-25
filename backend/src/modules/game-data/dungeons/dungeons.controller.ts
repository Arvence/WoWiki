import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../auth/auth.guard'
import { Roles } from '../../auth/roles.decorator'
import { RolesGuard } from '../../auth/roles.guard'
import { DungeonsService } from './dungeons.service'
import { CreateDungeonDto } from './dto/create-dungeon.dto'
import { UpdateDungeonDto } from './dto/update-dungeon.dto'
@Controller('dungeons')
export class DungeonsController {
  constructor(private readonly service: DungeonsService) {}
  @Get() findAll() { return this.service.findAll() }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
  @Post()
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() input: CreateDungeonDto) { return this.service.create(input) }
  @Patch(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() input: UpdateDungeonDto) { return this.service.update(id, input) }
  @Delete(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string) { return this.service.remove(id) }
}
