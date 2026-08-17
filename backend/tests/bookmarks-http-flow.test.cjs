const assert = require('node:assert/strict')
const { mkdtempSync, rmSync } = require('node:fs')
const { createServer } = require('node:http')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const test = require('node:test')
const { NestFactory } = require('@nestjs/core')
const { AppModule } = require('../dist/app.module')

test('bookmarks are authenticated, idempotent, and isolated by user', async () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'wowiki-bookmarks-'))
  const databasePath = join(temporaryDirectory, 'bookmarks.db')
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
  application.setGlobalPrefix('api')
  await application.listen(0, '127.0.0.1')
  const applicationAddress = application.getHttpServer().address()
  const baseUrl = `http://127.0.0.1:${applicationAddress.port}/api/bookmarks`

  try {
    const unauthenticatedResponse = await fetch(baseUrl)
    assert.equal(unauthenticatedResponse.status, 401)

    const firstSaveResponse = await fetch(`${baseUrl}/community/42`, {
      method: 'PUT',
      headers: { cookie: 'session=user-a' },
    })
    const firstBookmark = await firstSaveResponse.json()
    assert.equal(firstSaveResponse.status, 200)
    assert.deepEqual(
      {
        id: firstBookmark.id,
        userId: firstBookmark.userId,
        targetType: firstBookmark.targetType,
        targetId: firstBookmark.targetId,
      },
      { id: '1', userId: 'user-a', targetType: 'community', targetId: '42' },
    )

    const duplicateSaveResponse = await fetch(`${baseUrl}/community/42`, {
      method: 'PUT',
      headers: { cookie: 'session=user-a' },
    })
    assert.deepEqual(await duplicateSaveResponse.json(), firstBookmark)

    await fetch(`${baseUrl}/news/7`, {
      method: 'PUT',
      headers: { cookie: 'session=user-b' },
    })

    const userAListResponse = await fetch(baseUrl, {
      headers: { cookie: 'session=user-a' },
    })
    assert.deepEqual(await userAListResponse.json(), [firstBookmark])

    const invalidTargetResponse = await fetch(`${baseUrl}/guide/3`, {
      method: 'PUT',
      headers: { cookie: 'session=user-a' },
    })
    assert.equal(invalidTargetResponse.status, 400)

    const deleteResponse = await fetch(`${baseUrl}/community/42`, {
      method: 'DELETE',
      headers: { cookie: 'session=user-a' },
    })
    assert.equal(deleteResponse.status, 204)

    const emptyUserAListResponse = await fetch(baseUrl, {
      headers: { cookie: 'session=user-a' },
    })
    assert.deepEqual(await emptyUserAListResponse.json(), [])

    const userBListResponse = await fetch(baseUrl, {
      headers: { cookie: 'session=user-b' },
    })
    assert.deepEqual((await userBListResponse.json()).map(({ userId, targetType, targetId }) => ({ userId, targetType, targetId })), [
      { userId: 'user-b', targetType: 'news', targetId: '7' },
    ])
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
