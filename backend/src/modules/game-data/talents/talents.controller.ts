import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ValidateTalentBuildDto } from './dto/validate-talent-build.dto'
import { TalentsService } from './talents.service'

@Controller('talents')
export class TalentsController {
  constructor(private readonly talentsService: TalentsService) {}

  @Get()
  findAll() {
    return this.talentsService.findAll()
  }

  @Get(':classId')
  findOne(@Param('classId') classId: string) {
    return this.talentsService.findOne(classId)
  }

  @Post(':classId/validate')
  validate(@Param('classId') classId: string, @Body() input: ValidateTalentBuildDto) {
    return this.talentsService.validate(classId, input)
  }
}
