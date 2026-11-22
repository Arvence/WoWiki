// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useAuth } from '../../auth/AuthContext'
import { fetchEditorNews, publishNewsNow, retryNewsSchedule, saveNewsContent, saveNewsSchedule } from '../api/newsService'
import type { EditorNews } from '../types/news'
import NewsEditorPage from './NewsEditorPage'

vi.mock('../../../components/layout/AppHeader', () => ({ default: () => null }))
vi.mock('../../auth/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../api/newsService', () => ({
  fetchEditorNews: vi.fn(),
  publishNewsNow: vi.fn(),
  removeNewsSchedule: vi.fn(),
  retryNewsSchedule: vi.fn(),
  saveNewsContent: vi.fn(),
  saveNewsSchedule: vi.fn(),
}))

const draft: EditorNews = {
  id: '15',
  title: 'Classic realm update',
  summary: 'Upcoming events',
  content: 'The full article.',
  category: 'News',
  author: 'Editor',
  updatedAt: '2030-01-01T00:00:00.000Z',
  status: 'draft',
  enforcePublicationDeadline: false,
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.resetAllMocks()
  vi.unstubAllGlobals()
})

it('lets an editor save a CET/CEST schedule, then publish it explicitly', async () => {
  await renderEditor('moderator')
  vi.mocked(saveNewsContent).mockResolvedValue(draft)
  setField('title', draft.title)
  setField('summary', draft.summary)
  setField('category', draft.category)
  setField('content', draft.content)
  await act(async () => button('Save draft').click())
  expect(saveNewsContent).toHaveBeenCalledWith(undefined, {
    title: draft.title, summary: draft.summary, content: draft.content, category: draft.category, imageUrl: null,
  })
  expect(container.textContent).toContain('Draft saved.')

  expect(container.textContent).toContain('EU (CET/CEST)')
  expect(container.querySelector('[name="timeZone"]')).toBeNull()
  vi.mocked(saveNewsSchedule).mockResolvedValue({ ...draft, status: 'scheduled', scheduledAtUtc: '2030-07-01T10:00:00.000Z' })
  setField('scheduledAtLocal', '2030-07-01T12:00')
  await act(async () => button('Save schedule').click())
  expect(saveNewsSchedule).toHaveBeenCalledWith(draft.id, '2030-07-01T12:00', false)
  expect(container.textContent).toContain('Publication scheduled.')
  expect(container.querySelector<HTMLInputElement>('[name="scheduledAtLocal"]')?.value).toBe('2030-07-01T12:00')

  vi.mocked(publishNewsNow).mockResolvedValue({ ...draft, status: 'published' })
  await act(async () => button('Publish now').click())
  expect(publishNewsNow).toHaveBeenCalledWith(draft.id)
  expect(container.textContent).toContain('Article published.')
  expect(container.querySelector('a[href="/news/15"]')?.textContent).toBe('View article')
})

it('does not load the editorial list for a regular user', async () => {
  await renderEditor('user')
  expect(fetchEditorNews).not.toHaveBeenCalled()
  expect(container.textContent).toContain('You need a moderator or administrator account')
})

it('offers a retry for a saved schedule when TaskForge did not confirm registration', async () => {
  const pending = { ...draft, scheduledAtUtc: '2030-07-01T10:00:00.000Z' }
  await renderEditor('moderator', [draft])
  await selectDraft()
  vi.mocked(saveNewsSchedule).mockRejectedValue(new Error('TaskForge did not confirm the schedule'))
  vi.mocked(fetchEditorNews).mockResolvedValue([pending])
  vi.mocked(retryNewsSchedule).mockResolvedValue({ ...pending, status: 'scheduled' })
  setField('scheduledAtLocal', '2030-07-01T12:00')
  await act(async () => button('Save schedule').click())
  expect(container.textContent).toContain('TaskForge did not confirm the schedule')
  await act(async () => button('Retry registration').click())
  expect(retryNewsSchedule).toHaveBeenCalledWith(draft.id)
  expect(container.textContent).toContain('Publication scheduled.')
  expect(container.textContent).not.toContain('Retry registration')
})

it.each([
  ['2030-01-01T11:00:00.000Z', '2030-01-01T12:00'],
  ['2030-07-01T10:00:00.000Z', '2030-07-01T12:00'],
])('reopens %s in EU local time', async (scheduledAtUtc, expectedLocalTime) => {
  await renderEditor('moderator', [{ ...draft, scheduledAtUtc }])
  await selectDraft()
  expect(container.querySelector<HTMLInputElement>('[name="scheduledAtLocal"]')?.value).toBe(expectedLocalTime)
})

async function selectDraft() {
  const select = container.querySelector('select')!
  select.value = draft.id
  await act(async () => { select.dispatchEvent(new Event('change', { bubbles: true })) })
}

async function renderEditor(role: string, articles: EditorNews[] = []) {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 'editor', displayName: 'Editor', email: 'editor@example.test', createdAtUtc: '', roles: [role] },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateProfile: vi.fn(),
  })
  vi.mocked(fetchEditorNews).mockResolvedValue(articles)
  await act(async () => root.render(<MemoryRouter><NewsEditorPage /></MemoryRouter>))
}

function setField(name: string, value: string) {
  const field = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)!
  field.value = value
}

function button(label: string): HTMLButtonElement {
  return [...container.querySelectorAll('button')].find((item) => item.textContent === label)!
}
