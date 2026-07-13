import type { Character } from '../types/character'
import { http } from '../../../shared/api/http'

export async function fetchCharacters(): Promise<Character[]> {
  return http.get<Character[]>('/api/characters', { errorMessage: 'Failed to load characters' })
}
