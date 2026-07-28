const assert = require('node:assert/strict')
const { mkdtempSync, rmSync } = require('node:fs')
const { createServer } = require('node:http')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const test = require('node:test')
const { ValidationPipe } = require('@nestjs/common')
const { NestFactory } = require('@nestjs/core')
const { AppModule } = require('../dist/app.module')
const { ReportsService } = require('../dist/modules/reports/reports.service')

test('submits a saved user report through TaskForge and accepts its private callback', async () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'wowiki-report-flow-'))
  const databasePath = join(temporaryDirectory, 'reports.db')
  const previousEnvironment = captureEnvironment([
    'BACKEND_DATABASE_PATH',
    'TASKFORGE_URL',
    'TASKFORGE_USER_REPORT_CALLBACK_BASE_URL',
  ])
  const backendPort = await reservePort()
  let callbackResult
  let submittedJob
  let resolveCallback
  let rejectCallback
  const callbackCompleted = new Promise((resolve, reject) => {
    resolveCallback = resolve
    rejectCallback = reject
  })

  const taskForgeServer = createServer(async (request, response) => {
    const chunks = []
    for await (const chunk of request) chunks.push(chunk)
    submittedJob = JSON.parse(Buffer.concat(chunks).toString('utf8'))

    response.writeHead(201, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({
      id: 'd4cfc336-e62c-48c7-b11d-a8bb153c20fb',
      status: 'Queued',
    }))

    setImmediate(async () => {
      try {
        const callback = await fetch(submittedJob.payload.url, {
          method: submittedJob.payload.method,
          headers: {
            'Content-Type': 'application/json',
            ...submittedJob.payload.headers,
          },
          body: JSON.stringify(submittedJob.payload.body),
        })
        callbackResult = {
          status: callback.status,
          body: await callback.json(),
        }
        resolveCallback()
      } catch (error) {
        rejectCallback(error)
      }
    })
  })
  await new Promise((resolve) => taskForgeServer.listen(0, '127.0.0.1', resolve))
  const taskForgeAddress = taskForgeServer.address()

  process.env.BACKEND_DATABASE_PATH = databasePath
  process.env.TASKFORGE_URL = `http://127.0.0.1:${taskForgeAddress.port}`
  process.env.TASKFORGE_USER_REPORT_CALLBACK_BASE_URL =
    `http://127.0.0.1:${backendPort}`

  const application = await NestFactory.create(AppModule, { logger: false })
  application.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  application.setGlobalPrefix('api')

  try {
    await application.listen(backendPort, '127.0.0.1')
    const response = await fetch(`http://127.0.0.1:${backendPort}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'incorrect-content',
        title: 'Incorrect item source',
        description: 'The listed source does not match the source shown in Classic.',
        pagePath: '/database/items/19019',
        targetType: 'item',
        targetId: '19019',
        targetTitle: 'Thunderfury',
      }),
    })
    const createdReport = await response.json()

    assert.equal(response.status, 201)
    assert.equal(createdReport.status, 'pending')
    await Promise.race([
      callbackCompleted,
      new Promise((_, reject) => setTimeout(
        () => reject(new Error('TaskForge callback timed out')),
        3000,
      )),
    ])

    assert.equal(submittedJob.type, 'http-request')
    assert.deepEqual(callbackResult, {
      status: 201,
      body: {
        externalReference: `WOW-${createdReport.id}`,
        status: 'ready-for-review',
      },
    })

    const persistedReport = application
      .get(ReportsService)
      .findOne(createdReport.id)
    assert.equal(persistedReport.status, 'ready-for-review')
    assert.equal(persistedReport.taskForgeSubmissionStatus, 'submitted')
    assert.equal(
      persistedReport.taskForgeJobId,
      'd4cfc336-e62c-48c7-b11d-a8bb153c20fb',
    )
  } finally {
    await application.close()
    await new Promise((resolve, reject) => taskForgeServer.close((error) => (
      error ? reject(error) : resolve()
    )))
    restoreEnvironment(previousEnvironment)
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

async function reservePort() {
  const server = createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  await new Promise((resolve, reject) => server.close((error) => (
    error ? reject(error) : resolve()
  )))
  return address.port
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
