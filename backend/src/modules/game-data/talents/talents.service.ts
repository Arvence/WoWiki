import { Injectable, NotFoundException } from '@nestjs/common'
import { normalizeId } from '../../../common/utils/normalize-id'
import { ValidateTalentBuildDto } from './dto/validate-talent-build.dto'
import { TalentBuildValidation, TalentClass, TalentClassSummary, TalentTree } from './models/talent.model'
import { CLASSIC_TALENT_CLASSES } from './seeds/classic-talents.seed'

@Injectable()
export class TalentsService {
  findAll(): TalentClassSummary[] {
    return CLASSIC_TALENT_CLASSES.map(({ id, name, color, version, maxLevel, maxTalentPoints, trees }) => ({
      id,
      name,
      color,
      version,
      maxLevel,
      maxTalentPoints,
      treeNames: trees.map((tree) => tree.name),
    }))
  }

  findOne(classId: string): TalentClass {
    const talentClass = CLASSIC_TALENT_CLASSES.find((item) => item.id === normalizeId(classId))
    if (!talentClass) throw new NotFoundException(`Talent class ${classId} not found`)
    return talentClass
  }

  validate(classId: string, input: ValidateTalentBuildDto): TalentBuildValidation {
    const talentClass = this.findOne(classId)
    const errors: string[] = []
    const knownTalents = new Map(talentClass.trees.flatMap((tree) => tree.talents.map((talent) => [talent.id, { talent, tree }] as const)))
    const normalizedRanks: Record<string, number> = {}

    for (const [talentId, rank] of Object.entries(input.ranks)) {
      const known = knownTalents.get(talentId)
      if (!known) {
        errors.push(`Unknown talent: ${talentId}`)
        continue
      }
      if (!Number.isInteger(rank) || rank < 0) {
        errors.push(`${known.talent.name} must have a non-negative integer rank`)
        continue
      }
      if (rank > known.talent.maxRank) {
        errors.push(`${known.talent.name} cannot exceed rank ${known.talent.maxRank}`)
        continue
      }
      if (rank > 0) normalizedRanks[talentId] = rank
    }

    const treePoints = Object.fromEntries(talentClass.trees.map((tree) => [tree.id, this.pointsInTree(tree, normalizedRanks)]))
    const totalPoints = Object.values(normalizedRanks).reduce((sum, rank) => sum + rank, 0)
    if (totalPoints > talentClass.maxTalentPoints) errors.push(`Build cannot exceed ${talentClass.maxTalentPoints} talent points`)

    for (const tree of talentClass.trees) {
      for (const talent of tree.talents) {
        if ((normalizedRanks[talent.id] ?? 0) === 0) continue
        const pointsBeforeRow = tree.talents
          .filter((candidate) => candidate.row < talent.row)
          .reduce((sum, candidate) => sum + (normalizedRanks[candidate.id] ?? 0), 0)
        const requiredPoints = talent.row * 5
        if (pointsBeforeRow < requiredPoints) errors.push(`${talent.name} requires ${requiredPoints} points in earlier ${tree.name} rows`)
        if (talent.prerequisiteId) {
          const prerequisite = knownTalents.get(talent.prerequisiteId)?.talent
          if (prerequisite && (normalizedRanks[prerequisite.id] ?? 0) < prerequisite.maxRank) {
            errors.push(`${talent.name} requires ${prerequisite.name} at rank ${prerequisite.maxRank}`)
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      totalPoints,
      requiredLevel: totalPoints === 0 ? 10 : Math.min(talentClass.maxLevel, totalPoints + 9),
      treePoints,
      errors: [...new Set(errors)],
    }
  }

  private pointsInTree(tree: TalentTree, ranks: Record<string, number>): number {
    return tree.talents.reduce((sum, talent) => sum + (ranks[talent.id] ?? 0), 0)
  }
}
