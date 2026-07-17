import type { DatabaseCategory } from './types/database'

export type DatabaseCollection = { id: DatabaseCategory; code: string; title: string; note: string; href: string; searchable: boolean; sections: readonly string[] }

export const databaseCollections: readonly DatabaseCollection[] = [
  { id: 'characters', code: 'CH', title: 'Characters', note: 'Heroes, rulers, villains, and legends', href: '/database/characters', searchable: true, sections: ['Races', 'Classes', 'Factions', 'Biographies'] },
  { id: 'classes', code: 'CL', title: 'Classes', note: 'Combat roles and adventuring paths', href: '/database/classes', searchable: false, sections: ['Combat roles', 'Resources', 'Armor types', 'Class overviews'] },
  { id: 'dungeons', code: 'DG', title: 'Dungeons', note: 'Five-player journeys beneath Azeroth', href: '/database/dungeons', searchable: true, sections: ['Level ranges', 'Locations', 'Bosses', 'Group size'] },
  { id: 'raids', code: 'RD', title: 'Raids', note: 'The most dangerous group encounters', href: '/database/raids', searchable: true, sections: ['Raid levels', 'Locations', 'Bosses', 'Raid size'] },
  { id: 'items', code: 'IT', title: 'Items', note: 'Weapons, armor, artifacts, and rewards', href: '/database/items', searchable: true, sections: ['Item types', 'Quality', 'Item levels', 'Sources'] },
]

export function isDatabaseCategory(value: string | undefined): value is DatabaseCategory {
  return databaseCollections.some((collection) => collection.id === value)
}

export function getDatabaseCollection(category: DatabaseCategory): DatabaseCollection {
  const collection = databaseCollections.find((item) => item.id === category)
  if (!collection) throw new Error(`Unknown database category: ${category}`)
  return collection
}
