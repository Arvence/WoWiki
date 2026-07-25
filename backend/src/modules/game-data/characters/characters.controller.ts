import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../auth/auth.guard'
import { Roles } from '../../auth/roles.decorator'
import { RolesGuard } from '../../auth/roles.guard'
import { CharactersService } from './characters.service'
import { CreateCharacterDto } from './dto/create-character.dto'
import { UpdateCharacterDto } from './dto/update-character.dto'

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  findAll() {
    return this.charactersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.charactersService.findOne(id)
  }

  @Post()
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() createCharacterDto: CreateCharacterDto) {
    return this.charactersService.create(createCharacterDto)
  }

  @Patch(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateCharacterDto: UpdateCharacterDto) {
    return this.charactersService.update(id, updateCharacterDto)
  }

  @Delete(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.charactersService.remove(id)
  }
}
