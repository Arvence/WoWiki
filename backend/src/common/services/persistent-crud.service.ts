import { DatabaseService } from '../database/database.service'
import { SqliteRepository } from '../repositories/sqlite.repository'
import { EntityWithId } from '../types/entity.type'

export abstract class PersistentCrudService<
  TEntity extends EntityWithId,
  TCreate extends Omit<TEntity, 'id'>,
  TUpdate extends Partial<TCreate>,
> {
  protected readonly repository: SqliteRepository<TEntity>

  protected constructor(
    database: DatabaseService,
    collection: string,
    seed: readonly TEntity[],
    entityName: string,
  ) {
    this.repository = new SqliteRepository(database, collection, seed, entityName)
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
