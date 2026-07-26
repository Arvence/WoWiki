import { NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { EntityWithId } from '../types/entity.type'
import { PaginatedResponse, PaginationOptions } from '../types/pagination.type'
import { cloneValue } from '../utils/clone-value'
import { paginate } from '../utils/paginate'

type CollectionState = {
  nextId: number
  nextSequence: number
}

type EntityRow = {
  data: string
}

export class SqliteRepository<T extends EntityWithId> {
  constructor(
    private readonly database: DatabaseService,
    private readonly collection: string,
    seed: readonly T[],
    private readonly entityName: string,
  ) {
    this.initialize(seed)
  }

  findAll(): T[] {
    const rows = this.database.connection.prepare(`
      SELECT data
      FROM entities
      WHERE collection = ?
      ORDER BY sequence
    `).all(this.collection) as EntityRow[]

    return rows.map((row) => JSON.parse(row.data) as T)
  }

  findPage(options?: PaginationOptions): PaginatedResponse<T> {
    return paginate(this.findAll(), options)
  }

  findOne(id: string): T {
    const row = this.database.connection.prepare(`
      SELECT data
      FROM entities
      WHERE collection = ? AND id = ?
    `).get(this.collection, id) as EntityRow | undefined

    if (!row) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found`)
    }

    return JSON.parse(row.data) as T
  }

  create(input: Omit<T, 'id'>): T {
    return this.database.transaction(() => {
      const state = this.getCollectionState()
      const entity = {
        id: String(state.nextId),
        ...cloneValue(input),
      } as T

      this.database.connection.prepare(`
        INSERT INTO entities(collection, id, sequence, data)
        VALUES (?, ?, ?, ?)
      `).run(this.collection, entity.id, state.nextSequence, JSON.stringify(entity))
      this.database.connection.prepare(`
        UPDATE collections
        SET next_id = ?, next_sequence = ?
        WHERE name = ?
      `).run(state.nextId + 1, state.nextSequence + 1, this.collection)

      return cloneValue(entity)
    })
  }

  update(id: string, input: Partial<Omit<T, 'id'>>): T {
    const current = this.findOne(id)
    const entity = {
      ...current,
      ...cloneValue(input),
      id,
    } as T

    this.database.connection.prepare(`
      UPDATE entities
      SET data = ?
      WHERE collection = ? AND id = ?
    `).run(JSON.stringify(entity), this.collection, id)

    return cloneValue(entity)
  }

  remove(id: string): void {
    this.findOne(id)
    this.database.connection.prepare(`
      DELETE FROM entities
      WHERE collection = ? AND id = ?
    `).run(this.collection, id)
  }

  removeMany(ids: ReadonlySet<string>): void {
    if (ids.size === 0) return

    const remove = this.database.connection.prepare(`
      DELETE FROM entities
      WHERE collection = ? AND id = ?
    `)
    this.database.transaction(() => {
      for (const id of ids) {
        remove.run(this.collection, id)
      }
    })
  }

  private initialize(seed: readonly T[]): void {
    const existing = this.database.connection.prepare(
      'SELECT 1 FROM collections WHERE name = ?',
    ).get(this.collection)
    if (existing) return

    const greatestNumericId = seed.reduce((greatest, entity) => {
      const numericId = Number(entity.id)
      return Number.isInteger(numericId) && numericId >= 0
        ? Math.max(greatest, numericId)
        : greatest
    }, 0)

    this.database.transaction(() => {
      this.database.connection.prepare(`
        INSERT INTO collections(name, next_id, next_sequence)
        VALUES (?, ?, ?)
      `).run(this.collection, greatestNumericId + 1, seed.length + 1)

      const insert = this.database.connection.prepare(`
        INSERT INTO entities(collection, id, sequence, data)
        VALUES (?, ?, ?, ?)
      `)
      seed.forEach((entity, index) => {
        insert.run(this.collection, entity.id, index + 1, JSON.stringify(entity))
      })
    })
  }

  private getCollectionState(): CollectionState {
    const state = this.database.connection.prepare(`
      SELECT next_id AS nextId, next_sequence AS nextSequence
      FROM collections
      WHERE name = ?
    `).get(this.collection) as CollectionState | undefined

    if (!state) {
      throw new Error(`Database collection ${this.collection} is not initialized`)
    }

    return state
  }
}
