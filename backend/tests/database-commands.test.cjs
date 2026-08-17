const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const { existsSync, mkdtempSync, rmSync, writeFileSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join, resolve } = require('node:path')
const { DatabaseSync } = require('node:sqlite')
const test = require('node:test')

const backendRoot = resolve(__dirname, '..')

test('demo data can be installed and the active database can be cleared', () => {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'wowiki-database-command-'))
  const databasePath = join(temporaryDirectory, 'active.db')
  const environment = { ...process.env, BACKEND_DATABASE_PATH: databasePath }

  try {
    writeFileSync(databasePath, 'old local data')
    execFileSync(process.execPath, ['dist/common/database/database.cli.js', 'demo'], { cwd: backendRoot, env: environment })

    const database = new DatabaseSync(databasePath, { readOnly: true })
    const recordCount = database.prepare('SELECT COUNT(*) AS count FROM entities').get().count
    database.close()
    assert.equal(recordCount, 27)

    writeFileSync(`${databasePath}-shm`, '')
    writeFileSync(`${databasePath}-wal`, '')
    execFileSync(process.execPath, ['dist/common/database/database.cli.js', 'clear'], { cwd: backendRoot, env: environment })

    assert.equal(existsSync(databasePath), false)
    assert.equal(existsSync(`${databasePath}-shm`), false)
    assert.equal(existsSync(`${databasePath}-wal`), false)
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})
