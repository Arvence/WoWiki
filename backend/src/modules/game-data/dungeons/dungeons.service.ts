import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../../common/database/database.service'
import { PersistentCrudService } from '../../../common/services/persistent-crud.service'
import { CreateDungeonDto } from './dto/create-dungeon.dto'
import { UpdateDungeonDto } from './dto/update-dungeon.dto'
import { Dungeon } from './models/dungeon.model'
import { DUNGEONS } from './seeds/dungeons.seed'
@Injectable()
export class DungeonsService extends PersistentCrudService<Dungeon, CreateDungeonDto, UpdateDungeonDto> {
  constructor(database: DatabaseService) {
    super(database, 'dungeons', DUNGEONS, 'Dungeon')
  }
}
