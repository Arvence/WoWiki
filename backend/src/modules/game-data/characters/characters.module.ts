import { Module } from '@nestjs/common'
import { ClassesModule } from '../classes/classes.module'
import { FactionsModule } from '../factions/factions.module'
import { CharactersController } from './characters.controller'
import { CharactersService } from './characters.service'

@Module({
  controllers: [CharactersController],
  imports: [ClassesModule, FactionsModule],
  providers: [CharactersService],
})
export class CharactersModule {}
