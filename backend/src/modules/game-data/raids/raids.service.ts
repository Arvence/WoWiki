import { Injectable } from '@nestjs/common'
import { InMemoryCrudService } from '../../../common/services/in-memory-crud.service'
import { CreateRaidDto } from './dto/create-raid.dto'
import { UpdateRaidDto } from './dto/update-raid.dto'
import { Raid } from './models/raid.model'
import { RAIDS } from './seeds/raids.seed'
@Injectable()
export class RaidsService extends InMemoryCrudService<Raid, CreateRaidDto, UpdateRaidDto> {
  constructor() {
    super(RAIDS, 'Raid')
  }
}
