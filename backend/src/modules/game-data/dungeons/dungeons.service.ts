import { Injectable } from '@nestjs/common'
import { InMemoryCrudService } from '../../../common/services/in-memory-crud.service'
import { CreateDungeonDto } from './dto/create-dungeon.dto'
import { UpdateDungeonDto } from './dto/update-dungeon.dto'
import { Dungeon } from './models/dungeon.model'
import { DUNGEONS } from './seeds/dungeons.seed'
@Injectable()
export class DungeonsService extends InMemoryCrudService<Dungeon, CreateDungeonDto, UpdateDungeonDto> {
  constructor() {
    super(DUNGEONS, 'Dungeon')
  }
}
