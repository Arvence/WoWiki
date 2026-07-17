import { EntityWithId } from '../types/entity.type'
import { InMemoryRepository } from '../repositories/in-memory.repository'

export abstract class InMemoryCrudService<TEntity extends EntityWithId, TCreate extends Omit<TEntity, 'id'>, TUpdate extends Partial<TCreate>> {
  protected readonly repository: InMemoryRepository<TEntity>

  protected constructor(seed: readonly TEntity[], entityName: string) {
    this.repository = new InMemoryRepository(seed, entityName)
  }

  findAll(): TEntity[] {
    return this.repository.findAll()
  }

  findOne(id: string): TEntity {
    return this.repository.findOne(id)
  }

  create(input: TCreate): TEntity {
    return this.repository.create(input)
  }

  update(id: string, input: TUpdate): TEntity {
    return this.repository.update(id, input)
  }

  remove(id: string): void {
    this.repository.remove(id)
  }
}
