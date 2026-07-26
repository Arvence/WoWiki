import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../../common/database/database.service'
import { PersistentCrudService } from '../../../common/services/persistent-crud.service'
import { CreateItemDto } from './dto/create-item.dto'
import { UpdateItemDto } from './dto/update-item.dto'
import { Item } from './models/item.model'
import { ITEMS } from './seeds/items.seed'
@Injectable()
export class ItemsService extends PersistentCrudService<Item, CreateItemDto, UpdateItemDto> {
  constructor(database: DatabaseService) {
    super(database, 'items', ITEMS, 'Item')
  }
}
