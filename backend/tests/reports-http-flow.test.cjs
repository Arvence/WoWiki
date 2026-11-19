const assert = require('node:assert/strict')
const { mkdtempSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const { DatabaseSync } = require('node:sqlite')
const test = require('node:test')
const { ValidationPipe } = require('@nestjs/common')
const { NestFactory } = require('@nestjs/core')
const { AppModule } = require('../dist/app.module')

test('saves a user report locally and returns its reference', async () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'wowiki-report-flow-'))
  const databasePath = join(temporaryDirectory, 'reports.db')
  const previousDatabasePath = process.env.BACKEND_DATABASE_PATH
  let application

  try {
    process.env.BACKEND_DATABASE_PATH = databasePath
    application = await NestFactory.create(AppModule, { logger: false })
    application.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
    application.setGlobalPrefix('api')
    await application.listen(0, '127.0.0.1')

    const input = {
      type: 'incorrect-content',
      title: 'Incorrect item source',
      description: 'The listed source does not match the source shown in Classic.',
      pagePath: '/database/items/19019',
      targetType: 'item',
      targetId: '19019',
      targetTitle: 'Thunderfury',
    }
    const response = await fetch(`${await application.getUrl()}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    assert.equal(response.status, 201)
    const report = await response.json()
    assert.match(report.id, /^[1-9]\d*$/)
    assert.ok(Number.isFinite(Date.parse(report.createdAt)))
    assert.deepEqual(report, { ...input, id: report.id, status: 'pending', createdAt: report.createdAt })

    const database = new DatabaseSync(databasePath, { readOnly: true })
    try {
      const row = database.prepare("SELECT data FROM entities WHERE collection = 'reports' AND id = ?").get(report.id)
      assert.ok(row)
      assert.deepEqual(JSON.parse(row.data), report)
    } finally {
      database.close()
    }
  } finally {
    try {
      await application?.close()
    } finally {
      if (previousDatabasePath === undefined) {
        delete process.env.BACKEND_DATABASE_PATH
      } else {
        process.env.BACKEND_DATABASE_PATH = previousDatabasePath
      }
      rmSync(temporaryDirectory, { recursive: true, force: true })
    }
  }
})
