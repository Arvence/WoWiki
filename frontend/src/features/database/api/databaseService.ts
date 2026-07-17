import { http } from '../../../shared/api/http'
import type { DatabaseCategory, DatabaseCollectionMap } from '../types/database'

export function fetchDatabaseCollection<TCategory extends DatabaseCategory>(category: TCategory, signal?: AbortSignal): Promise<Array<DatabaseCollectionMap[TCategory]>> {
  return http.get<Array<DatabaseCollectionMap[TCategory]>>(`/api/${category}`, { signal, errorMessage: `Failed to load ${category}` })
}
