import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../auth/auth.guard'
import { Roles } from '../../auth/roles.decorator'
import { RolesGuard } from '../../auth/roles.guard'
import { CreateFactionDto } from './dto/create-faction.dto'
import { UpdateFactionDto } from './dto/update-faction.dto'
import { FactionsService } from './factions.service'

@Controller('factions')
export class FactionsController {
  constructor(private readonly factionsService: FactionsService) {}

  @Get()
  findAll() {
    return this.factionsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.factionsService.findOne(id)
  }

  @Post()
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() input: CreateFactionDto) {
    return this.factionsService.create(input)
  }

  @Patch(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() input: UpdateFactionDto) {
    return this.factionsService.update(id, input)
  }

  @Delete(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.factionsService.remove(id)
  }
}
