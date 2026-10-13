import { NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

type ReactionTargetType = 'news' | 'comments'
type ReactionState = { liked: boolean; likeCount: number }
type ReactionStateRow = { liked: number; likeCount: number }
type ReactionCountRow = { id: string; likeCount: number }

export class ReactionRepository {
  constructor(private readonly database: DatabaseService, private readonly targetType: ReactionTargetType) {}

  withCounts<T extends { id: string }>(entities: T[]): Array<T & { likeCount: number }> {
    if (entities.length === 0) return []
    const rows = this.database.connection.prepare(`
      SELECT target_id AS id, COUNT(*) AS likeCount
      FROM reactions
      WHERE target_type = ?
      GROUP BY target_id
    `).all(this.targetType) as ReactionCountRow[]
    const counts = new Map(rows.map((row) => [row.id, row.likeCount]))
    return entities.map((entity) => ({ ...entity, likeCount: counts.get(entity.id) ?? 0 }))
  }

  getState(userId: string, targetId: string): ReactionState {
    this.requireTarget(targetId)
    const state = this.database.connection.prepare(`
      SELECT COUNT(*) AS likeCount, COALESCE(MAX(user_id = ?), 0) AS liked
      FROM reactions
      WHERE target_type = ? AND target_id = ?
    `).get(userId, this.targetType, targetId) as ReactionStateRow
    return { liked: Boolean(state.liked), likeCount: state.likeCount }
  }

  setLiked(userId: string, targetId: string, liked: boolean): void {
    this.database.transaction(() => {
      this.requireTarget(targetId)
      if (liked) {
        this.database.connection.prepare(`
          INSERT INTO reactions(user_id, target_type, target_id)
          VALUES (?, ?, ?)
          ON CONFLICT(user_id, target_type, target_id) DO NOTHING
        `).run(userId, this.targetType, targetId)
      } else {
        this.database.connection.prepare(`
          DELETE FROM reactions
          WHERE user_id = ? AND target_type = ? AND target_id = ?
        `).run(userId, this.targetType, targetId)
      }
    })
  }

  private requireTarget(targetId: string): void {
    const target = this.database.connection.prepare(
      'SELECT 1 FROM entities WHERE collection = ? AND id = ?',
    ).get(this.targetType, targetId)
    if (!target) throw new NotFoundException(`Reaction target with id ${targetId} not found`)
  }
}
