import { http } from '../../../../shared/api/http'
import type { TalentClass } from '../types/talent'

export function fetchTalentClass(classId: string, signal?: AbortSignal): Promise<TalentClass> {
  return http.get<TalentClass>(`/api/talents/${classId}`, {
    signal,
    errorMessage: `Failed to load ${classId} talents`,
    notFoundMessage: `Talent data for ${classId} was not found`,
  })
}
