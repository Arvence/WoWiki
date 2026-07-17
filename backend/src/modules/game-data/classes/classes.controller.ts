import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ClassesService } from './classes.service'
import { CreateClassDto } from './dto/create-class.dto'
import { UpdateClassDto } from './dto/update-class.dto'

@Controller('classes')
export class ClassesController {
  constructor(private readonly service: ClassesService) {}
  @Get() findAll() { return this.service.findAll() }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
  @Post() create(@Body() input: CreateClassDto) { return this.service.create(input) }
  @Patch(':id') update(@Param('id') id: string, @Body() input: UpdateClassDto) { return this.service.update(id, input) }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id) }
}
