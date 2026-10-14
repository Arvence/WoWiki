const assert = require('node:assert/strict')
const { mkdtempSync, rmSync } = require('node:fs')
const { createServer } = require('node:http')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const test = require('node:test')
const { ValidationPipe } = require('@nestjs/common')
const { NestFactory } = require('@nestjs/core')
const { AppModule } = require('../dist/app.module')

const planInput = {
  raidId: '1',
  scheduledAtUtc: '2026-09-12T17:00:00.000Z',
  raidSize: 10,
  notes: 'First progression night',
  raiders: [{ id: 'raider-1', name: 'Main Tank', classId: 'warrior', role: 'tank', group: 1 }],
}

test('raid plans accept every supported size with a full roster on create and update', async (context) => {
  const fixture = await createFixture(context)
  const original = await createPlan(fixture)

  for (const raidSize of [10, 20, 25, 40]) {
    const raiders = createRaiders(raidSize)
    const created = await createPlan(fixture, { raidSize, raiders })
    assert.equal(created.raidSize, raidSize)
    assert.deepEqual(created.raiders, raiders)
    assert.deepEqual(await fixture.request(`/${created.id}`), created)

    const updated = await fixture.request(`/${original.id}`, 'user-a', 'PATCH', { raidSize, raiders })
    assert.equal(updated.raidSize, raidSize)
    assert.deepEqual(updated.raiders, raiders)
    assert.equal(updated.createdAtUtc, original.createdAtUtc)
    assert.deepEqual(await fixture.request(`/${original.id}`), updated)
  }
})

test('raid plans reject unsupported sizes on create and update without changing saved plans', async (context) => {
  const fixture = await createFixture(context)
  const saved = await createPlan(fixture)
  const unsupportedSizes = Array.from({ length: 42 }, (_, size) => size).filter((size) => ![10, 20, 25, 40].includes(size))

  for (const raidSize of [-1, ...unsupportedSizes]) {
    await rejectChanges(fixture, saved, { raidSize })
  }
  assert.deepEqual(await fixture.request(), [saved])
})

test('raid plans require numeric sizes and reject null updates while allowing omitted fields', async (context) => {
  const fixture = await createFixture(context)
  const saved = await createPlan(fixture)

  for (const raidSize of [null, '10', 10.5, true, [], {}]) {
    await rejectChanges(fixture, saved, { raidSize })
  }
  await fixture.request('', 'user-a', 'POST', { ...planInput, raidSize: undefined }, 400)
  const updated = await fixture.request(`/${saved.id}`, 'user-a', 'PATCH', { notes: 'New notes' })
  assert.deepEqual(updated, { ...saved, notes: 'New notes', updatedAtUtc: updated.updatedAtUtc })
  assert.deepEqual(await fixture.request(), [updated])
})

test('raid plans validate groups, capacity, and duplicate raiders before persisting changes', async (context) => {
  const fixture = await createFixture(context)
  const saved = await createPlan(fixture)

  for (const group of [0, -1, 3, 9, 1.5, '1', null]) {
    await rejectChanges(fixture, saved, { raiders: [{ ...planInput.raiders[0], group }] })
  }
  for (const raidSize of [20, 25, 40]) {
    await rejectChanges(fixture, saved, { raidSize, raiders: [{ ...planInput.raiders[0], group: raidSize / 5 + 1 }] })
  }

  await rejectChanges(fixture, saved, { raiders: createRaiders(6).map((raider) => ({ ...raider, group: 1 })) })
  await rejectChanges(fixture, saved, { raiders: createRaiders(11) })
  for (const duplicateId of ['raider-1', ' raider-1 ']) {
    await rejectChanges(fixture, saved, {
      raiders: [planInput.raiders[0], { ...planInput.raiders[0], id: duplicateId, name: 'Second Tank', group: 2 }],
    })
  }
  await rejectChanges(fixture, saved, { scheduledAtUtc: '2026-09-12T17:00:00+03:00' })

  const largePlan = await createPlan(fixture, { raidSize: 20, raiders: createRaiders(20) })
  await fixture.request(`/${largePlan.id}`, 'user-a', 'PATCH', { raidSize: 10 }, 400)
  assert.deepEqual(await fixture.request(`/${largePlan.id}`), largePlan)

  const distantGroupPlan = await createPlan(fixture, { raidSize: 20, raiders: [{ ...planInput.raiders[0], group: 4 }] })
  await fixture.request(`/${distantGroupPlan.id}`, 'user-a', 'PATCH', { raidSize: 10 }, 400)
  assert.deepEqual(await fixture.request(`/${distantGroupPlan.id}`), distantGroupPlan)

  const resized = await fixture.request(`/${largePlan.id}`, 'user-a', 'PATCH', { raidSize: 10, raiders: createRaiders(10) })
  assert.equal(resized.raidSize, 10)
  assert.deepEqual(resized.raiders, createRaiders(10))
  const emptied = await fixture.request(`/${largePlan.id}`, 'user-a', 'PATCH', { raiders: [] })
  assert.deepEqual(emptied.raiders, [])
  assert.deepEqual(await fixture.request(`/${largePlan.id}`), emptied)
})

test('raid plan ownership, saves, updates, and deletes survive reopening SQLite', async (context) => {
  const fixture = await createFixture(context)
  const userAPlan = await createPlan(fixture, { userId: 'user-b' })
  assert.deepEqual(userAPlan, {
    ...planInput,
    id: '1',
    userId: 'user-a',
    createdAtUtc: userAPlan.createdAtUtc,
    updatedAtUtc: userAPlan.createdAtUtc,
  })
  assert.equal(new Date(userAPlan.createdAtUtc).toISOString(), userAPlan.createdAtUtc)
  const userBPlan = await createPlan(fixture, { raidId: '2', notes: 'User B plan' }, 'user-b')
  assert.equal(userBPlan.userId, 'user-b')

  for (const session of [null, 'invalid-session']) {
    await fixture.request('', session, 'GET', undefined, 401)
    await fixture.request('', session, 'POST', planInput, 401)
    await fixture.request(`/${userAPlan.id}`, session, 'GET', undefined, 401)
    await fixture.request(`/${userAPlan.id}`, session, 'PATCH', { notes: 'Unauthorized change' }, 401)
    await fixture.request(`/${userAPlan.id}`, session, 'DELETE', undefined, 401)
  }

  await fixture.restart()
  assert.deepEqual(await fixture.request(), [userAPlan])
  assert.deepEqual(await fixture.request('', 'user-b'), [userBPlan])
  assert.deepEqual(await fixture.request(`/${userAPlan.id}`), userAPlan)

  for (const [plan, otherUser] of [[userAPlan, 'user-b'], [userBPlan, 'user-a']]) {
    await fixture.request(`/${plan.id}`, otherUser, 'GET', undefined, 404)
    await fixture.request(`/${plan.id}`, otherUser, 'PATCH', { userId: otherUser, notes: 'Stolen plan' }, 404)
    await fixture.request(`/${plan.id}`, otherUser, 'DELETE', undefined, 404)
    assert.deepEqual(await fixture.request(`/${plan.id}`, plan.userId), plan)
  }

  const updateInput = {
    raidId: ' 3 ',
    scheduledAtUtc: '2026-10-20T18:00:00.000Z',
    raidSize: 25,
    notes: ' Updated progression notes ',
    raiders: [{ ...planInput.raiders[0], id: ' new-raider ', name: ' New Tank ', group: 5 }],
    userId: 'user-b',
    id: userBPlan.id,
    createdAtUtc: '2000-01-01T00:00:00.000Z',
    updatedAtUtc: '2000-01-01T00:00:00.000Z',
  }
  const updated = await fixture.request(`/${userAPlan.id}`, 'user-a', 'PATCH', updateInput)
  assert.deepEqual(updated, {
    ...userAPlan,
    raidId: '3',
    scheduledAtUtc: updateInput.scheduledAtUtc,
    raidSize: 25,
    notes: 'Updated progression notes',
    raiders: [{ ...planInput.raiders[0], id: 'new-raider', name: 'New Tank', group: 5 }],
    updatedAtUtc: updated.updatedAtUtc,
  })
  assert.ok(Date.parse(updated.updatedAtUtc) > Date.parse(userAPlan.updatedAtUtc))

  await fixture.restart()
  assert.deepEqual(await fixture.request(`/${userAPlan.id}`), updated)
  assert.deepEqual(await fixture.request(), [updated])
  assert.deepEqual(await fixture.request('', 'user-b'), [userBPlan])
  await fixture.request(`/${userAPlan.id}`, 'user-b', 'GET', undefined, 404)

  await fixture.request(`/${userAPlan.id}`, 'user-a', 'DELETE', undefined, 204)
  await fixture.restart()
  assert.deepEqual(await fixture.request(), [])
  assert.deepEqual(await fixture.request('', 'user-b'), [userBPlan])
  for (const id of [userAPlan.id, 'missing']) {
    await fixture.request(`/${id}`, 'user-a', 'GET', undefined, 404)
    await fixture.request(`/${id}`, 'user-a', 'PATCH', { notes: 'Deleted plan' }, 404)
    await fixture.request(`/${id}`, 'user-a', 'DELETE', undefined, 404)
  }
})

function createRaiders(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `raider-${index + 1}`,
    name: `Raider ${index + 1}`,
    classId: 'warrior',
    role: 'damage',
    group: Math.floor(index / 5) + 1,
  }))
}

function createPlan(fixture, overrides = {}, user = 'user-a') {
  return fixture.request('', user, 'POST', { ...planInput, ...overrides }, 201)
}

async function rejectChanges(fixture, saved, changes) {
  await fixture.request('', 'user-a', 'POST', { ...planInput, ...changes }, 400)
  await fixture.request(`/${saved.id}`, 'user-a', 'PATCH', changes, 400)
  assert.deepEqual(await fixture.request(`/${saved.id}`), saved)
}

async function createFixture(context) {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'wowiki-raid-plans-'))
  const previousDatabasePath = process.env.BACKEND_DATABASE_PATH
  const previousAuthServiceUrl = process.env.AUTH_SERVICE_URL
  let application
  let baseUrl
  const authServer = createServer((request, response) => {
    const userId = request.headers.cookie?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
    if (!['user-a', 'user-b'].includes(userId)) {
      response.writeHead(401).end()
      return
    }
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ id: userId, displayName: userId, roles: [] }))
  })

  context.after(async () => {
    await application?.close()
    await new Promise((resolve, reject) => authServer.close((error) => error ? reject(error) : resolve()))
    if (previousDatabasePath === undefined) {
      delete process.env.BACKEND_DATABASE_PATH
    } else {
      process.env.BACKEND_DATABASE_PATH = previousDatabasePath
    }
    if (previousAuthServiceUrl === undefined) {
      delete process.env.AUTH_SERVICE_URL
    } else {
      process.env.AUTH_SERVICE_URL = previousAuthServiceUrl
    }
    rmSync(temporaryDirectory, { recursive: true, force: true })
  })

  await new Promise((resolve) => authServer.listen(0, '127.0.0.1', resolve))
  process.env.BACKEND_DATABASE_PATH = join(temporaryDirectory, 'raid-plans.db')
  process.env.AUTH_SERVICE_URL = `http://127.0.0.1:${authServer.address().port}`

  async function start() {
    application = await NestFactory.create(AppModule, { logger: false })
    application.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    application.setGlobalPrefix('api')
    await application.listen(0, '127.0.0.1')
    baseUrl = `http://127.0.0.1:${application.getHttpServer().address().port}/api/raid-plans`
  }

  await start()
  return {
    async restart() {
      await application.close()
      await start()
    },
    async request(path = '', session = 'user-a', method = 'GET', body, expectedStatus = 200) {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { cookie: `session=${session}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      const text = await response.text()
      assert.equal(response.status, expectedStatus, `${method} ${path || '/'}: ${text}`)
      return text ? JSON.parse(text) : undefined
    },
  }
}
