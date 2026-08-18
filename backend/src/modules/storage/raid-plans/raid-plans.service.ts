import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../../../common/database/database.service'
import { SqliteRepository } from '../../../common/repositories/sqlite.repository'
import { CreateRaidPlanDto } from './dto/create-raid-plan.dto'
import { UpdateRaidPlanDto } from './dto/update-raid-plan.dto'
import { RaidPlan, RaidPlanRaider } from './models/raid-plan.model'

@Injectable()
export class RaidPlansService {
  private readonly repository: SqliteRepository<RaidPlan>

  constructor(database: DatabaseService) {
    this.repository = new SqliteRepository(database, 'raid-plans', [], 'Raid plan')
  }

  findAll(userId: string): RaidPlan[] {
    return this.repository.findAll()
      .filter((raidPlan) => raidPlan.userId === userId)
      .sort((first, second) => Date.parse(second.updatedAtUtc) - Date.parse(first.updatedAtUtc))
  }

  findOne(userId: string, id: string): RaidPlan {
    const raidPlan = this.repository.findOne(id)
    if (raidPlan.userId !== userId) throw new NotFoundException(`Raid plan with id ${id} not found`)
    return raidPlan
  }

  create(userId: string, createRaidPlanDto: CreateRaidPlanDto): RaidPlan {
    const raiders = this.normalizeRaiders(createRaidPlanDto.raiders ?? [])
    this.validateRoster(createRaidPlanDto.raidSize, raiders)
    const timestamp = new Date().toISOString()

    return this.repository.create({
      userId,
      raidId: createRaidPlanDto.raidId.trim(),
      scheduledAtUtc: createRaidPlanDto.scheduledAtUtc,
      raidSize: createRaidPlanDto.raidSize,
      notes: createRaidPlanDto.notes?.trim() ?? '',
      raiders,
      createdAtUtc: timestamp,
      updatedAtUtc: timestamp,
    })
  }

  update(userId: string, id: string, updateRaidPlanDto: UpdateRaidPlanDto): RaidPlan {
    const current = this.findOne(userId, id)
    const raidSize = updateRaidPlanDto.raidSize ?? current.raidSize
    const raiders = updateRaidPlanDto.raiders
      ? this.normalizeRaiders(updateRaidPlanDto.raiders)
      : current.raiders
    this.validateRoster(raidSize, raiders)

    return this.repository.update(id, {
      ...updateRaidPlanDto,
      raidId: updateRaidPlanDto.raidId?.trim() ?? current.raidId,
      notes: updateRaidPlanDto.notes?.trim() ?? current.notes,
      raiders,
      updatedAtUtc: new Date().toISOString(),
    })
  }

  remove(userId: string, id: string): void {
    this.findOne(userId, id)
    this.repository.remove(id)
  }

  private normalizeRaiders(raiders: RaidPlanRaider[]): RaidPlanRaider[] {
    return raiders.map((raider) => ({ ...raider, id: raider.id.trim(), name: raider.name.trim() }))
  }

  private validateRoster(raidSize: number, raiders: RaidPlanRaider[]): void {
    if (raiders.length > raidSize) throw new BadRequestException('Raider count cannot exceed raid size')

    const raiderIds = new Set<string>()
    const groupCounts = new Map<number, number>()
    const maximumGroup = Math.ceil(raidSize / 5)

    for (const raider of raiders) {
      if (raiderIds.has(raider.id)) throw new BadRequestException(`Duplicate raider id ${raider.id}`)
      if (raider.group > maximumGroup) throw new BadRequestException(`Raider group cannot exceed ${maximumGroup} for a ${raidSize}-player raid`)

      raiderIds.add(raider.id)
      const groupCount = (groupCounts.get(raider.group) ?? 0) + 1
      if (groupCount > 5) throw new BadRequestException(`Raid group ${raider.group} cannot contain more than 5 raiders`)
      groupCounts.set(raider.group, groupCount)
    }
  }
}
