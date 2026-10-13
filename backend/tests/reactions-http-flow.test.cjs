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

for (const [targetType, targetId] of [['news', '1'], ['comments', '7']]) {
  test(`${targetType} likes are authenticated, user-specific, idempotent, and persistent`, async () => {
    const fixture = await createFixture()
    const targetPath = `/api/${targetType}/${targetId}`
    const likePath = `${targetPath}/like`
    const like = async (user, liked, count) => {
      const response = await fixture.request(likePath, user, 'POST', { liked, userId: 'spoofed-user', likeCount: 9999 }, 201)
      assert.equal((await response.json()).likeCount, count)
    }
    const state = async (user, liked, count) => {
      const response = await fixture.request(likePath, user)
      assert.deepEqual(await response.json(), { liked, likeCount: count })
    }

    try {
      await fixture.request(likePath, null, 'GET', undefined, 401)
      await fixture.request(likePath, null, 'POST', { liked: true }, 401)
      for (const input of [{}, { liked: 'true' }, { liked: null }, { liked: 1 }]) {
        await fixture.request(likePath, 'user-a', 'POST', input, 400)
      }
      await fixture.request(`/api/${targetType}/missing/like`, 'user-a', 'POST', { liked: true }, 404)
      await fixture.request(`/api/${targetType}/missing/like`, 'user-a', 'POST', { liked: false }, 404)
      await fixture.request(`/api/${targetType}/missing/like`, 'user-a', 'GET', undefined, 404)

      await state('user-a', false, 0)
      await like('user-b', false, 0)
      await like('user-a', true, 1)
      await like('user-a', true, 1)
      await state('user-a', true, 1)
      await state('user-b', false, 1)
      await like('user-b', true, 2)
      await like('user-a', false, 1)
      await like('user-a', false, 1)
      await state('user-b', true, 1)
      await like('user-b', false, 0)
      await like('user-b', false, 0)

      await Promise.all(Array.from({ length: 8 }, () => like('user-a', true, 1)))
      await like('user-b', true, 2)
      const database = fixture.database()
      assert.throws(() => database.connection.prepare(
        'INSERT INTO reactions(user_id, target_type, target_id) VALUES (?, ?, ?)',
      ).run('user-a', targetType, targetId), /UNIQUE constraint failed/)
      assert.equal(database.connection.prepare("SELECT COUNT(*) AS count FROM reactions WHERE user_id = 'spoofed-user'").get().count, 0)

      await fixture.restart()
      await state('user-a', true, 2)
      await state('user-b', true, 2)
      assert.equal((await (await fixture.request(targetPath)).json()).likeCount, 2)
      const listPath = targetType === 'news' ? '/api/news' : '/api/community/1/comments'
      const list = await (await fixture.request(listPath)).json()
      assert.equal(list.find((item) => item.id === targetId).likeCount, 2)
      const updated = await fixture.request(targetPath, 'moderator', 'PATCH', targetType === 'news' ? { title: 'Updated news' } : { content: 'Updated comment' })
      assert.equal((await updated.json()).likeCount, 2)
      await like('user-a', true, 2)
      await like('user-a', false, 1)
      await like('user-a', false, 1)

      if (targetType === 'comments') {
        await fixture.request('/api/comments/8/like', 'user-a', 'POST', { liked: true }, 201)
      }
      await fixture.request(targetPath, 'moderator', 'DELETE')
      assert.equal(fixture.database().connection.prepare('SELECT COUNT(*) AS count FROM reactions').get().count, 0)
      await fixture.request(likePath, 'user-a', 'GET', undefined, 404)
    } finally {
      await fixture.close()
    }
  })
}

test('reaction target types stay separate and community deletion cleans up comment reactions', async () => {
  const fixture = await createFixture()
  try {
    await fixture.request('/api/news/7/like', 'user-a', 'POST', { liked: true }, 201)
    await fixture.request('/api/comments/7/like', 'user-a', 'POST', { liked: true }, 201)
    await fixture.request('/api/comments/8/like', 'user-b', 'POST', { liked: true }, 201)
    assert.equal(fixture.database().connection.prepare('SELECT COUNT(*) AS count FROM reactions').get().count, 3)
    await fixture.request('/api/community/1', 'moderator', 'DELETE')
    assert.equal(fixture.database().connection.prepare('SELECT COUNT(*) AS count FROM reactions').get().count, 1)
    const news = await fixture.request('/api/news/7/like', 'user-a')
    assert.deepEqual(await news.json(), { liked: true, likeCount: 1 })
  } finally {
    await fixture.close()
  }
})

async function createFixture() {
  const directory = mkdtempSync(join(tmpdir(), 'wowiki-reactions-'))
  const previousDatabasePath = process.env.BACKEND_DATABASE_PATH
  const previousAuthUrl = process.env.AUTH_SERVICE_URL
  const authServer = createServer((request, response) => {
    const userId = request.headers.cookie?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
    if (!['user-a', 'user-b', 'moderator'].includes(userId)) {
      response.writeHead(401).end()
      return
    }
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ id: userId, displayName: userId, roles: [userId === 'moderator' ? 'moderator' : 'user'] }))
  })
  await new Promise((resolve) => authServer.listen(0, '127.0.0.1', resolve))
  process.env.BACKEND_DATABASE_PATH = join(directory, 'reactions.db')
  process.env.AUTH_SERVICE_URL = `http://127.0.0.1:${authServer.address().port}`
  let application
  let baseUrl

  async function restart() {
    await application?.close()
    application = await NestFactory.create(AppModule, { logger: false })
    application.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    application.setGlobalPrefix('api')
    await application.listen(0, '127.0.0.1')
    baseUrl = `http://127.0.0.1:${application.getHttpServer().address().port}`
  }

  async function close() {
    await application?.close()
    await new Promise((resolve) => authServer.close(resolve))
    if (previousDatabasePath === undefined) delete process.env.BACKEND_DATABASE_PATH
    else process.env.BACKEND_DATABASE_PATH = previousDatabasePath
    if (previousAuthUrl === undefined) delete process.env.AUTH_SERVICE_URL
    else process.env.AUTH_SERVICE_URL = previousAuthUrl
    rmSync(directory, { recursive: true, force: true })
  }

  try {
    await restart()
    return {
      restart,
      close,
      database: () => application.get(DatabaseService),
      async request(path, user, method = 'GET', body, expectedStatus = 200) {
        const response = await fetch(`${baseUrl}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json', ...(user ? { cookie: `session=${user}` } : {}) },
          body: body === undefined ? undefined : JSON.stringify(body),
        })
        assert.equal(response.status, expectedStatus, `${method} ${path}`)
        return response
      },
    }
  } catch (error) {
    await close()
    throw error
  }
}
