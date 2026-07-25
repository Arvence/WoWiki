import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../auth/auth.guard'
import { Roles } from '../../auth/roles.decorator'
import { RolesGuard } from '../../auth/roles.guard'
import { CreateRaidDto } from './dto/create-raid.dto'
import { UpdateRaidDto } from './dto/update-raid.dto'
import { RaidsService } from './raids.service'
@Controller('raids')
export class RaidsController {
  constructor(private readonly service: RaidsService) {}
  @Get() findAll() { return this.service.findAll() }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
  @Post()
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() input: CreateRaidDto) { return this.service.create(input) }
  @Patch(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() input: UpdateRaidDto) { return this.service.update(id, input) }
  @Delete(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string) { return this.service.remove(id) }
}
