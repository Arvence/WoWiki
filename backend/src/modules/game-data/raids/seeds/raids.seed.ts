import { Raid } from '../models/raid.model'
export const RAIDS: Raid[] = [
  { id: '1', name: 'Molten Core', location: 'Blackrock Mountain', level: 60, playerLimit: 40, bosses: ['Lucifron', 'Magmadar', 'Gehennas', 'Garr', 'Baron Geddon', 'Shazzrah', 'Sulfuron Harbinger', 'Golemagg', 'Majordomo Executus', 'Ragnaros'], description: 'The fiery domain of Ragnaros and the first major raid challenge of Classic.' },
  { id: '2', name: 'Blackwing Lair', location: 'Blackrock Mountain', level: 60, playerLimit: 40, bosses: ['Razorgore', 'Vaelastrasz', 'Broodlord Lashlayer', 'Firemaw', 'Ebonroc', 'Flamegor', 'Chromaggus', 'Nefarian'], description: 'Nefarian\'s stronghold atop Blackrock Spire.' },
  { id: '3', name: 'Naxxramas', location: 'Eastern Plaguelands', level: 60, playerLimit: 40, bosses: ['Anub\'Rekhan', 'Grand Widow Faerlina', 'Maexxna', 'Patchwerk', 'Thaddius', 'Sapphiron', 'Kel\'Thuzad'], description: 'A floating necropolis and the seat of the lich Kel\'Thuzad.' },
]
