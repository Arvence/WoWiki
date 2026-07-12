export type Talent = {
  id: string
  name: string
  description: string
  row: number
  column: number
  maxRank: number
  iconId: number
  prerequisiteId?: string
}

export type TalentTree = {
  id: string
  name: string
  talents: Talent[]
}

export type TalentClass = {
  id: string
  name: string
  color: string
  version: 'classic-era'
  maxLevel: 60
  maxTalentPoints: 51
  trees: TalentTree[]
}

export type TalentClassSummary = Pick<TalentClass, 'id' | 'name' | 'color' | 'version' | 'maxLevel' | 'maxTalentPoints'> & {
  treeNames: string[]
}

export type TalentBuildValidation = {
  valid: boolean
  totalPoints: number
  requiredLevel: number
  treePoints: Record<string, number>
  errors: string[]
}
