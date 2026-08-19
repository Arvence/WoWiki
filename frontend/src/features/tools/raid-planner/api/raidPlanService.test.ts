import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRaidPlan, deleteRaidPlan, getRaidPlans, updateRaidPlan } from './raidPlanService'
import type { ApiRaidPlan, RaidPlanWriteInput } from '../types/raidPlan'

const input: RaidPlanWriteInput = {
  raidId: 'Molten Core',
  scheduledAtUtc: '2026-09-12T14:30:00.000Z',
  raidSize: 40,
  notes: 'Progression night',
  raiders: [],
}

const storedPlan: ApiRaidPlan = {
  id: 'plan/1',
  userId: 'user-1',
  ...input,
  createdAtUtc: '2026-09-01T12:00:00.000Z',
  updatedAtUtc: '2026-09-01T12:00:00.000Z',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('raid plan service', () => {
  it('uses authenticated CRUD requests and encodes plan identifiers', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse([storedPlan]))
      .mockResolvedValueOnce(jsonResponse(storedPlan, 201))
      .mockResolvedValueOnce(jsonResponse(storedPlan))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getRaidPlans()).resolves.toEqual([storedPlan])
    await expect(createRaidPlan(input)).resolves.toEqual(storedPlan)
    await expect(updateRaidPlan(storedPlan.id, input)).resolves.toEqual(storedPlan)
    await expect(deleteRaidPlan(storedPlan.id)).resolves.toBeUndefined()

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/raid-plans', expect.objectContaining({ credentials: 'include', method: 'GET' }))
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/raid-plans',
      expect.objectContaining({ credentials: 'include', method: 'POST', body: JSON.stringify(input) }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      '/api/raid-plans/plan%2F1',
      expect.objectContaining({ credentials: 'include', method: 'PATCH', body: JSON.stringify(input) }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(4, '/api/raid-plans/plan%2F1', expect.objectContaining({ credentials: 'include', method: 'DELETE' }))
  })
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}
