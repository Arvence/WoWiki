import { Injectable } from '@nestjs/common'
import { InMemoryCrudService } from '../../../common/services/in-memory-crud.service'
import { CreateClassDto } from './dto/create-class.dto'
import { UpdateClassDto } from './dto/update-class.dto'
import { GameClass } from './models/class.model'
import { CLASSES } from './seeds/classes.seed'

@Injectable()
export class ClassesService extends InMemoryCrudService<GameClass, CreateClassDto, UpdateClassDto> {
  constructor() {
    super(CLASSES, 'Class')
  }
}
