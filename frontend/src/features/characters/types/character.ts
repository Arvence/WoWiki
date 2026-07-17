export interface Character {
  id: string
  name: string
  race: string
  classId: string
  factionId: string
  class: {
    id: string
    name: string
    roles: Array<'tank' | 'healer' | 'damage'>
    resource: string
    armor: string
    description: string
  }
  faction: {
    id: string
    name: string
    alignment: 'alliance' | 'horde' | 'neutral' | 'hostile'
    races: string[]
    headquarters: string
    description: string
  }
  description: string
}
