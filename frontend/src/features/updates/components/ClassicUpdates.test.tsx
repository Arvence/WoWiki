// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchBlueAnnouncements } from '../../blue-tracker/api/blueTrackerService'
import { blueTrackerSamples } from '../../blue-tracker/data/blueTrackerSamples'
import type { BlueAnnouncement } from '../../blue-tracker/types/announcement'
import type { News } from '../../news/types/news'
import ClassicUpdates from './ClassicUpdates'

vi.mock('../../blue-tracker/api/blueTrackerService', () => ({ fetchBlueAnnouncements: vi.fn() }))

const news: News[] = Array.from({ length: 12 }, (_, index) => ({
  id: `news-${index}`,
  title: `Classic news ${index}: a full headline that remains available when the row is truncated`,
  summary: '',
  content: '',
  category: index % 2 === 0 ? 'Guide' : 'News',
  author: 'WoWiki',
  updatedAt: new Date(Date.UTC(2026, 9, 16, 12 - index)).toISOString(),
}))

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.mocked(fetchBlueAnnouncements).mockResolvedValue([...blueTrackerSamples].reverse())
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.useRealTimers()
  vi.resetAllMocks()
  vi.unstubAllGlobals()
})

describe('Classic updates panels', () => {
  it('initially shows ten chronological entries per panel and filters regions without refetching or reshuffling', async () => {
    await renderUpdates()
    const initialTitles = titles('Blue Tracker')
    expect(initialTitles).toEqual(blueTrackerSamples.slice(0, 10).map((entry) => entry.title))
    expect(titles('Recent News')).toEqual(news.slice(0, 10).map((entry) => entry.title))
    expect(panel('Blue Tracker').textContent).toContain('Sample feed')

    for (const region of ['US', 'EU']) {
      const regionButton = Array.from(panel('Blue Tracker').querySelectorAll('button')).find((button) => button.textContent === region)!
      await act(async () => regionButton.click())
      expect(regionButton.getAttribute('aria-pressed')).toBe('true')
      expect(titles('Blue Tracker')).toEqual(blueTrackerSamples.filter((entry) => entry.region === region).map((entry) => entry.title))
      expect(button('View all Blue Tracker').disabled).toBe(true)
      expect(titles('Recent News')).toHaveLength(10)
    }

    const all = panel('Blue Tracker').querySelector('button[aria-pressed="false"]') as HTMLButtonElement
    expect(all.textContent).toBe('ALL')
    await act(async () => all.click())
    await click('View all Recent News')
    await renderUpdates([...news])
    expect(titles('Blue Tracker')).toEqual(initialTitles)
    expect(fetchBlueAnnouncements).toHaveBeenCalledTimes(1)
  })

  it('expands, limits, collapses and restores each panel independently', async () => {
    await renderUpdates()
    await click('View all Blue Tracker')
    expect(titles('Blue Tracker')).toHaveLength(16)
    expect(titles('Recent News')).toHaveLength(10)
    await click('Collapse Blue Tracker')
    expect(panelBody('Blue Tracker').hidden).toBe(true)
    expect(panelBody('Recent News').hidden).toBe(false)
    expect(button('Expand Blue Tracker').getAttribute('aria-expanded')).toBe('false')

    await click('View all Recent News')
    expect(titles('Recent News')).toHaveLength(12)
    expect(panelBody('Blue Tracker').hidden).toBe(true)
    await click('Expand Blue Tracker')
    expect(titles('Blue Tracker')).toHaveLength(16)
    await click('Show less Blue Tracker')
    expect(titles('Blue Tracker')).toHaveLength(10)
    await click('Collapse Recent News')
    expect(panelBody('Recent News').hidden).toBe(true)
    expect(panelBody('Blue Tracker').hidden).toBe(false)
    await click('Expand Recent News')
    await click('Show less Recent News')
    expect(titles('Recent News')).toHaveLength(10)
  })

  it('links existing news and real announcement URLs while leaving samples as focusable text', async () => {
    vi.mocked(fetchBlueAnnouncements).mockResolvedValue([
      { ...blueTrackerSamples[0], url: 'https://us.forums.blizzard.com/en/wow/' },
      blueTrackerSamples[1],
    ])
    await renderUpdates()
    const tracker = panel('Blue Tracker')
    expect(tracker.querySelector('a')?.getAttribute('href')).toBe('https://us.forums.blizzard.com/en/wow/')
    expect(tracker.querySelectorAll('a')).toHaveLength(1)
    expect(tracker.querySelector('li:nth-child(2) [tabindex="0"]')).not.toBeNull()

    const articleLink = panel('Recent News').querySelector('a')!
    expect(articleLink.getAttribute('href')).toBe('/news/news-0')
    await act(async () => articleLink.click())
    expect(container.querySelector('[data-location]')?.textContent).toBe('/news/news-0')
  })

  it('reveals full titles on keyboard focus and hover, and keeps Customize Feed accessible without an action', async () => {
    vi.useFakeTimers()
    await renderUpdates()
    const articleLink = panel('Recent News').querySelector('a')!
    await act(async () => articleLink.focus())
    await act(async () => vi.advanceTimersByTime(250))
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(news[0].title)
    await act(async () => articleLink.blur())
    expect(document.querySelector('[role="tooltip"]')).toBeNull()

    const sample = panel('Blue Tracker').querySelector('[tabindex="0"]') as HTMLElement
    await act(async () => sample.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })))
    await act(async () => vi.advanceTimersByTime(250))
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(blueTrackerSamples[0].title)
    await act(async () => sample.dispatchEvent(new MouseEvent('mouseout', { bubbles: true })))

    const customize = button('Customize Feed')
    expect(customize.textContent).toBe('')
    expect(customize.getAttribute('aria-disabled')).toBe('true')
    await act(async () => customize.focus())
    await act(async () => vi.advanceTimersByTime(250))
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe('Customize Feed — coming later')
    await act(async () => customize.click())
    expect(container.querySelector('[data-location]')?.textContent).toBe('/')
    expect(container.querySelector('[role="dialog"]')).toBeNull()
    expect(panel('Recent News').querySelector('select, [role="group"], [aria-pressed]')).toBeNull()
  })

  it('keeps news usable while announcements load and handles an empty region feed', async () => {
    let resolveAnnouncements!: (entries: BlueAnnouncement[]) => void
    vi.mocked(fetchBlueAnnouncements).mockReturnValue(new Promise((resolve) => { resolveAnnouncements = resolve }))
    await renderUpdates()
    expect(panel('Blue Tracker').querySelector('[role="status"]')?.textContent).toContain('Loading')
    expect(titles('Recent News')).toHaveLength(10)
    await act(async () => resolveAnnouncements([]))
    expect(panel('Blue Tracker').textContent).toContain('No announcements are available for this region.')
    expect(panelBody('Blue Tracker').getAttribute('aria-busy')).toBe('false')
  })

  it('keeps news usable when the announcement source fails', async () => {
    vi.mocked(fetchBlueAnnouncements).mockRejectedValue(new Error('Source unavailable'))
    await renderUpdates()
    expect(panel('Blue Tracker').querySelector('[role="alert"]')?.textContent).toBe('Blue Tracker could not be loaded.')
    expect(titles('Recent News')).toHaveLength(10)
  })

  it.each([
    { loading: true, error: null, message: 'Loading recent news…' },
    { loading: false, error: 'Network failure', message: 'Recent News could not be loaded.' },
    { loading: false, error: null, message: 'No Classic news is available.' },
  ])('keeps Blue Tracker usable when news shows $message', async ({ loading, error, message }) => {
    await renderUpdates([], loading, error)
    expect(panel('Recent News').textContent).toContain(message)
    expect(button('View all Recent News').disabled).toBe(true)
    await click('View all Blue Tracker')
    expect(titles('Blue Tracker')).toHaveLength(16)
  })
})

function LocationProbe(): JSX.Element {
  return <span data-location>{useLocation().pathname}</span>
}

async function renderUpdates(items = news, loading = false, error: string | null = null): Promise<void> {
  await act(async () => root.render(<MemoryRouter><ClassicUpdates news={items} loading={loading} error={error} /><LocationProbe /></MemoryRouter>))
}

function panel(title: string): HTMLElement {
  return Array.from(container.querySelectorAll('h2')).find((heading) => heading.textContent === title)!.closest('section')!
}

function panelBody(title: string): HTMLDivElement {
  return panel(title).querySelector('[aria-busy]')!
}

function titles(title: string): (string | null | undefined)[] {
  return Array.from(panel(title).querySelectorAll('li time'), (time) => time.nextElementSibling?.textContent)
}

function button(label: string): HTMLButtonElement {
  return container.querySelector(`button[aria-label="${label}"]`)!
}

async function click(label: string): Promise<void> {
  await act(async () => button(label).click())
}
