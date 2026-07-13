import { Character } from '../models/character.model'

export const CHARACTERS: Character[] = [
  {
    id: '1',
    name: 'Arthas Menethil',
    race: 'Human',
    className: 'Death Knight',
    faction: 'Scourge',
    description: 'The fallen prince turned Lich King, wielding Frostmourne to conquer Azeroth.',
  },
  {
    id: '2',
    name: 'Sylvanas Windrunner',
    race: 'High Elf',
    className: 'Ranger-General',
    faction: 'Horde',
    description: 'The Banshee Queen who leads the Forsaken with ruthless precision.',
  },
  {
    id: '3',
    name: 'Thrall',
    race: 'Orc',
    className: 'Shaman',
    faction: 'Horde',
    description: 'Warchief and shaman of the Frostwolf clan, a leader for a new generation of orcs.',
  },
  {
    id: '4',
    name: 'Jaina Proudmoore',
    race: 'Human',
    className: 'Mage',
    faction: 'Alliance',
    description: 'Archmage of the Kirin Tor, protector of the seas and defender of Kul Tiras.',
  },
  {
    id: '5',
    name: 'Tyrande Whisperwind',
    race: 'Night Elf',
    className: 'Priestess',
    faction: 'Alliance',
    description: 'High Priestess of Elune, a guardian of the woods and the people of Teldrassil.',
  },
]
