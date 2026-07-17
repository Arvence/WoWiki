import type { Character } from '../../characters/types/character'

export type DatabaseCategory = 'characters' | 'classes' | 'dungeons' | 'raids' | 'items'
export type GameClass = { id: string; name: string; roles: Array<'tank' | 'healer' | 'damage'>; resource: string; armor: string; description: string }
export type Dungeon = { id: string; name: string; location: string; levelRange: string; playerLimit: number; bosses: string[]; description: string }
export type Raid = { id: string; name: string; location: string; level: number; playerLimit: number; bosses: string[]; description: string }
export type Item = { id: string; name: string; quality: 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'; type: string; itemLevel: number; requiredLevel: number; source: string; description: string }
export type DatabaseRecord = Character | GameClass | Dungeon | Raid | Item
export type DatabaseCollectionMap = { characters: Character; classes: GameClass; dungeons: Dungeon; raids: Raid; items: Item }
