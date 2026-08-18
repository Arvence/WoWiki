const assert = require('node:assert/strict')
const { mkdtempSync, rmSync } = require('node:fs')
const { createServer } = require('node:http')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const test = require('node:test')
const { ValidationPipe } = require('@nestjs/common')
const { NestFactory } = require('@nestjs/core')
const { AppModule } = require('../dist/app.module')

test('raid plans support validated, user-owned CRUD', async () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'wowiki-raid-plans-'))
  const databasePath = join(temporaryDirectory, 'raid-plans.db')
  const previousDatabasePath = process.env.BACKEND_DATABASE_PATH
  const previousAuthServiceUrl = process.env.AUTH_SERVICE_URL
  const authServer = createServer((request, response) => {
    const session = request.headers.cookie?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
    const user = session === 'user-b'
      ? { id: 'user-b', displayName: 'User B', email: 'b@example.com', createdAtUtc: '2026-01-01T00:00:00.000Z', roles: [] }
      : { id: 'user-a', displayName: 'User A', email: 'a@example.com', createdAtUtc: '2026-01-01T00:00:00.000Z', roles: [] }

    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(user))
  })
  await new Promise((resolve) => authServer.listen(0, '127.0.0.1', resolve))
  const authAddress = authServer.address()

  process.env.BACKEND_DATABASE_PATH = databasePath
  process.env.AUTH_SERVICE_URL = `http://127.0.0.1:${authAddress.port}`
  const application = await NestFactory.create(AppModule, { logger: false })
  application.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  application.setGlobalPrefix('api')
  await application.listen(0, '127.0.0.1')
  const applicationAddress = application.getHttpServer().address()
  const baseUrl = `http://127.0.0.1:${applicationAddress.port}/api/raid-plans`
  const planInput = {
    raidId: '1',
    scheduledAtUtc: '2026-09-12T17:00:00.000Z',
    raidSize: 10,
    notes: 'First progression night',
    raiders: [
      { id: 'raider-1', name: 'Main Tank', classId: 'warrior', role: 'tank', group: 1 },
    ],
  }

  try {
    const unauthenticatedResponse = await fetch(baseUrl)
    assert.equal(unauthenticatedResponse.status, 401)

    const invalidDateResponse = await sendJson(baseUrl, 'user-a', 'POST', {
      ...planInput,
      scheduledAtUtc: '2026-09-12T17:00:00+03:00',
    })
    assert.equal(invalidDateResponse.status, 400)

    const invalidGroupResponse = await sendJson(baseUrl, 'user-a', 'POST', {
      ...planInput,
      raiders: [
        { id: 'raider-1', name: 'Main Tank', classId: 'warrior', role: 'tank', group: 3 },
      ],
    })
    assert.equal(invalidGroupResponse.status, 400)

    const createUserAResponse = await sendJson(baseUrl, 'user-a', 'POST', {
      ...planInput,
      userId: 'user-b',
    })
    const userAPlan = await createUserAResponse.json()
    assert.equal(createUserAResponse.status, 201)
    assert.deepEqual(
      {
        id: userAPlan.id,
        userId: userAPlan.userId,
        raidId: userAPlan.raidId,
        scheduledAtUtc: userAPlan.scheduledAtUtc,
        raidSize: userAPlan.raidSize,
        notes: userAPlan.notes,
        raiders: userAPlan.raiders,
      },
      {
        id: '1',
        userId: 'user-a',
        ...planInput,
      },
    )
    assert.equal(typeof userAPlan.createdAtUtc, 'string')
    assert.equal(userAPlan.updatedAtUtc, userAPlan.createdAtUtc)

    const createUserBResponse = await sendJson(baseUrl, 'user-b', 'POST', {
      ...planInput,
      raidId: '2',
      notes: 'User B plan',
    })
    const userBPlan = await createUserBResponse.json()
    assert.equal(createUserBResponse.status, 201)
    assert.equal(userBPlan.userId, 'user-b')

    const userAListResponse = await fetch(baseUrl, { headers: { cookie: 'session=user-a' } })
    assert.deepEqual(await userAListResponse.json(), [userAPlan])

    const hiddenUserBPlanResponse = await fetch(`${baseUrl}/${userBPlan.id}`, {
      headers: { cookie: 'session=user-a' },
    })
    assert.equal(hiddenUserBPlanResponse.status, 404)

    const updateResponse = await sendJson(`${baseUrl}/${userAPlan.id}`, 'user-a', 'PATCH', {
      notes: 'Updated progression notes',
    })
    const updatedPlan = await updateResponse.json()
    assert.equal(updateResponse.status, 200)
    assert.equal(updatedPlan.notes, 'Updated progression notes')
    assert.equal(updatedPlan.createdAtUtc, userAPlan.createdAtUtc)
    assert.equal(typeof updatedPlan.updatedAtUtc, 'string')

    const duplicateRaiderResponse = await sendJson(`${baseUrl}/${userAPlan.id}`, 'user-a', 'PATCH', {
      raiders: [
        { id: 'duplicate', name: 'Tank One', classId: 'warrior', role: 'tank', group: 1 },
        { id: 'duplicate', name: 'Tank Two', classId: 'druid', role: 'tank', group: 1 },
      ],
    })
    assert.equal(duplicateRaiderResponse.status, 400)

    const unauthorizedDeleteResponse = await fetch(`${baseUrl}/${userAPlan.id}`, {
      method: 'DELETE',
      headers: { cookie: 'session=user-b' },
    })
    assert.equal(unauthorizedDeleteResponse.status, 404)

    const deleteResponse = await fetch(`${baseUrl}/${userAPlan.id}`, {
      method: 'DELETE',
      headers: { cookie: 'session=user-a' },
    })
    assert.equal(deleteResponse.status, 204)

    const deletedPlanResponse = await fetch(`${baseUrl}/${userAPlan.id}`, {
      headers: { cookie: 'session=user-a' },
    })
    assert.equal(deletedPlanResponse.status, 404)

    const userBListResponse = await fetch(baseUrl, { headers: { cookie: 'session=user-b' } })
    assert.deepEqual(await userBListResponse.json(), [userBPlan])
  } finally {
    await application.close()
    await new Promise((resolve, reject) => authServer.close((error) => (
      error ? reject(error) : resolve()
    )))
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
  }
})

function sendJson(url, session, method, body) {
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      cookie: `session=${session}`,
    },
    body: JSON.stringify(body),
  })
}
