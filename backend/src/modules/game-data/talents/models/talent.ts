export type WowClassId =
  | 'druid'
  | 'hunter'
  | 'mage'
  | 'paladin'
  | 'priest'
  | 'rogue'
  | 'shaman'
  | 'warlock'
  | 'warrior'

export interface TalentRank {
  readonly spellId: number
  readonly description: string
}

export interface TalentPrerequisite {
  readonly talentId: string
  readonly requiredRank: number
}

export interface Talent {
  readonly id: string
  readonly name: string
  readonly icon: string
  readonly row: number
  readonly column: number
  readonly requiredPoints: number
  readonly maxRank: number
  readonly ranks: readonly TalentRank[]
  readonly prerequisite?: TalentPrerequisite
}

export interface TalentTree {
  readonly id: string
  readonly name: string
  readonly order: number
  readonly backgroundImage?: string
  readonly talents: readonly Talent[]
}

export interface ClassTalents {
  readonly classId: WowClassId
  readonly className: string
  readonly color: string
  readonly version: 'classic-era'
  readonly maxLevel: 60
  readonly maxTalentPoints: 51
  readonly trees: readonly TalentTree[]
}

export type TalentClass = Pick<ClassTalents, 'color' | 'version' | 'maxLevel' | 'maxTalentPoints' | 'trees'> & {
  readonly id: WowClassId
  readonly name: string
}

export type TalentClassSummary = Pick<TalentClass, 'id' | 'name' | 'color' | 'version' | 'maxLevel' | 'maxTalentPoints'> & {
  readonly treeNames: readonly string[]
}

export interface TalentBuildValidation {
  readonly valid: boolean
  readonly totalPoints: number
  readonly requiredLevel: number
  readonly treePoints: Readonly<Record<string, number>>
  readonly errors: readonly string[]
}
