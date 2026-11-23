// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { HttpError } from '../../../shared/api/http'
import { useAuth } from '../../auth/AuthContext'
import { deleteNewsArticle, fetchEditorArticle, fetchEditorNews, fetchSchedulingAvailability, publishNewsNow, removeNewsSchedule, retryNewsSchedule, saveNewsContent, saveNewsSchedule } from '../api/newsService'
import type { EditorNews } from '../types/news'
import NewsEditorPage from './NewsEditorPage'

vi.mock('../../../components/layout/AppHeader', () => ({ default: () => null }))
vi.mock('../../auth/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../api/newsService', () => ({
  deleteNewsArticle: vi.fn(),
  fetchEditorArticle: vi.fn(),
  fetchEditorNews: vi.fn(),
  fetchSchedulingAvailability: vi.fn(),
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
  vi.mocked(fetchSchedulingAvailability).mockResolvedValue('available')
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2030-07-01T08:20:00.000Z'))
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
  vi.useRealTimers()
})

it('lets an editor save a CET/CEST schedule, then publish it explicitly', async () => {
  await renderEditor('moderator')
  expect(details()).toBeNull()
  vi.mocked(saveNewsContent).mockResolvedValue(draft)
  await setField('title', draft.title)
  await setField('summary', draft.summary)
  await setField('category', draft.category)
  await setField('content', draft.content)
  await act(async () => button('Save draft').click())
  expect(saveNewsContent).toHaveBeenCalledWith(undefined, {
    title: draft.title, summary: draft.summary, content: draft.content, category: draft.category, imageUrl: null,
  })
  expect(container.textContent).toContain('Draft saved.')
  expect(detailValue('Status')).toContain('Draft')
  expect(detailValue('Article ID')).toBe(draft.id)

  expect(container.textContent).toContain('EU (CET/CEST)')
  expect(container.querySelector('[name="timeZone"]')).toBeNull()
  const savedSchedule = { ...draft, status: 'scheduled' as const, scheduledAtUtc: '2030-07-01T10:00:00.000Z', scheduleId: 'news-schedule', taskForgeJobId: 'publication-job', enforcePublicationDeadline: true }
  vi.mocked(saveNewsSchedule).mockResolvedValue(savedSchedule)
  await chooseDate('July 1, 2030')
  await setField('publicationTime', '12:00')
  await act(async () => field('deadline').click())
  await act(async () => button('Save schedule').click())
  expect(saveNewsSchedule).toHaveBeenCalledWith(draft.id, '2030-07-01T12:00', true)
  expect(container.textContent).toContain('Publication scheduled.')
  expect(datePicker().textContent).toContain('Jul 01, 2030')
  expect(field('publicationTime').value).toBe('12:00')
  expect(detailValue('Status')).toBe('Scheduled')
  expect(detailValue('Job ID')).toBe(savedSchedule.taskForgeJobId)

  vi.mocked(publishNewsNow).mockResolvedValue({ ...draft, status: 'published' })
  await act(async () => button('Publish Now').click())
  expect(publishNewsNow).toHaveBeenCalledWith(draft.id)
  expect(container.textContent).toContain('Article published.')
  expect(container.querySelector('a[href="/news/15"]')?.textContent).toBe('View article')
  expect(detailValue('Status')).toBe('Published')
  expect(details()?.querySelector('a[href="#publication-heading"]')).toBeNull()
  expect(container.textContent).not.toContain('This article is publicly visible.')
})

it('updates saved metadata when selecting or reopening an article', async () => {
  const secondDraft = { ...draft, id: '16', title: 'Second draft', author: 'Second author', viewerCount: 1234, likeCount: 0 }
  await renderEditor('moderator', [draft, secondDraft])
  await selectDraft()
  expect(detailValue('Author')).toBe(draft.author)
  expect(detailValue('Views')).toBeUndefined()
  await act(async () => articleButton(secondDraft.title).click())
  expect(detailValue('Article ID')).toBe(secondDraft.id)
  expect(detailValue('Author')).toBe(secondDraft.author)
  expect(detailValue('Views')).toBe('1,234')
  expect(detailValue('Likes')).toBe('0')
  const revised = { ...secondDraft, likeCount: 2 }
  vi.mocked(fetchEditorArticle).mockResolvedValueOnce(revised)
  await act(async () => articleButton(secondDraft.title).click())
  expect(detailValue('Likes')).toBe('2')
})

it('lists each detail on its own row without headings, icons, or toggles', async () => {
  await renderEditor('moderator', [draft])
  await selectDraft()
  expect([...(details()?.querySelectorAll('dl > div') ?? [])].map((row) => row.querySelector('dt')?.textContent)).toEqual([
    'Status', 'Article ID', 'Author', 'Last updated (EU)', 'Schedule',
  ])
  expect(details()?.textContent).toContain('No saved schedule.')
  expect(details()?.querySelector('h2, svg, button, [aria-expanded]')).toBeNull()
})

it('does not load the editorial list for a regular user', async () => {
  await renderEditor('user')
  expect(fetchEditorNews).not.toHaveBeenCalled()
  expect(fetchSchedulingAvailability).not.toHaveBeenCalled()
  expect(container.textContent).toContain('You need a moderator or administrator account')
})

it('handles submission failure after a successful check and preserves the pending schedule for retry', async () => {
  const pending = { ...draft, scheduledAtUtc: '2030-07-01T10:00:00.000Z', scheduleId: 'pending-schedule' }
  await renderEditor('moderator', [draft])
  await selectDraft()
  expect(container.textContent).toContain('Scheduling system is online.')
  vi.mocked(saveNewsSchedule).mockRejectedValue(new HttpError('The scheduling system did not confirm the schedule. Retry registration for this draft.', 503))
  vi.mocked(fetchEditorArticle).mockResolvedValue(pending)
  vi.mocked(retryNewsSchedule).mockResolvedValue({ ...pending, status: 'scheduled' })
  await setField('publicationTime', '12:00')
  await act(async () => button('Save schedule').click())
  expect(container.textContent).toContain('The scheduling system did not confirm the schedule.')
  expect(container.textContent).toContain('Scheduling system is unavailable.')
  expect(detailValue('Schedule ID')).toBe('pending-schedule')
  expect(detailValue('Registration')).toBe('Pending')
  expect(details()?.querySelector('a[href="#publication-heading"]')?.textContent).toBe('Edit schedule')
  expect(button('Retry registration').disabled).toBe(true)
  expect(fetchSchedulingAvailability).toHaveBeenCalledTimes(1)
  await act(async () => button('Retry').click())
  await act(async () => button('Retry registration').click())
  expect(retryNewsSchedule).toHaveBeenCalledWith(draft.id)
  expect(container.textContent).toContain('Publication scheduled.')
  expect(container.textContent).not.toContain('Retry registration')
})

it('checks availability on open and recovers from a failed request after Retry', async () => {
  let failCheck!: (error: Error) => void
  vi.mocked(fetchSchedulingAvailability).mockImplementationOnce(() => new Promise((_resolve, reject) => { failCheck = reject }))
  await renderEditor('moderator', [draft])
  await selectDraft()
  expect(container.textContent).toContain('Checking scheduling system...')
  expect(button('Save schedule').disabled).toBe(true)
  expect(button('Publish Now').matches(':disabled')).toBe(false)
  await act(async () => failCheck(new Error('Connection timed out')))
  expect(container.textContent).toContain('Scheduling system is unavailable.')
  expect(datePicker().disabled).toBe(true)
  await act(async () => button('Retry').click())
  expect(fetchSchedulingAvailability).toHaveBeenCalledTimes(2)
  expect(container.textContent).toContain('Scheduling system is online.')
  expect(button('Save schedule').disabled).toBe(false)
  expect(datePicker().disabled).toBe(false)
})

it.each([
  ['unavailable', 'Scheduling system is unavailable.'],
  ['not-configured', 'Scheduling system is not configured.'],
] as const)('keeps editorial actions available while scheduling is %s', async (availability, message) => {
  vi.mocked(fetchSchedulingAvailability).mockResolvedValue(availability)
  const scheduled = { ...draft, status: 'scheduled' as const, scheduledAtUtc: '2030-07-01T10:00:00.000Z' }
  await renderEditor('moderator', [scheduled])
  expect(container.textContent).toContain(message)
  expect(button('Save draft').matches(':disabled')).toBe(false)
  await selectDraft()
  expect(detailValue('Status')).toBe('Scheduled')
  expect(button('Retry')).toBeUndefined()
  expect(button('Reschedule').disabled).toBe(true)
  expect(button('Remove schedule').disabled).toBe(true)
  expect(field('publicationTime').matches(':disabled')).toBe(true)
  expect(field('deadline').matches(':disabled')).toBe(true)
  expect(button('Delete').matches(':disabled')).toBe(false)
  await setField('title', 'Edited during the outage')
  vi.mocked(saveNewsContent).mockResolvedValue({ ...scheduled, title: 'Edited during the outage' })
  await act(async () => button('Save changes').click())
  expect(saveNewsContent).toHaveBeenCalledWith(draft.id, expect.objectContaining({ title: 'Edited during the outage' }))
  vi.mocked(publishNewsNow).mockResolvedValue({ ...draft, status: 'published' })
  await act(async () => button('Publish Now').click())
  expect(publishNewsNow).toHaveBeenCalledWith(draft.id)
  expect(detailValue('Status')).toBe('Published')
  expect(saveNewsSchedule).not.toHaveBeenCalled()
  expect(removeNewsSchedule).not.toHaveBeenCalled()
  expect(fetchSchedulingAvailability).toHaveBeenCalledTimes(1)
})

it.each([
  ['2030-01-01T11:00:00.000Z', 'Jan 01, 2030'],
  ['2030-07-01T10:00:00.000Z', 'Jul 01, 2030'],
])('reopens %s in EU local time', async (scheduledAtUtc, expectedDate) => {
  await renderEditor('moderator', [{ ...draft, scheduledAtUtc }])
  await selectDraft()
  expect(datePicker().textContent).toContain(expectedDate)
  expect(field('publicationTime').value).toBe('12:00')
})

it.each([
  ['2029-12-31T22:30:00Z', 'Jan 01, 2030', '00:30'],
  ['2030-07-01T08:20:00Z', 'Jul 01, 2030', '11:20'],
])('defaults an unscheduled draft to one hour after %s without marking it dirty', async (now, date, time) => {
  vi.setSystemTime(new Date(now))
  await renderEditor('moderator', [draft])
  await selectDraft()
  expect(datePicker().textContent).toContain(date)
  expect(field('publicationTime').value).toBe(time)
  expect(container.textContent).not.toContain('Unsaved changes')
})

it('disables past calendar dates and rejects a past time before saving', async () => {
  await renderEditor('moderator', [draft])
  await selectDraft()
  await act(async () => datePicker().click())
  expect(calendarDay('June 30, 2030').disabled).toBe(true)
  await act(async () => calendarDay('July 1, 2030').click())
  await setField('publicationTime', '10:00')
  await act(async () => button('Save schedule').click())
  expect(saveNewsSchedule).not.toHaveBeenCalled()
  expect(container.textContent).toContain('Choose a future publication date and time')
})

it('offers the seeded categories and keeps a saved legacy category until explicitly changed', async () => {
  const legacy = { ...draft, category: ' Legacy category ' }
  await renderEditor('moderator', [legacy])
  const category = field('category') as HTMLSelectElement
  expect([...category.options].map(({ value }) => value)).toEqual(['', 'News', 'Lore', 'Patch Notes', 'Exploration', 'Guides', 'Events'])
  await selectDraft()
  expect(category.value).toBe(legacy.category)
  expect(category.selectedOptions[0].textContent).toContain('(existing)')
  await setField('title', 'New title')
  vi.mocked(saveNewsContent).mockResolvedValue({ ...legacy, title: 'New title' })
  await act(async () => button('Save changes').click())
  expect(saveNewsContent).toHaveBeenLastCalledWith(draft.id, expect.objectContaining({ category: legacy.category }))
  await setField('category', 'Exploration')
  vi.mocked(saveNewsContent).mockResolvedValue({ ...legacy, title: 'New title', category: 'Exploration' })
  await act(async () => button('Save changes').click())
  expect(saveNewsContent).toHaveBeenLastCalledWith(draft.id, expect.objectContaining({ category: 'Exploration' }))
})

it('protects unsaved content and keeps saves scoped to the selected article', async () => {
  const other = { ...draft, id: '16', title: 'Another article' }
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
  try {
    await renderEditor('moderator', [draft, other])
    await selectDraft()
    await setField('title', 'Unsaved title')
    await act(async () => articleButton(other.title).click())
    expect(confirm).toHaveBeenCalledOnce()
    expect(field('title').value).toBe('Unsaved title')
    expect(fetchEditorArticle).not.toHaveBeenCalledWith(other.id)

    confirm.mockReturnValue(true)
    await act(async () => articleButton(other.title).click())
    expect(field('title').value).toBe(other.title)
    await setField('title', 'Revised title')
    vi.mocked(saveNewsContent).mockResolvedValue({ ...other, title: 'Revised title' })
    await act(async () => button('Save changes').click())
    expect(saveNewsContent).toHaveBeenCalledWith(other.id, expect.objectContaining({ title: 'Revised title' }))
    await act(async () => button('New Article').click())
    expect(field('title').value).toBe('')
    expect(confirm).toHaveBeenCalledTimes(2)
  } finally {
    confirm.mockRestore()
  }
})

it('reschedules a saved article with the deadline and can remove its schedule', async () => {
  const scheduled = { ...draft, status: 'scheduled' as const, scheduledAtUtc: '2030-07-01T10:00:00.000Z' }
  await renderEditor('moderator', [scheduled])
  await selectDraft()
  await setField('publicationTime', '13:15')
  await act(async () => field('deadline').click())
  vi.mocked(saveNewsSchedule).mockResolvedValue({ ...scheduled, scheduledAtUtc: '2030-07-01T11:15:00.000Z', enforcePublicationDeadline: true })
  await act(async () => button('Reschedule').click())
  expect(saveNewsSchedule).toHaveBeenCalledWith(draft.id, '2030-07-01T13:15', true)
  vi.mocked(removeNewsSchedule).mockResolvedValue(draft)
  await act(async () => button('Remove schedule').click())
  expect(removeNewsSchedule).toHaveBeenCalledWith(draft.id)
  expect(field('publicationTime').value).toBe('11:20')
  expect(container.textContent).toContain('Schedule removed.')
})

it('confirms deletion, preserves the editor on failure, and refreshes Articles on success', async () => {
  const scheduled = { ...draft, status: 'scheduled' as const, scheduledAtUtc: '2030-07-01T13:00:00.000Z' }
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
  try {
    await renderEditor('moderator', [scheduled])
    await selectDraft()
    await act(async () => button('Delete').click())
    expect(confirm).toHaveBeenCalledWith(`Permanently delete “${draft.title}”?`)
    expect(deleteNewsArticle).not.toHaveBeenCalled()

    confirm.mockReturnValue(true)
    vi.mocked(deleteNewsArticle).mockRejectedValueOnce(new Error('Deletion failed'))
    await act(async () => button('Delete').click())
    expect(field('title').value).toBe(draft.title)
    expect(container.textContent).toContain('Deletion failed')

    let completeDeletion!: () => void
    vi.mocked(deleteNewsArticle).mockImplementationOnce(() => new Promise<void>((resolve) => { completeDeletion = resolve }))
    vi.mocked(fetchEditorNews).mockResolvedValue([])
    await act(async () => button('Delete').click())
    expect(button('Deleting…').matches(':disabled')).toBe(true)
    await act(async () => completeDeletion())
    expect(deleteNewsArticle).toHaveBeenLastCalledWith(draft.id)
    expect(container.querySelector('#article-heading')?.textContent).toBe('New Article')
    expect(field('title').value).toBe('')
    expect(articleButton(draft.title)).toBeUndefined()
    expect(container.textContent).toContain('Article deleted.')
    expect(details()).toBeNull()
  } finally {
    confirm.mockRestore()
  }
})

async function selectDraft() {
  await act(async () => articleButton(draft.title).click())
}

function details() {
  return container.querySelector<HTMLElement>('aside[aria-label="Article details"]')
}

function detailValue(label: string) {
  return [...(details()?.querySelectorAll('dt') ?? [])].find((term) => term.textContent === label)?.nextElementSibling?.textContent
}

function articleButton(title: string): HTMLButtonElement {
  return [...container.querySelectorAll<HTMLButtonElement>('#articles li > button')].find((item) => item.textContent?.startsWith(title))!
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
  vi.mocked(fetchEditorArticle).mockImplementation(async (id) => articles.find((article) => article.id === id)!)
  const router = createMemoryRouter([{ path: '/', element: <NewsEditorPage /> }])
  await act(async () => root.render(<RouterProvider router={router} />))
}

function field(name: string) {
  return container.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${name}"]`)!
}

async function setField(name: string, value: string) {
  const input = field(name)
  await act(async () => {
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')!.set!.call(input, value)
    input.dispatchEvent(new Event(input instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
  })
}

function button(label: string): HTMLButtonElement {
  return [...container.querySelectorAll('button')].find((item) => item.textContent?.replace(/^\+/, '') === label)!
}

function datePicker(): HTMLButtonElement {
  return container.querySelector('button[aria-label="Publication date"]')!
}

function calendarDay(date: string): HTMLButtonElement {
  return [...container.querySelectorAll<HTMLButtonElement>('[role="grid"] button')].find((item) => item.getAttribute('aria-label')?.endsWith(date))!
}

async function chooseDate(date: string) {
  await act(async () => datePicker().click())
  await act(async () => calendarDay(date).click())
}
