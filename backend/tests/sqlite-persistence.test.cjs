const assert = require('node:assert/strict')
const { mkdtempSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const test = require('node:test')
const { DatabaseService } = require('../dist/common/database/database.service')
const { SqliteRepository } = require('../dist/common/repositories/sqlite.repository')

test('created, updated, and deleted entities survive a database restart', () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'wowiki-backend-'))
  const databasePath = join(temporaryDirectory, 'persistence.db')
  const previousDatabasePath = process.env.BACKEND_DATABASE_PATH
  let database

  try {
    process.env.BACKEND_DATABASE_PATH = databasePath
    const seed = [{ id: '1', name: 'Seed record' }]

    database = new DatabaseService()
    const firstRepository = new SqliteRepository(
      database,
      'persistence_test',
      seed,
      'Test record',
    )
    const created = firstRepository.create({ name: 'Created before restart' })
    firstRepository.update(created.id, { name: 'Updated before restart' })
    firstRepository.remove('1')
    database.close()

    database = new DatabaseService()
    const reopenedRepository = new SqliteRepository(
      database,
      'persistence_test',
      seed,
      'Test record',
    )

    assert.deepEqual(reopenedRepository.findAll(), [
      { id: '2', name: 'Updated before restart' },
    ])
    assert.equal(
      reopenedRepository.create({ name: 'Created after restart' }).id,
      '3',
    )
  } finally {
    database?.close()
    if (previousDatabasePath === undefined) {
      delete process.env.BACKEND_DATABASE_PATH
    } else {
      process.env.BACKEND_DATABASE_PATH = previousDatabasePath
    }
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})
