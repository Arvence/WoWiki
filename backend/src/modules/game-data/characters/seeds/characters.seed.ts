import { Character } from '../models/character.model'

export const CHARACTERS: Character[] = [
  {
    id: '1',
    name: 'Arthas Menethil',
    race: 'Human',
    classId: '4',
    factionId: '5',
    description: 'The fallen prince turned Lich King, wielding Frostmourne to conquer Azeroth.',
  },
  {
    id: '2',
    name: 'Sylvanas Windrunner',
    race: 'High Elf',
    classId: '5',
    factionId: '2',
    description: 'The Banshee Queen who leads the Forsaken with ruthless precision.',
  },
  {
    id: '3',
    name: 'Thrall',
    race: 'Orc',
    classId: '6',
    factionId: '2',
    description: 'Warchief and shaman of the Frostwolf clan, a leader for a new generation of orcs.',
  },
  {
    id: '4',
    name: 'Jaina Proudmoore',
    race: 'Human',
    classId: '2',
    factionId: '1',
    description: 'Archmage of the Kirin Tor, protector of the seas and defender of Kul Tiras.',
  },
  {
    id: '5',
    name: 'Tyrande Whisperwind',
    race: 'Night Elf',
    classId: '3',
    factionId: '1',
    description: 'High Priestess of Elune, a guardian of the woods and the people of Teldrassil.',
  },
]
