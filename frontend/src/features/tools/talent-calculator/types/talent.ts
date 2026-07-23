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
  version: 'classic-era' | 'tbc'
  maxLevel: number
  maxTalentPoints: number
  trees: TalentTree[]
}
