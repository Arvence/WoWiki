export type TalentRank = {
  readonly spellId: number
  readonly description: string
}

export type TalentPrerequisite = {
  readonly talentId: string
  readonly requiredRank: number
}

export type Talent = {
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

export type TalentTree = {
  readonly id: string
  readonly name: string
  readonly order: number
  readonly backgroundImage?: string
  readonly talents: readonly Talent[]
}

export type TalentClass = {
  readonly id: string
  readonly name: string
  readonly color: string
  readonly version: 'classic-era'
  readonly maxLevel: number
  readonly maxTalentPoints: number
  readonly trees: readonly TalentTree[]
}
