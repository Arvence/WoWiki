import { describe, expect, it } from 'vitest'
import { normalizeRaidPlan, raidPlanFromApi, raidPlanToApiInput, sortRaidPlans, type ApiRaidPlan, type RaidPlan } from './raidPlan'

const localPlan: RaidPlan = {
  version: 1,
  id: 'plan-1',
  raid: 'Molten Core',
  date: '2026-09-12',
  startTime: '17:30',
  raidSize: 40,
  notes: '  Progression night  ',
  raiders: [
    { id: 'raider-1', name: 'Main Tank', playerClass: 'warrior', role: 'tank', group: 1 },
  ],
  updatedAt: '2026-09-01T12:00:00.000Z',
}

describe('raid plan mapping', () => {
  it('maps planner fields to the API contract and restores local date fields', () => {
    const input = raidPlanToApiInput(localPlan)
    expect(input).toEqual({
      raidId: 'Molten Core',
      scheduledAtUtc: new Date('2026-09-12T17:30:00').toISOString(),
      raidSize: 40,
      notes: 'Progression night',
      raiders: [
        { id: 'raider-1', name: 'Main Tank', classId: 'warrior', role: 'tank', group: 1 },
      ],
    })

    const restored = raidPlanFromApi(apiPlan({ ...input, id: 'server-plan' }))
    expect(restored).toMatchObject({
      id: 'server-plan',
      raid: localPlan.raid,
      date: localPlan.date,
      startTime: localPlan.startTime,
      raidSize: localPlan.raidSize,
      notes: 'Progression night',
      raiders: localPlan.raiders,
    })
  })

  it('normalizes browser data and removes invalid raiders', () => {
    const normalized = normalizeRaidPlan({
      ...localPlan,
      raidSize: 10,
      raiders: [
        { id: ' valid-id ', name: '  Valid Raider  ', playerClass: 'mage', role: 'damage', group: 8 },
        { id: 'invalid', name: 'Invalid Raider', playerClass: 'monk', role: 'damage', group: 1 },
      ],
    })

    expect(normalized?.raiders).toEqual([
      { id: 'valid-id', name: 'Valid Raider', playerClass: 'mage', role: 'damage', group: 2 },
    ])
  })

  it('orders account plans by most recent update without mutating input', () => {
    const older = { ...localPlan, id: 'older', updatedAt: '2026-08-01T12:00:00.000Z' }
    const newer = { ...localPlan, id: 'newer', updatedAt: '2026-08-02T12:00:00.000Z' }
    const plans = [older, newer]

    expect(sortRaidPlans(plans).map((plan) => plan.id)).toEqual(['newer', 'older'])
    expect(plans.map((plan) => plan.id)).toEqual(['older', 'newer'])
  })
})

function apiPlan(overrides: Partial<ApiRaidPlan>): ApiRaidPlan {
  return {
    id: 'plan-1',
    userId: 'user-1',
    raidId: 'Molten Core',
    scheduledAtUtc: '2026-09-12T14:30:00.000Z',
    raidSize: 40,
    notes: '',
    raiders: [],
    createdAtUtc: '2026-09-01T12:00:00.000Z',
    updatedAtUtc: '2026-09-01T12:00:00.000Z',
    ...overrides,
  }
}
