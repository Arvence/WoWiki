import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../auth/auth.guard'
import type { AuthenticatedRequest } from '../../auth/auth.types'
import { CreateRaidPlanDto } from './dto/create-raid-plan.dto'
import { UpdateRaidPlanDto } from './dto/update-raid-plan.dto'
import { RaidPlansService } from './raid-plans.service'

@Controller('raid-plans')
@UseGuards(AuthGuard)
export class RaidPlansController {
  constructor(private readonly raidPlansService: RaidPlansService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.raidPlansService.findAll(request.user.id)
  }

  @Post()
  create(@Body() createRaidPlanDto: CreateRaidPlanDto, @Req() request: AuthenticatedRequest) {
    return this.raidPlansService.create(request.user.id, createRaidPlanDto)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.raidPlansService.findOne(request.user.id, id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRaidPlanDto: UpdateRaidPlanDto, @Req() request: AuthenticatedRequest) {
    return this.raidPlansService.update(request.user.id, id, updateRaidPlanDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest): void {
    this.raidPlansService.remove(request.user.id, id)
  }
}
