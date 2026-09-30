const assert = require('node:assert/strict')
const { createServer } = require('node:http')
const { rmSync } = require('node:fs')
const { join } = require('node:path')
const test = require('node:test')
const { ValidationPipe } = require('@nestjs/common')
const { NestFactory } = require('@nestjs/core')
const { AppModule } = require('../dist/app.module')

test('rejects oversized and malformed content requests', async () => {
  const databasePath = join(__dirname, `.content-validation-${process.pid}.sqlite`)
  const previousEnvironment = captureEnvironment([
    'BACKEND_DATABASE_PATH',
    'AUTH_SERVICE_URL',
  ])
  const authServer = createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({
      id: 'validation-user',
      displayName: 'Validation User',
      email: 'validation@example.com',
      createdAtUtc: '2026-01-01T00:00:00.000Z',
      roles: ['admin'],
    }))
  })
  await new Promise((resolve) => authServer.listen(0, '127.0.0.1', resolve))
  const authAddress = authServer.address()

  process.env.BACKEND_DATABASE_PATH = databasePath
  process.env.AUTH_SERVICE_URL = `http://127.0.0.1:${authAddress.port}`
  const application = await NestFactory.create(AppModule, { logger: false })
  application.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  application.setGlobalPrefix('api')

  try {
    await application.listen(0, '127.0.0.1')
    const address = application.getHttpServer().address()
    const baseUrl = `http://127.0.0.1:${address.port}/api`
    const comment = await sendJson(baseUrl, '/community/1/comments', {
      content: 'x'.repeat(5001),
    }, true)
    assert.equal(comment.status, 400)

    const blankComment = await sendJson(baseUrl, '/community/1/comments', {
      content: '   ',
    }, true)
    assert.equal(blankComment.status, 400)

    const communityTitle = await sendJson(baseUrl, '/community', {
      title: 'x'.repeat(161),
      excerpt: 'A short excerpt.',
      content: 'A valid community entry.',
      category: 'Guide',
    }, true)
    assert.equal(communityTitle.status, 400)

    const communityContent = await sendJson(baseUrl, '/community', {
      title: 'A community entry',
      excerpt: 'A short excerpt.',
      content: 'x'.repeat(30001),
      category: 'Guide',
    }, true)
    assert.equal(communityContent.status, 400)

    const tooManyHashtags = await sendJson(baseUrl, '/community', {
      title: 'A community entry',
      excerpt: 'A short excerpt.',
      content: 'A valid community entry.',
      category: 'Guide',
      hashtags: Array.from({ length: 11 }, (_, index) => `tag-${index}`),
    }, true)
    assert.equal(tooManyHashtags.status, 400)

    const malformedHashtag = await sendJson(baseUrl, '/community', {
      title: 'A community entry',
      excerpt: 'A short excerpt.',
      content: 'A valid community entry.',
      category: 'Guide',
      hashtags: ['not a valid-tag'],
    }, true)
    assert.equal(malformedHashtag.status, 400)

    const longHashtag = await sendJson(baseUrl, '/community', {
      title: 'A community entry',
      excerpt: 'A short excerpt.',
      content: 'A valid community entry.',
      category: 'Guide',
      hashtags: ['a'.repeat(33)],
    }, true)
    assert.equal(longHashtag.status, 400)

    const malformedCommunityImage = await sendJson(baseUrl, '/community', {
      title: 'A community entry',
      excerpt: 'A short excerpt.',
      content: 'A valid community entry.',
      category: 'Guide',
      image: 'javascript:alert(1)',
    }, true)
    assert.equal(malformedCommunityImage.status, 400)

    const localCommunityImage = await sendJson(baseUrl, '/community', {
      title: 'A community entry',
      excerpt: 'A short excerpt.',
      content: 'A valid community entry.',
      category: 'Guide',
      image: '/images/community-cover.png',
    }, true)
    assert.equal(localCommunityImage.status, 201)

    const newsContent = await sendJson(baseUrl, '/news', {
      title: 'A news article',
      summary: 'A short summary.',
      content: 'x'.repeat(50001),
      category: 'News',
    }, true)
    assert.equal(newsContent.status, 400)

    const newsTitle = await sendJson(baseUrl, '/news', {
      title: 'x'.repeat(161),
      summary: 'A short summary.',
      content: 'A valid news article.',
      category: 'News',
    }, true)
    assert.equal(newsTitle.status, 400)

    const newsSummary = await sendJson(baseUrl, '/news', {
      title: 'A news article',
      summary: 'x'.repeat(1001),
      content: 'A valid news article.',
      category: 'News',
    }, true)
    assert.equal(newsSummary.status, 400)

    const malformedNewsImage = await sendJson(baseUrl, '/news', {
      title: 'A news article',
      summary: 'A short summary.',
      content: 'A valid news article.',
      category: 'News',
      imageUrl: 'https://',
    }, true)
    assert.equal(malformedNewsImage.status, 400)

    const httpsNewsImage = await sendJson(baseUrl, '/news', {
      title: 'A news article',
      summary: 'A short summary.',
      content: 'A valid news article.',
      category: 'News',
      imageUrl: 'https://example.com/news-cover.png',
    }, true)
    assert.equal(httpsNewsImage.status, 201)

    const report = await sendJson(baseUrl, '/reports', {
      type: 'incorrect-content',
      title: 'Incorrect content',
      description: 'x'.repeat(2001),
      pagePath: '/community',
    })
    assert.equal(report.status, 400)

    const malformedReportPath = await sendJson(baseUrl, '/reports', {
      type: 'incorrect-content',
      title: 'Incorrect content',
      description: 'The linked path is not a local application path.',
      pagePath: 'https://example.com/community',
    })
    assert.equal(malformedReportPath.status, 400)
  } finally {
    await application.close()
    await new Promise((resolve, reject) => authServer.close((error) => (
      error ? reject(error) : resolve()
    )))
    restoreEnvironment(previousEnvironment)
    for (const suffix of ['', '-shm', '-wal']) {
      rmSync(`${databasePath}${suffix}`, { force: true })
    }
  }
})

async function sendJson(baseUrl, path, body, authenticated = false) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? { cookie: 'session=validation-user' } : {}),
    },
    body: JSON.stringify(body),
  })
}

function captureEnvironment(names) {
  return Object.fromEntries(names.map((name) => [name, process.env[name]]))
}

function restoreEnvironment(environment) {
  for (const [name, value] of Object.entries(environment)) {
    if (value === undefined) {
      delete process.env[name]
    } else {
      process.env[name] = value
    }
  }
}
