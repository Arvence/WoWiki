import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../../common/database/database.service'
import { PersistentCrudService } from '../../../common/services/persistent-crud.service'
import { CreateClassDto } from './dto/create-class.dto'
import { UpdateClassDto } from './dto/update-class.dto'
import { GameClass } from './models/class.model'
import { CLASSES } from './seeds/classes.seed'

@Injectable()
export class ClassesService extends PersistentCrudService<GameClass, CreateClassDto, UpdateClassDto> {
  constructor(database: DatabaseService) {
    super(database, 'classes', CLASSES, 'Class')
  }
}
