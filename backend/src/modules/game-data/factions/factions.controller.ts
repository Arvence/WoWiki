import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
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
  create(@Body() input: CreateFactionDto) {
    return this.factionsService.create(input)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() input: UpdateFactionDto) {
    return this.factionsService.update(id, input)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.factionsService.remove(id)
  }
}
