import { Dungeon } from '../models/dungeon.model'
export const DUNGEONS: Dungeon[] = [
  { id: '1', name: 'The Deadmines', location: 'Westfall', levelRange: '18-23', playerLimit: 5, bosses: ['Rhahk\'Zor', 'Sneed', 'Gilnid', 'Mr. Smite', 'Edwin VanCleef'], description: 'An extensive mine beneath Westfall occupied by the Defias Brotherhood.' },
  { id: '2', name: 'Scarlet Monastery', location: 'Tirisfal Glades', levelRange: '26-45', playerLimit: 5, bosses: ['Bloodmage Thalnos', 'Arcanist Doan', 'Herod', 'High Inquisitor Whitemane'], description: 'The fortified stronghold of the fanatical Scarlet Crusade.' },
  { id: '3', name: 'Blackrock Depths', location: 'Blackrock Mountain', levelRange: '48-60', playerLimit: 5, bosses: ['High Interrogator Gerstahn', 'General Angerforge', 'Emperor Dagran Thaurissan'], description: 'The vast subterranean capital of the Dark Iron dwarves.' },
]
