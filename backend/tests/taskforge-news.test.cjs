const assert = require('node:assert/strict')
const { randomUUID } = require('node:crypto')
const { mkdtempSync, rmSync } = require('node:fs')
const { createServer } = require('node:http')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const { setTimeout: delay } = require('node:timers/promises')
const test = require('node:test')
const { DatabaseService } = require('../dist/common/database/database.service')
const { NewsService } = require('../dist/modules/news/news.service')
const { NewsSchedulingService } = require('../dist/modules/news/news-scheduling.service')
const { TaskForgeClient } = require('../dist/modules/news/taskforge.client')
const { TaskForgeWorker } = require('../dist/modules/news/taskforge.worker')

const key = 'test_only_wowiki_key_0123456789012345'
const publishAt = '2030-01-01T02:00'
const startAt = Date.parse('2030-01-01T00:00:00Z')
const newsContent = {
  title: 'Private article title', summary: 'Private summary', content: 'Private content',
  category: 'News', author: 'Editor', updatedAt: new Date(startAt).toISOString(),
}

test('manual registration retry reuses the UTC payload and key after a lost response', async (t) => {
  const jobId = randomUUID()
  const submissions = []
  const { news, scheduling, draft } = await fixture(t, ({ request, response, raw }) => {
    assert.equal(request.url, '/api/jobs')
    submissions.push({ raw, key: request.headers['idempotency-key'] })
    if (submissions.length === 1) return response.destroy()
    send(response, 200, job(jobId))
  })
  await assert.rejects(scheduling.schedule(draft.id, publishAt, true), /Retry registration/)
  const pending = news.pendingSchedule(draft.id)
  assert.equal(pending.status, 'draft')
  assert.equal(pending.taskForgeJobId, undefined)
  assert.throws(() => news.findOne(draft.id), /not found/)
  const registered = await scheduling.retry(draft.id)
  assert.equal(registered.status, 'scheduled')
  assert.equal(registered.scheduledAtUtc, '2030-01-01T01:00:00.000Z')
  assert.deepEqual(submissions, [submissions[0], submissions[0]])
  assert.equal(submissions[0].key, 'publish-news:' + pending.scheduleId)
  assert.deepEqual(JSON.parse(submissions[0].raw), {
    applicationId: 'wowiki', scheduledAtUtc: '2030-01-01T01:00:00.000Z',
    payload: { operation: 'publish-news', newsId: draft.id, scheduleId: pending.scheduleId },
  })
  assert.equal(news.confirmSchedule(draft.id, pending.scheduleId, jobId).taskForgeJobId, jobId)
  news.update(draft.id, { title: 'Later edit', updatedAt: new Date(startAt).toISOString() })
  assert.equal(submissions.length, 2)
})

test('definite rejection clears the reservation and an idempotent terminal response never schedules a draft', async (t) => {
  let responseNumber = 0
  const { news, scheduling, draft } = await fixture(t, ({ response }) => {
    responseNumber++
    if (responseNumber === 1) return send(response, 400, {})
    if (responseNumber === 2) return response.destroy()
    send(response, 200, job(randomUUID(), 'DeadLettered'))
  })
  await assert.rejects(scheduling.schedule(draft.id, publishAt), /rejected registration/)
  assert.throws(() => news.pendingSchedule(draft.id), /no pending/)
  await assert.rejects(scheduling.schedule(draft.id, publishAt), /Retry registration/)
  assert.equal(news.pendingSchedule(draft.id).status, 'draft')
  await assert.rejects(scheduling.retry(draft.id), /job can no longer run/)
  assert.throws(() => news.pendingSchedule(draft.id), /no pending/)
})

test('a rejected replacement leaves the article a draft even if cancellation of the old job fails', async (t) => {
  const oldJobId = randomUUID()
  let submissions = 0
  let cancelledJob
  let replacementScheduleId
  const { news, scheduling, draft, setNow } = await fixture(t, ({ request, response, raw }) => {
    if (request.url.endsWith('/cancel')) {
      cancelledJob = request.url.split('/')[3]
      return send(response, 503, {})
    }
    if (++submissions === 1) return send(response, 201, job(oldJobId))
    replacementScheduleId = JSON.parse(raw).payload.scheduleId
    send(response, 400, {})
  })

  const scheduled = await scheduling.schedule(draft.id, publishAt)
  await assert.rejects(scheduling.schedule(draft.id, '2030-01-01T03:00'), (error) => {
    assert.equal(error.getStatus(), 422)
    assert.match(error.message, /The article is a draft/)
    return true
  })
  assert.equal(cancelledJob, oldJobId)
  assert.ok(replacementScheduleId && replacementScheduleId !== scheduled.scheduleId)
  const article = news.findOneForEditor(draft.id)
  assert.equal(article.status, 'draft')
  assert.equal(article.scheduledAtUtc, undefined)
  assert.equal(article.scheduleId, undefined)
  assert.equal(article.taskForgeJobId, undefined)

  setNow(Date.parse('2030-01-01T02:01:00Z'))
  assert.equal(news.publishScheduled(draft.id, scheduled.scheduleId, oldJobId), 'stale')
  assert.equal(news.publishScheduled(draft.id, replacementScheduleId, randomUUID()), 'stale')
  assert.throws(() => news.findOne(draft.id), /not found/)
})

test('rescheduling and removal invalidate locally before cancellation, and Publish Now wins against an in-flight registration', async (t) => {
  const jobs = [randomUUID(), randomUUID(), randomUUID()]
  const cancellations = []
  let submissions = 0
  let delayed
  let currentSchedule
  const { news, scheduling, draft } = await fixture(t, ({ request, response, raw }) => {
    if (request.url.endsWith('/cancel')) {
      const id = request.url.split('/')[3]
      assert.equal(raw, '')
      cancellations.push(id)
      if (currentSchedule) assert.equal(news.publishScheduled(draft.id, currentSchedule, id), 'stale')
      return send(response, 200, {})
    }
    currentSchedule = JSON.parse(raw).payload.scheduleId
    const id = jobs[submissions++]
    if (id === jobs[2]) {
      delayed = () => send(response, 201, job(id))
      return
    }
    send(response, 201, job(id))
  })
  await scheduling.schedule(draft.id, publishAt)
  const initialSchedule = currentSchedule
  await scheduling.schedule(draft.id, '2030-01-01T03:00')
  assert.notEqual(initialSchedule, currentSchedule)
  assert.deepEqual(cancellations, [jobs[0]])
  await scheduling.removeSchedule(draft.id)
  assert.deepEqual(cancellations, jobs.slice(0, 2))
  const saving = scheduling.schedule(draft.id, '2030-01-01T04:00')
  const conflict = assert.rejects(saving, /schedule changed/)
  await waitFor(() => delayed)
  assert.equal((await scheduling.publishNow(draft.id)).status, 'published')
  delayed()
  await conflict
  assert.deepEqual(cancellations, jobs)
  assert.equal(news.findOne(draft.id).title, draft.title)
})

test('the worker acquires, checks ownership, publishes once, and reports outcomes with exact attempt identity', async (t) => {
  const queue = []
  const reports = []
  const processing = new Map()
  const { news, worker, draft, setNow } = await fixture(t, ({ request, response, raw }) => {
    if (request.url === '/api/executions/wait') {
      const wait = JSON.parse(raw)
      assert.equal(wait.applicationId, 'wowiki')
      assert.deepEqual(wait.supportedTypes, ['general'])
      assert.equal(wait.waitSeconds, 20)
      assert.match(wait.workerId, /^wowiki-/)
      const next = queue.shift()
      if (!next) return
      const assignment = { ...next, workerId: wait.workerId }
      processing.set(next.jobId, assignment)
      return send(response, 200, assignment)
    }
    const [, , , id, action, attemptId, outcome] = request.url.split('/')
    const assignment = processing.get(id)
    assert.ok(assignment)
    if (!action) {
      return send(response, 200, {
        ...job(id, assignment.cancelled ? 'Cancelled' : 'Processing'), owningWorkerId: assignment.workerId,
        startedAtUtc: assignment.startedAtUtc, cancellationRequested: Boolean(assignment.cancelled),
      })
    }
    const body = JSON.parse(raw)
    assert.equal(attemptId, assignment.attemptId)
    assert.equal(body.applicationId, 'wowiki')
    assert.equal(body.workerId, assignment.workerId)
    reports.push({ id, outcome, raw, body })
    send(response, reports.length === 1 ? 503 : 200, {})
  })
  const late = registered(draft.id)
  const strict = registered(news.createDraft(newsContent).id, true)
  const pending = news.prepareSchedule(news.createDraft(newsContent).id, publishAt).article
  const canceled = registered(news.createDraft(newsContent).id)
  const stale = registered(news.createDraft(newsContent).id)
  news.removeSchedule(stale.newsId)
  const now = Date.parse('2030-01-01T02:00:00Z')
  setNow(now)
  queue.push(assignment(late), assignment(late), assignment(strict), assignment({ newsId: pending.id, scheduleId: pending.scheduleId, jobId: randomUUID() }),
    { ...assignment(canceled), cancelled: true }, assignment(stale), assignment({ ...late, operation: 'unknown' }))

  worker.onApplicationBootstrap()
  await waitFor(() => reports.length === 7)
  assert.equal(reports[0].outcome, 'complete')
  assert.equal(reports[0].raw, reports[1].raw)
  assert.deepEqual(reports.slice(2).map(({ outcome, body }) => [outcome, body.errorCode]), [
    ['complete', undefined], ['fail', 'NonRetryableJobException'], ['fail', 'NewsSchedulePending'],
    ['fail', 'NonRetryableJobException'], ['fail', 'NonRetryableJobException'],
  ])
  assert.equal(news.findOne(draft.id).title, draft.title)
  assert.throws(() => news.findOne(strict.newsId), /not found/)
  assert.throws(() => news.findOne(pending.id), /not found/)
  assert.throws(() => news.findOne(canceled.newsId), /not found/)
  assert.throws(() => news.findOne(stale.newsId), /not found/)

  function registered(newsId, enforce = false) {
    const { article: { scheduleId } } = news.prepareSchedule(newsId, publishAt, enforce)
    const jobId = randomUUID()
    assert.ok(news.confirmSchedule(newsId, scheduleId, jobId))
    return { newsId, scheduleId, jobId }
  }
  function assignment({ jobId, newsId, scheduleId, operation = 'publish-news' }) {
    return {
      jobId, applicationId: 'wowiki', attemptId: randomUUID(), type: 'general',
      startedAtUtc: new Date(now).toISOString(), deadlineAtUtc: new Date(now + 30_000).toISOString(),
      payload: { operation, newsId, scheduleId },
    }
  }
})

test('the worker skips acquisition without credentials and aborts its long poll on shutdown', async (t) => {
  let acquired = 0
  let disconnected = false
  const { news, worker } = await fixture(t, ({ response }) => {
    acquired++
    response.on('close', () => { disconnected = true })
  })
  const savedKey = process.env.TASKFORGE_API_KEY
  delete process.env.TASKFORGE_API_KEY
  const unconfigured = new TaskForgeClient()
  process.env.TASKFORGE_API_KEY = savedKey
  const disabled = new TaskForgeWorker(unconfigured, news)
  disabled.onApplicationBootstrap()
  await disabled.beforeApplicationShutdown()
  assert.equal(acquired, 0)
  worker.onApplicationBootstrap()
  await waitFor(() => acquired === 1)
  await worker.beforeApplicationShutdown()
  await waitFor(() => disconnected)
  assert.equal(acquired, 1)
})

function job(id, status = 'Queued') {
  return { id, status, applicationId: 'wowiki', cancellationRequested: false, owningWorkerId: null, startedAtUtc: null }
}

function send(response, status, data) {
  response.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(data))
}

async function waitFor(check) {
  for (let i = 0; i < 200; i++) {
    if (check()) return
    await delay(20)
  }
  assert.fail('Timed out waiting for TaskForge exchange')
}

async function fixture(t, handle) {
  const directory = mkdtempSync(join(tmpdir(), 'wowiki-taskforge-news-'))
  const original = { BACKEND_DATABASE_PATH: process.env.BACKEND_DATABASE_PATH, TASKFORGE_URL: process.env.TASKFORGE_URL, TASKFORGE_API_KEY: process.env.TASKFORGE_API_KEY }
  const errors = []
  const server = createServer(async (request, response) => {
    try {
      assert.equal(request.headers.authorization, 'Bearer ' + key)
      const chunks = []
      for await (const chunk of request) chunks.push(chunk)
      const raw = Buffer.concat(chunks).toString('utf8')
      if (raw) assert.equal(request.headers['content-type'], 'application/json')
      handle({ request, response, raw })
    } catch (error) {
      errors.push(error)
      if (!response.headersSent) send(response, 500, {})
      else response.destroy()
    }
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  process.env.TASKFORGE_URL = 'http://127.0.0.1:' + server.address().port
  process.env.TASKFORGE_API_KEY = key
  process.env.BACKEND_DATABASE_PATH = join(directory, 'news.db')
  let now = startAt
  t.mock.method(Date, 'now', () => now)
  const database = new DatabaseService()
  const news = new NewsService(database)
  const client = new TaskForgeClient()
  const worker = new TaskForgeWorker(client, news)
  t.after(async () => {
    await worker.beforeApplicationShutdown()
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
    database.close()
    rmSync(directory, { recursive: true, force: true })
    for (const [name, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[name]
      else process.env[name] = value
    }
    assert.deepEqual(errors, [])
  })
  return { news, scheduling: new NewsSchedulingService(news, client), worker, draft: news.createDraft(newsContent), setNow: (value) => { now = value } }
}
