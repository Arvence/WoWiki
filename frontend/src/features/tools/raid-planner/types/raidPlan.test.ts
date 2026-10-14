import { spawnSync } from 'node:child_process'
import process from 'node:process'
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
  it.each([
    ['2026-02-30', '19:00'],
    ['2026-02-29', '19:00'],
    ['2026-04-31', '19:00'],
    ['2026-13-01', '19:00'],
    ['2026-00-10', '19:00'],
    ['2026-10-00', '19:00'],
    ['2026-1-01', '19:00'],
    ['', '19:00'],
    ['2026-10-14', '24:00'],
    ['2026-10-14', '19:60'],
    ['2026-10-14', '9:00'],
    ['2026-10-14', '19:00:00'],
    ['2026-10-14', ''],
  ])('rejects invalid local schedule %s %s', (date, startTime) => {
    expect(() => raidPlanToApiInput({ ...localPlan, date, startTime })).toThrow('Choose a valid raid date and start time')
  })

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

describe('raid schedules in different timezones', () => {
  it.each([
    ['UTC', '2026-10-14', '00:15', '2026-10-14T00:15:00.000Z'],
    ['Europe/Istanbul', '2026-10-14', '00:15', '2026-10-13T21:15:00.000Z'],
    ['Asia/Kathmandu', '2026-10-14', '00:15', '2026-10-13T18:30:00.000Z'],
    ['America/New_York', '2026-01-14', '23:45', '2026-01-15T04:45:00.000Z'],
    ['America/New_York', '2026-07-14', '23:45', '2026-07-15T03:45:00.000Z'],
    ['America/New_York', '2026-03-08', '01:30', '2026-03-08T06:30:00.000Z'],
    ['America/New_York', '2026-03-08', '03:30', '2026-03-08T07:30:00.000Z'],
    ['America/New_York', '2026-11-01', '03:30', '2026-11-01T08:30:00.000Z'],
    ['Europe/Istanbul', '2028-02-29', '12:00', '2028-02-29T09:00:00.000Z'],
  ])('round-trips %s local time %s %s through UTC', (timezone, date, startTime, utc) => {
    expect(convertInTimezone(timezone, date, startTime)).toEqual({ utc, date, startTime })
  })

  it('rejects local times skipped by daylight saving instead of silently shifting the raid', () => {
    expect(convertInTimezone('America/New_York', '2026-03-08', '02:30')).toEqual({ error: 'Choose a valid raid date and start time' })
  })
})

function convertInTimezone(timezone: string, date: string, startTime: string): unknown {
  const moduleUrl = new URL('./raidPlan.ts', import.meta.url).href
  const script = `
    import { raidPlanToApiInput, raidPlanFromApi } from ${JSON.stringify(moduleUrl)};
    try {
      const input = raidPlanToApiInput(${JSON.stringify({ ...localPlan, date, startTime })});
      const restored = raidPlanFromApi({ ...input, id: 'saved-plan' });
      console.log(JSON.stringify({ utc: input.scheduledAtUtc, date: restored.date, startTime: restored.startTime }));
    } catch (error) {
      console.log(JSON.stringify({ error: error.message }));
    }
  `
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    env: { ...process.env, TZ: timezone },
    encoding: 'utf8',
    timeout: 10_000,
  })
  expect(result.status, result.stderr || result.error?.message).toBe(0)
  return JSON.parse(result.stdout)
}

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
