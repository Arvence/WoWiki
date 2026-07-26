import { Injectable, OnApplicationShutdown } from '@nestjs/common'
import { mkdirSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { dirname, isAbsolute, resolve } from 'node:path'

const DATABASE_MIGRATIONS = [
  {
    version: 1,
    sql: `
      CREATE TABLE collections (
        name TEXT PRIMARY KEY,
        next_id INTEGER NOT NULL,
        next_sequence INTEGER NOT NULL
      );

      CREATE TABLE entities (
        collection TEXT NOT NULL,
        id TEXT NOT NULL,
        sequence INTEGER NOT NULL,
        data TEXT NOT NULL,
        PRIMARY KEY (collection, id),
        UNIQUE (collection, sequence),
        FOREIGN KEY (collection) REFERENCES collections(name) ON DELETE CASCADE
      );

      CREATE INDEX entities_collection_sequence
        ON entities(collection, sequence);
    `,
  },
] as const

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  readonly path: string
  readonly connection: DatabaseSync
  private closed = false

  constructor() {
    this.path = resolveDatabasePath(process.env.BACKEND_DATABASE_PATH)
    mkdirSync(dirname(this.path), { recursive: true })

    this.connection = new DatabaseSync(this.path)
    this.connection.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;
    `)
    this.applyMigrations()
  }

  transaction<T>(operation: () => T): T {
    this.connection.exec('BEGIN IMMEDIATE')
    try {
      const result = operation()
      this.connection.exec('COMMIT')
      return result
    } catch (error) {
      this.connection.exec('ROLLBACK')
      throw error
    }
  }

  isHealthy(): boolean {
    return this.connection.prepare('SELECT 1 AS healthy').get() !== undefined
  }

  close(): void {
    if (this.closed) return
    this.connection.close()
    this.closed = true
  }

  onApplicationShutdown(): void {
    this.close()
  }

  private applyMigrations(): void {
    this.connection.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `)

    const hasMigration = this.connection.prepare(
      'SELECT 1 FROM schema_migrations WHERE version = ?',
    )
    const recordMigration = this.connection.prepare(
      'INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)',
    )

    for (const migration of DATABASE_MIGRATIONS) {
      if (hasMigration.get(migration.version)) continue

      this.transaction(() => {
        this.connection.exec(migration.sql)
        recordMigration.run(migration.version, new Date().toISOString())
      })
    }
  }
}

function resolveDatabasePath(configuredPath: string | undefined): string {
  const path = configuredPath?.trim()
  if (!path) {
    return resolve(__dirname, '../../../Data/wowiki-backend.db')
  }

  return isAbsolute(path) ? path : resolve(process.cwd(), path)
}
