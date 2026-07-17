import { Injectable } from '@nestjs/common'
import { InMemoryRepository } from '../../../common/repositories/in-memory.repository'
import { CreateClassDto } from './dto/create-class.dto'
import { UpdateClassDto } from './dto/update-class.dto'
import { GameClass } from './models/class.model'
import { CLASSES } from './seeds/classes.seed'

@Injectable()
export class ClassesService {
  private readonly repository = new InMemoryRepository(CLASSES, 'Class')
  findAll(): GameClass[] { return this.repository.findAll() }
  findOne(id: string): GameClass { return this.repository.findOne(id) }
  create(input: CreateClassDto): GameClass { return this.repository.create(input) }
  update(id: string, input: UpdateClassDto): GameClass { return this.repository.update(id, input) }
  remove(id: string): void { this.repository.remove(id) }
}
