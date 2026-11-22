const assert = require('node:assert/strict')
const { mkdtempSync, rmSync } = require('node:fs')
const { createServer } = require('node:http')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const test = require('node:test')
const { ValidationPipe } = require('@nestjs/common')
const { NestFactory } = require('@nestjs/core')
const { AppModule } = require('../dist/app.module')
const { DatabaseService } = require('../dist/common/database/database.service')
const { NewsService } = require('../dist/modules/news/news.service')
const { resolveEuScheduleTime } = require('../dist/modules/news/news-schedule-time')

const content = { title: 'Classic realm update', summary: 'Upcoming events', content: 'The full article.', category: 'News' }
const editor = { ...content, author: 'Moderator', updatedAt: '2030-01-01T00:00:00.000Z' }

test('only editors can read or change unpublished News and existing posts stay public', async (t) => {
  t.mock.method(Date, 'now', () => Date.parse('2030-01-01T00:00:00.000Z'))
  const directory = useTemporaryDatabase(t)
  const authServer = createServer((request, response) => {
    const role = request.headers.cookie === 'session=editor' ? 'moderator' : 'user'
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ id: role, displayName: role, roles: [role] }))
  })
  await new Promise((resolve) => authServer.listen(0, '127.0.0.1', resolve))
  replaceEnv(t, 'AUTH_SERVICE_URL', `http://127.0.0.1:${authServer.address().port}`)
  t.after(() => new Promise((resolve) => authServer.close(resolve)))
  const taskForge = createServer(async (request, response) => {
    if (request.url === '/api/executions/wait') return
    if (request.url?.endsWith('/cancel')) return response.writeHead(200).end()
    for await (const _chunk of request) { /* read the submission before responding */ }
    response.writeHead(201, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({
      id: '85b1aa9e-4bda-418a-b481-892555ef3c2c', applicationId: 'wowiki', status: 'Queued',
      cancellationRequested: false, owningWorkerId: null, startedAtUtc: null,
    }))
  })
  await new Promise((resolve) => taskForge.listen(0, '127.0.0.1', resolve))
  replaceEnv(t, 'TASKFORGE_URL', `http://127.0.0.1:${taskForge.address().port}`)
  replaceEnv(t, 'TASKFORGE_API_KEY', 'x'.repeat(32))
  t.after(() => {
    taskForge.closeAllConnections()
    return new Promise((resolve) => taskForge.close(resolve))
  })
  const app = await NestFactory.create(AppModule, { logger: false })
  t.after(async () => {
    await app.close()
    rmSync(directory, { recursive: true, force: true })
  })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.setGlobalPrefix('api')
  await app.listen(0, '127.0.0.1')
  const base = await app.getUrl()

  async function request(path, status, method = 'GET', body, session) {
    const response = await fetch(`${base}/api/news${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(session ? { Cookie: `session=${session}` } : {}) },
      body: body && JSON.stringify(body),
    })
    assert.equal(response.status, status, `${method} ${path}`)
    return response.json()
  }

  async function assertHidden(id) {
    const list = await request('', 200)
    assert.ok(!list.some((article) => article.id === id))
    await request(`/${id}`, 404)
    await request(`/${id}/like`, 404, 'GET', undefined, 'reader')
    await request(`/${id}/like`, 404, 'POST', { liked: true }, 'reader')
  }

  const { id: legacyId } = (await request('', 200))[0]
  assert.equal((await request(`/${legacyId}`, 200)).id, legacyId)
  await request('/editor', 401)
  await request('/editor', 403, 'GET', undefined, 'reader')
  await request('/drafts', 403, 'POST', content, 'reader')

  const immediate = await request('', 201, 'POST', content, 'editor')
  assert.deepEqual(immediate, await request(`/${immediate.id}`, 200))
  assert.equal(immediate.status, undefined)

  const draft = await request('/drafts', 201, 'POST', { ...content, status: 'published' }, 'editor')
  assert.equal(draft.status, 'draft')
  assert.equal(draft.enforcePublicationDeadline, false)
  await assertHidden(draft.id)
  const path = `/${draft.id}`
  const schedule = { scheduledAtLocal: '2030-07-01T12:00' }
  await request(`${path}/schedule`, 403, 'PUT', schedule, 'reader')
  await request(`${path}/schedule`, 400, 'PUT', { ...schedule, enforcePublicationDeadline: null }, 'editor')
  const prepared = await request(`${path}/schedule`, 200, 'PUT', { ...schedule, timeZone: 'Europe/London', status: 'scheduled', taskForgeJobId: 'spoofed' }, 'editor')
  assert.equal(prepared.status, 'scheduled')
  assert.equal(prepared.scheduledAtUtc, '2030-07-01T10:00:00.000Z')
  assert.equal(prepared.scheduleTimeZone, undefined)
  assert.equal(prepared.taskForgeJobId, undefined)

  const database = app.get(DatabaseService)
  const row = database.connection.prepare("SELECT data FROM entities WHERE collection = 'news' AND id = ?").get(draft.id)
  assert.equal(JSON.parse(row.data).taskForgeJobId, '85b1aa9e-4bda-418a-b481-892555ef3c2c')
  await assertHidden(draft.id)

  const articles = await request('/editor', 200, 'GET', undefined, 'editor')
  assert.equal(articles.find((article) => article.id === legacyId)?.status, 'published')
  assert.equal(articles.find((article) => article.id === draft.id)?.status, 'scheduled')
  const edited = await request(path, 200, 'PATCH', { title: 'Edited before publication', status: 'published' }, 'editor')
  assert.equal(edited.status, 'scheduled')
  assert.equal(edited.scheduledAtUtc, prepared.scheduledAtUtc)
  await request(`${path}/publish`, 403, 'POST', undefined, 'reader')
  const published = await request(`${path}/publish`, 200, 'POST', undefined, 'editor')
  assert.equal(published.status, 'published')
  assert.equal(published.scheduledAtUtc, undefined)
  assert.deepEqual(await request(`${path}/publish`, 200, 'POST', undefined, 'editor'), published)
  const publicArticle = await request(path, 200)
  assert.equal(publicArticle.title, 'Edited before publication')
  assert.equal(publicArticle.status, undefined)
  assert.equal(publicArticle.taskForgeJobId, undefined)
  await request(`${path}/unschedule`, 409, 'POST', undefined, 'editor')
})

test('schedule transitions reject stale identities and repeated publication is harmless', (t) => {
  const service = createService(t)
  let now = Date.parse('2030-01-01T00:00:00Z')
  t.mock.method(Date, 'now', () => now)
  const { id } = service.createDraft(editor)
  const { article: first } = service.prepareSchedule(id, '2030-01-01T03:00')
  assert.equal(service.publishScheduled(id, first.scheduleId, 'older-job'), 'pending-registration')
  assert.ok(service.confirmSchedule(id, first.scheduleId, 'older-job'))
  const { article: second } = service.prepareSchedule(id, '2030-01-01T04:00')
  assert.equal(service.confirmSchedule(id, first.scheduleId, 'older-job'), false)
  assert.equal(service.publishScheduled(id, first.scheduleId, 'older-job'), 'stale')
  assert.ok(service.confirmSchedule(id, second.scheduleId, 'current-job'))
  assert.equal(service.publishScheduled(id, second.scheduleId, 'wrong-job'), 'stale')
  assert.equal(service.publishScheduled(id, second.scheduleId, 'current-job'), 'not-due')

  now = Date.parse(second.scheduledAtUtc) + 60 * 60 * 1000
  assert.equal(service.publishScheduled(id, second.scheduleId, 'current-job', now), 'attempt-expired')
  assert.throws(() => service.findOne(id), /not found/)
  assert.equal(service.publishScheduled(id, second.scheduleId, 'current-job'), 'published')
  const published = service.findOne(id)
  assert.equal(service.publishScheduled(id, second.scheduleId, 'current-job'), 'already-published')
  assert.deepEqual(service.findOne(id), published)

  const manual = service.createDraft(editor)
  const { article: removed } = service.prepareSchedule(manual.id, '2030-01-01T07:00')
  assert.ok(service.confirmSchedule(manual.id, removed.scheduleId, 'removed-job'))
  assert.equal(service.removeSchedule(manual.id).article.status, 'draft')
  assert.equal(service.publishScheduled(manual.id, removed.scheduleId, 'removed-job'), 'stale')
  const { article: replaced } = service.prepareSchedule(manual.id, '2030-01-01T08:00')
  assert.ok(service.confirmSchedule(manual.id, replaced.scheduleId, 'manual-job'))
  service.publishNow(manual.id)
  assert.equal(service.publishScheduled(manual.id, replaced.scheduleId, 'manual-job'), 'stale')
})

test('EU publication times follow CET and CEST and reject skipped or repeated times', () => {
  assert.equal(resolveEuScheduleTime('2030-01-01T12:00'), '2030-01-01T11:00:00.000Z')
  assert.equal(resolveEuScheduleTime('2030-07-01T12:00'), '2030-07-01T10:00:00.000Z')
  assert.throws(() => resolveEuScheduleTime('2030-03-31T02:30'), /skipped or repeated/)
  assert.throws(() => resolveEuScheduleTime('2030-10-27T02:30'), /skipped or repeated/)
  assert.throws(() => resolveEuScheduleTime('2030-02-30T12:00'), /valid local date and time/)
})

test('the publication deadline is enforced at the write', (t) => {
  const service = createService(t)
  let now = Date.parse('2030-01-01T00:00:00Z')
  t.mock.method(Date, 'now', () => now)
  const { id } = service.createDraft(editor)
  assert.throws(() => service.prepareSchedule(id, '2030-01-01T01:00'), /future publication time/)
  const { article: schedule } = service.prepareSchedule(id, '2030-01-01T02:00', true)
  assert.ok(service.confirmSchedule(id, schedule.scheduleId, 'deadline-job'))
  now = Date.parse(schedule.scheduledAtUtc) + 30 * 60 * 1000 + 1
  assert.equal(service.publishScheduled(id, schedule.scheduleId, 'deadline-job'), 'deadline-exceeded')
  assert.throws(() => service.findOne(id), /not found/)
  assert.equal(service.findForEditor().find((article) => article.id === id)?.status, 'scheduled')
})

function createService(t) {
  const directory = useTemporaryDatabase(t)
  const database = new DatabaseService()
  t.after(() => {
    database.close()
    rmSync(directory, { recursive: true, force: true })
  })
  return new NewsService(database)
}

function useTemporaryDatabase(t) {
  const directory = mkdtempSync(join(tmpdir(), 'wowiki-news-'))
  replaceEnv(t, 'BACKEND_DATABASE_PATH', join(directory, 'news.db'))
  return directory
}

function replaceEnv(t, name, value) {
  const previous = process.env[name]
  process.env[name] = value
  t.after(() => {
    if (previous === undefined) delete process.env[name]
    else process.env[name] = previous
  })
}
