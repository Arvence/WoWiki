const assert = require('node:assert/strict')
const { copyFileSync, mkdtempSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const { DatabaseSync } = require('node:sqlite')
const test = require('node:test')
const { DatabaseService } = require('../dist/common/database/database.service')
const { NewsService } = require('../dist/modules/news/news.service')

test('the existing SQLite schema gains reactions without changing content or inventing owners for legacy counts', () => {
  const directory = mkdtempSync(join(tmpdir(), 'wowiki-reaction-migration-'))
  const path = join(directory, 'legacy.db')
  const previousPath = process.env.BACKEND_DATABASE_PATH
  let database
  try {
    copyFileSync(join(__dirname, '../Data/demo/wowiki-demo.db'), path)
    const legacy = new DatabaseSync(path)
    let original
    try {
      assert.equal(legacy.prepare('SELECT MAX(version) AS version FROM schema_migrations').get().version, 1)
      const row = legacy.prepare("SELECT id, data FROM entities WHERE collection = 'news' ORDER BY sequence LIMIT 1").get()
      original = { ...JSON.parse(row.data), likeCount: 99 }
      legacy.prepare("UPDATE entities SET data = ? WHERE collection = 'news' AND id = ?").run(JSON.stringify(original), row.id)
    } finally {
      legacy.close()
    }

    process.env.BACKEND_DATABASE_PATH = path
    database = new DatabaseService()
    let news = new NewsService(database)
    assert.deepEqual(news.findOne(original.id), { ...original, likeCount: 0 })
    assert.equal(database.connection.prepare('SELECT COUNT(*) AS count FROM reactions').get().count, 0)
    assert.equal(news.setLiked('user-a', original.id, true).likeCount, 1)
    assert.equal(news.setLiked('user-a', original.id, true).likeCount, 1)
    database.close()

    database = new DatabaseService()
    news = new NewsService(database)
    assert.deepEqual(news.findOne(original.id), { ...original, likeCount: 1 })
    assert.deepEqual(news.getReaction('user-a', original.id), { liked: true, likeCount: 1 })
    assert.equal(news.setLiked('user-a', original.id, false).likeCount, 0)
    assert.equal(news.setLiked('user-a', original.id, false).likeCount, 0)
    assert.deepEqual(database.connection.prepare('PRAGMA foreign_key_check').all(), [])
  } finally {
    database?.close()
    if (previousPath === undefined) delete process.env.BACKEND_DATABASE_PATH
    else process.env.BACKEND_DATABASE_PATH = previousPath
    rmSync(directory, { recursive: true, force: true })
  }
})
