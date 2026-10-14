// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../../../auth/AuthContext'
import { readLocalRaidPlan, writeLocalRaidPlan } from '../storage/localRaidPlanStorage'
import { emptyRaidPlan, type ApiRaidPlan, type RaidPlan } from '../types/raidPlan'
import RaidPlannerWorkspace from './RaidPlannerWorkspace'

vi.mock('../../../auth/AuthContext', () => ({ useAuth: vi.fn() }))

const savedLocalPlan: RaidPlan = {
  ...emptyRaidPlan(),
  id: 'local-plan',
  raid: 'Molten Core',
  date: '2026-10-14',
  startTime: '19:07',
  notes: 'Progression night',
  updatedAt: '2026-10-13T12:00:00.000Z',
}
let container: HTMLDivElement
let root: Root
let accountPlans: ApiRaidPlan[]
let requests: { method: string; path: string; body: Record<string, unknown> | undefined }[]

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-14T12:00:00'))
  window.localStorage.clear()
  window.history.replaceState(null, '', '/tools/raid-planner')
  vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, login: vi.fn(), register: vi.fn(), updateProfile: vi.fn(), logout: vi.fn() })
  accountPlans = []
  requests = []
  vi.stubGlobal('fetch', vi.fn(async (path: string, options: RequestInit) => {
    const method = options.method ?? 'GET'
    const body = options.body ? JSON.parse(String(options.body)) : undefined
    requests.push({ method, path, body })
    if (method === 'GET') return Response.json(accountPlans)
    if (method === 'PATCH') {
      const index = accountPlans.findIndex((plan) => path === `/api/raid-plans/${plan.id}`)
      if (index < 0) return new Response(null, { status: 404 })
      accountPlans[index] = { ...accountPlans[index], ...body, updatedAtUtc: new Date().toISOString() }
      return Response.json(accountPlans[index])
    }
    throw new Error(`Unexpected request: ${method} ${path}`)
  }))
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  window.localStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('raid scheduling with shared pickers', () => {
  it('creates an anonymous raid, saves local fields, and restores them after remounting', async () => {
    await renderWorkspace()
    await click('Select raid')
    await click('Molten Core')
    await click('Select raid date')
    await click('Wednesday, October 14, 2026')
    await selectTime('12', '15', 'AM')
    await click('Create raid')

    expect(readLocalRaidPlan()).toMatchObject({ raid: 'Molten Core', date: '2026-10-14', startTime: '00:15' })
    expect(container.textContent).toContain('Raid saved in this browser')
    expect(button('Saved').disabled).toBe(true)
    const savedId = readLocalRaidPlan()?.id

    await reloadWorkspace()
    expect(button('Select raid date').textContent).toContain('Oct 14, 2026')
    expect(button('Select raid start time').textContent).toContain('12:15 AM')
    expect(container.textContent).toContain('Your locally saved raid has been restored')
    await selectTime('12', '30', 'PM')
    await click('Save changes')
    expect(readLocalRaidPlan()).toMatchObject({ id: savedId, startTime: '12:30' })
    expect(requests).toEqual([])
  })

  it('edits a selected account raid, sends UTC in PATCH, and restores local values on reload', async () => {
    signIn()
    accountPlans = [apiPlan('first', '2026-09-01', '18:00'), apiPlan('second', '2026-10-14', '19:07')]
    await renderWorkspace()
    const select = container.querySelector('select')!
    await act(async () => {
      select.value = 'second'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(button('Select raid date').textContent).toContain('Oct 14, 2026')
    expect(button('Select raid start time').textContent).toContain('07:07 PM')
    await click('Select raid start time')
    expect(button('07', timeFieldset('Minute')).getAttribute('aria-pressed')).toBe('true')
    await click('Done')
    expect(button('Saved').disabled).toBe(true)

    await click('Select raid date')
    expect(button('Wednesday, October 14, 2026').getAttribute('aria-pressed')).toBe('true')
    await click('Thursday, October 15, 2026')
    await selectTime('11', '45', 'PM')
    await click('Save changes')
    expect(requests.filter((request) => request.method === 'PATCH')).toEqual([{
      method: 'PATCH',
      path: '/api/raid-plans/second',
      body: { raidId: 'Molten Core', scheduledAtUtc: new Date('2026-10-15T23:45:00').toISOString(), raidSize: 40, notes: '', raiders: [] },
    }])
    expect(accountPlans[0].scheduledAtUtc).toBe(new Date('2026-09-01T18:00:00').toISOString())
    expect(readLocalRaidPlan()).toBeNull()

    await reloadWorkspace()
    expect(container.querySelector('select')?.value).toBe('second')
    expect(button('Select raid date').textContent).toContain('Oct 15, 2026')
    expect(button('Select raid start time').textContent).toContain('11:45 PM')
    expect(button('Saved').disabled).toBe(true)
  })

  it('keeps the saved schedule when date or time is cleared and returns focus to the trigger', async () => {
    writeLocalRaidPlan(savedLocalPlan)
    await renderWorkspace()
    await click('Select raid date')
    await click('Clear')
    expect(document.activeElement).toBe(button('Select raid date'))
    await click('Save changes')
    expect(container.querySelector('[role="alert"]')?.textContent).toBe('Choose a raid, date, and start time first.')
    expect(readLocalRaidPlan()).toEqual(savedLocalPlan)

    await reloadWorkspace()
    await click('Select raid start time')
    await click('Clear')
    expect(document.activeElement).toBe(button('Select raid start time'))
    expect(button('Select raid start time').textContent).toContain('Choose time')
    await click('Save changes')
    expect(readLocalRaidPlan()).toEqual(savedLocalPlan)
    await click('Select raid start time')
    await click('Done')
    expect(button('Select raid start time').textContent).toContain('12:00 PM')
    await click('Save changes')
    expect(readLocalRaidPlan()?.startTime).toBe('12:00')
  })

  it('rejects impossible dates from browser storage without overwriting the saved plan', async () => {
    const invalidPlan = { ...savedLocalPlan, date: '2026-02-30' }
    writeLocalRaidPlan(invalidPlan)
    await renderWorkspace()
    expect(button('Select raid date').textContent).toContain('Choose date')
    await click('Select raid')
    await click('Blackwing Lair')
    await click('Save changes')
    expect(container.querySelector('[role="alert"]')?.textContent).toBe('Choose a valid raid date and start time')
    expect(readLocalRaidPlan()).toEqual(invalidPlan)
    expect(requests).toEqual([])
    expect(container.querySelector('a[target="_blank"]')?.getAttribute('href')).not.toMatch(/NaN|dates=/)
  })

  it('does not disguise an invalid stored time as noon', async () => {
    writeLocalRaidPlan({ ...savedLocalPlan, startTime: '25:00' })
    await renderWorkspace()
    expect(button('Select raid start time').textContent).toContain('Choose time')
    await click('Select raid start time')
    await click('Done')
    await click('Save changes')
    expect(readLocalRaidPlan()?.startTime).toBe('12:00')
  })

  it('keeps unsaved changes and the previous local plan if browser storage cannot be written', async () => {
    writeLocalRaidPlan(savedLocalPlan)
    await renderWorkspace()
    await selectTime('08', '30', 'PM')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage is full') })
    await click('Save changes')
    expect(container.querySelector('[role="alert"]')?.textContent).toBe('Storage is full')
    expect(button('Select raid start time').textContent).toContain('08:30 PM')
    expect(button('Save changes').disabled).toBe(false)
    expect(readLocalRaidPlan()).toEqual(savedLocalPlan)
    expect(requests).toEqual([])
  })

  it('starts with an empty draft when browser storage contains malformed JSON', async () => {
    window.localStorage.setItem('wowiki:raid-planner:v1', '{broken')
    await renderWorkspace()
    expect(button('Select raid date').textContent).toContain('Choose date')
    expect(button('Create raid').disabled).toBe(false)
    expect(requests).toEqual([])
  })
})

function signIn(): void {
  vi.mocked(useAuth).mockReturnValue({
    ...vi.mocked(useAuth)(),
    user: { id: 'user-1', displayName: 'Raider', email: 'raider@example.com', createdAtUtc: '2026-01-01T00:00:00.000Z', roles: [] },
  })
}

function apiPlan(id: string, date: string, startTime: string): ApiRaidPlan {
  return {
    id, userId: 'user-1', raidId: 'Molten Core', scheduledAtUtc: new Date(`${date}T${startTime}:00`).toISOString(),
    raidSize: 40, notes: '', raiders: [], createdAtUtc: '2026-01-01T00:00:00.000Z', updatedAtUtc: '2026-01-01T00:00:00.000Z',
  }
}

async function renderWorkspace(): Promise<void> {
  await act(async () => root.render(<MemoryRouter><RaidPlannerWorkspace /></MemoryRouter>))
}

async function reloadWorkspace(): Promise<void> {
  await act(async () => root.unmount())
  root = createRoot(container)
  await renderWorkspace()
}

function button(label: string, scope: ParentNode = container): HTMLButtonElement {
  const match = Array.from(scope.querySelectorAll('button')).find((candidate) => candidate.getAttribute('aria-label') === label || candidate.textContent?.trim() === label)
  expect(match, `Button: ${label}`).toBeDefined()
  return match!
}

async function click(label: string, scope: ParentNode = container): Promise<void> {
  await act(async () => button(label, scope).click())
}

function timeFieldset(legend: string): HTMLFieldSetElement {
  return Array.from(container.querySelectorAll('fieldset')).find((fieldset) => fieldset.querySelector('legend')?.textContent === legend)!
}

async function selectTime(hour: string, minute: string, period: string): Promise<void> {
  await click('Select raid start time')
  await click(hour, timeFieldset('Hour'))
  await click(minute, timeFieldset('Minute'))
  await click(period, timeFieldset('Period'))
  await click('Done')
}
