import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../auth/auth.guard'
import { Roles } from '../../auth/roles.decorator'
import { RolesGuard } from '../../auth/roles.guard'
import { ClassesService } from './classes.service'
import { CreateClassDto } from './dto/create-class.dto'
import { UpdateClassDto } from './dto/update-class.dto'

@Controller('classes')
export class ClassesController {
  constructor(private readonly service: ClassesService) {}
  @Get() findAll() { return this.service.findAll() }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
  @Post()
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() input: CreateClassDto) { return this.service.create(input) }
  @Patch(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() input: UpdateClassDto) { return this.service.update(id, input) }
  @Delete(':id')
  @Roles('moderator', 'admin')
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string) { return this.service.remove(id) }
}
