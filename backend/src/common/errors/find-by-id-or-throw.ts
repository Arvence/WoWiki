import { NotFoundException } from '@nestjs/common'
import { EntityWithId } from '../types/entity.type'

export function findByIdOrThrow<T extends EntityWithId>(entities: readonly T[], id: string, entityName: string): T {
  const entity = entities.find((item) => item.id === id)
  if (!entity) throw new NotFoundException(`${entityName} with id ${id} not found`)
  return entity
}
