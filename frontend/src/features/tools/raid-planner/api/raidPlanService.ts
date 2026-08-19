import { http } from '../../../../shared/api/http'
import type { ApiRaidPlan, RaidPlanWriteInput } from '../types/raidPlan'

export function getRaidPlans(): Promise<ApiRaidPlan[]> {
  return http.get<ApiRaidPlan[]>('/api/raid-plans', { errorMessage: 'Could not load raid plans' })
}

export function createRaidPlan(input: RaidPlanWriteInput): Promise<ApiRaidPlan> {
  return http.post<ApiRaidPlan>('/api/raid-plans', input, { errorMessage: 'Could not create raid plan' })
}

export function updateRaidPlan(id: string, input: RaidPlanWriteInput): Promise<ApiRaidPlan> {
  return http.patch<ApiRaidPlan>(`/api/raid-plans/${encodeURIComponent(id)}`, input, { errorMessage: 'Could not save raid plan' })
}

export function deleteRaidPlan(id: string): Promise<void> {
  return http.delete(`/api/raid-plans/${encodeURIComponent(id)}`, { errorMessage: 'Could not delete raid plan' })
}
