import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const password = 'PortfolioPass123'
const newsInput = { title: 'Portfolio moderation check', summary: 'A moderator-published update.', content: 'Content created through the real gateway and authorization service.', category: 'Community' }

async function register(request: APIRequestContext, moderator = false) {
  const email = `portfolio-${randomUUID()}@example.test`
  const response = await request.post('/api/auth/register', { data: { email, password, displayName: 'PortfolioTester' } })
  expect(response.status()).toBe(201)
  const user = await response.json()
  if (moderator) {
    const database = new DatabaseSync(join(process.env.WOWIKI_E2E_DIRECTORY!, 'auth.db'))
    try {
      database.prepare('INSERT INTO AspNetUserRoles (UserId, RoleId) SELECT ?, Id FROM AspNetRoles WHERE NormalizedName = ?').run(user.id, 'MODERATOR')
    } finally {
      database.close()
    }
    expect((await request.post('/api/auth/logout')).status()).toBe(204)
    expect((await request.post('/api/auth/login', { data: { email, password } })).status()).toBe(200)
  }
  return { email, ...user }
}

async function login(page: Page, email: string) {
  await page.goto('/auth')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL('/')
}

test('register, sign in, bookmark a story, and restore it after reload', async ({ page, request }) => {
  await register(request, true)
  const created = await request.post('/api/news', { data: { ...newsInput, title: 'A story to bookmark' } })
  expect(created.status()).toBe(201)
  const story = await created.json()
  const email = `reader-${randomUUID()}@example.test`
  await page.goto('/auth')
  await page.getByRole('button', { name: 'Need an account? Register' }).click()
  await page.getByLabel('Display name').fill('PortfolioReader')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel(/^Password/).fill(password)
  await page.getByLabel('Confirm password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL('/')
  expect((await page.request.post('/api/auth/logout')).status()).toBe(204)
  await login(page, email)

  await page.goto(`/news/${story.id}`)
  await page.getByRole('button', { name: `Save ${story.title}`, exact: true }).click()
  await expect(page.getByRole('button', { name: `Remove ${story.title} from saved items`, exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.goto('/bookmarks')
  await page.reload()
  await expect(page.getByRole('heading', { name: story.title, exact: true })).toBeVisible()
  const bookmarks = await (await page.request.get('/api/bookmarks')).json()
  expect(bookmarks).toEqual(expect.arrayContaining([expect.objectContaining({ targetType: 'news', targetId: story.id })]))
})

test('a normal user cannot create moderator news content', async ({ request }) => {
  await register(request)
  const before = await (await request.get('/api/news')).json()
  const response = await request.post('/api/news', { data: newsInput })
  expect(response.status()).toBe(403)
  expect(await (await request.get('/api/news')).json()).toEqual(before)
})

test('a moderator can publish news visible on the public detail page', async ({ page }) => {
  await register(page.request, true)
  const response = await page.request.post('/api/news', { data: newsInput })
  expect(response.status()).toBe(201)
  const story = await response.json()
  await page.goto(`/news/${story.id}`)
  await expect(page.getByRole('heading', { name: newsInput.title, exact: true })).toBeVisible()
  await expect(page.getByText(newsInput.content, { exact: true })).toBeVisible()
})

test('save an account raid and retrieve the same plan after reload', async ({ page }) => {
  await register(page.request)
  await page.goto('/tools/raid-planner')
  await page.getByRole('button', { name: 'Select raid', exact: true }).click()
  await page.getByRole('menuitem', { name: 'Molten Core', exact: true }).click()
  await page.getByRole('button', { name: 'Select raid date', exact: true }).click()
  await page.getByRole('button', { name: 'Today', exact: true }).click()
  await page.getByRole('button', { name: 'Select raid start time', exact: true }).click()
  await page.getByRole('group', { name: 'Hour', exact: true }).getByRole('button', { name: '12', exact: true }).click()
  await page.getByRole('group', { name: 'Minute', exact: true }).getByRole('button', { name: '00', exact: true }).click()
  await page.getByRole('button', { name: 'PM', exact: true }).click()
  await page.getByRole('button', { name: 'Done', exact: true }).click()
  await page.getByRole('button', { name: '10', exact: true }).click()
  await page.getByLabel('Raid briefing', { exact: false }).fill('Portfolio raid persistence')
  const savedResponse = page.waitForResponse((response) => response.url().endsWith('/api/raid-plans') && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'Create raid', exact: true }).click()
  const response = await savedResponse
  expect(response.status()).toBe(201)
  const saved = await response.json()
  expect(saved).toMatchObject({ raidId: 'Molten Core', raidSize: 10, notes: 'Portfolio raid persistence' })
  expect(saved.scheduledAtUtc).toMatch(/T09:00:00\.000Z$/)
  expect(await (await page.request.get(`/api/raid-plans/${saved.id}`)).json()).toEqual(saved)
  await page.reload()
  await expect(page.getByLabel('Your saved raids')).toHaveValue(saved.id)
  await expect(page.getByLabel('Raid briefing', { exact: false })).toHaveValue('Portfolio raid persistence')
  await expect(page.getByRole('button', { name: 'Select raid start time' })).toContainText('12:00 PM')
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeDisabled()
})

test('talent ranks enforce row and prerequisite rules in both directions', async ({ page }) => {
  await page.goto('/tools/talent-calculator')
  const talent = (name: string) => page.getByRole('button', { name: new RegExp(`^${name}, rank`) })
  const add = async (name: string, count = 1) => {
    for (let index = 0; index < count; index += 1) await talent(name).click()
  }
  await add('Tactical Mastery')
  await expect(talent('Tactical Mastery')).toHaveAccessibleName('Tactical Mastery, rank 0 of 5')
  await add('Deflection', 5)
  await add('Improved Heroic Strike', 4)
  await expect(talent('Improved Heroic Strike')).toHaveAccessibleName('Improved Heroic Strike, rank 3 of 3')
  await add('Improved Charge', 2)
  await add('Anger Management')
  await expect(talent('Anger Management')).toHaveAccessibleName('Anger Management, rank 0 of 1')
  await add('Tactical Mastery', 5)
  await add('Anger Management')
  await expect(talent('Anger Management')).toHaveAccessibleName('Anger Management, rank 1 of 1')
  await talent('Tactical Mastery').click({ button: 'right' })
  await expect(talent('Tactical Mastery')).toHaveAccessibleName('Tactical Mastery, rank 5 of 5')
  await talent('Anger Management').click({ button: 'right' })
  await talent('Tactical Mastery').click({ button: 'right' })
  await expect(talent('Tactical Mastery')).toHaveAccessibleName('Tactical Mastery, rank 4 of 5')
})

test('community listing modes keep entries and navigate to details and comments', async ({ page }) => {
  await register(page.request)
  for (const title of ['Preparing for a first raid', 'Choosing a leveling route']) {
    const response = await page.request.post('/api/community', { data: { title, category: 'Discussion', excerpt: 'A portfolio community topic.', content: 'Discuss your plans with the community.' } })
    expect(response.status()).toBe(201)
  }
  await page.goto('/community')
  const entries = page.getByRole('region', { name: 'Community entries', exact: true })
  const firstEntry = entries.locator('article').first()
  await expect(firstEntry).toBeVisible()
  const count = await entries.locator('article').count()
  const title = await firstEntry.getByRole('heading').innerText()
  const path = await firstEntry.getByRole('link', { name: title, exact: true }).getAttribute('href')
  await page.getByRole('button', { name: 'View: Detail', exact: true }).click()
  await page.getByRole('button', { name: 'Card view', exact: true }).click()
  await expect(page.getByRole('button', { name: 'View: Card', exact: true })).toBeVisible()
  await expect(entries.locator('article')).toHaveCount(count)
  await firstEntry.getByRole('link', { name: title, exact: true }).click()
  await expect(page).toHaveURL(path!)
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('button', { name: 'View: Detail', exact: true })).toBeVisible()
  await firstEntry.getByRole('link', { name: /comments$/ }).click()
  await expect(page).toHaveURL(`${path}#comments-heading`)
  await expect(page.locator('#comments-heading')).toBeInViewport()
})
