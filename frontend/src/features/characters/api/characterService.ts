import type { Character } from '../types/character'

export async function fetchCharacters(): Promise<Character[]> {
  const response = await fetch('/api/characters')

  if (!response.ok) {
    throw new Error('Failed to load characters')
  }

  return (await response.json()) as Character[]
}
