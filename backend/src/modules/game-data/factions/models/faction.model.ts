export const FACTION_ALIGNMENTS = ['alliance', 'horde', 'neutral', 'hostile'] as const

export type FactionAlignment = (typeof FACTION_ALIGNMENTS)[number]

export class Faction {
  id!: string
  name!: string
  alignment!: FactionAlignment
  races!: string[]
  headquarters!: string
  description!: string
}
