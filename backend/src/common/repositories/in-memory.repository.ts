import { findByIdOrThrow } from '../errors/find-by-id-or-throw'
import { EntityWithId } from '../types/entity.type'
import { PaginatedResponse, PaginationOptions } from '../types/pagination.type'
import { cloneValue } from '../utils/clone-value'
import { paginate } from '../utils/paginate'

export class InMemoryRepository<T extends EntityWithId> {
  private readonly entities: T[]
  private nextId: number

  constructor(
    seed: readonly T[],
    private readonly entityName: string,
  ) {
    this.entities = cloneValue([...seed])
    this.nextId = this.findNextId()
  }

  findAll(): T[] {
    return cloneValue(this.entities)
  }

  findPage(options?: PaginationOptions): PaginatedResponse<T> {
    return cloneValue(paginate(this.entities, options))
  }

  findOne(id: string): T {
    return cloneValue(findByIdOrThrow(this.entities, id, this.entityName))
  }

  create(input: Omit<T, 'id'>): T {
    const entity = { id: String(this.nextId++), ...cloneValue(input) } as T
    this.entities.push(entity)
    return cloneValue(entity)
  }

  update(id: string, input: Partial<Omit<T, 'id'>>): T {
    findByIdOrThrow(this.entities, id, this.entityName)
    const index = this.entities.findIndex((entity) => entity.id === id)
    const entity = { ...this.entities[index], ...cloneValue(input), id } as T
    this.entities[index] = entity
    return cloneValue(entity)
  }

  remove(id: string): void {
    findByIdOrThrow(this.entities, id, this.entityName)
    const index = this.entities.findIndex((entity) => entity.id === id)
    this.entities.splice(index, 1)
  }

  private findNextId(): number {
    const greatestNumericId = this.entities.reduce((greatest, entity) => {
      const numericId = Number(entity.id)
      return Number.isInteger(numericId) && numericId >= 0 ? Math.max(greatest, numericId) : greatest
    }, 0)
    return greatestNumericId + 1
  }
}
