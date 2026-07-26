import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../../common/database/database.service'
import { PersistentCrudService } from '../../../common/services/persistent-crud.service'
import { CreateRaidDto } from './dto/create-raid.dto'
import { UpdateRaidDto } from './dto/update-raid.dto'
import { Raid } from './models/raid.model'
import { RAIDS } from './seeds/raids.seed'
@Injectable()
export class RaidsService extends PersistentCrudService<Raid, CreateRaidDto, UpdateRaidDto> {
  constructor(database: DatabaseService) {
    super(database, 'raids', RAIDS, 'Raid')
  }
}
