import { Injectable } from '@nestjs/common'
import { InMemoryCrudService } from '../../../common/services/in-memory-crud.service'
import { CreateItemDto } from './dto/create-item.dto'
import { UpdateItemDto } from './dto/update-item.dto'
import { Item } from './models/item.model'
import { ITEMS } from './seeds/items.seed'
@Injectable()
export class ItemsService extends InMemoryCrudService<Item, CreateItemDto, UpdateItemDto> {
  constructor() {
    super(ITEMS, 'Item')
  }
}
