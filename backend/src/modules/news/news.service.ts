import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { DatabaseService } from '../../common/database/database.service'
import { SqliteRepository } from '../../common/repositories/sqlite.repository'
import { ReactionRepository } from '../../common/repositories/reaction.repository'
import { CreateNewsDto } from './dto/create-news.dto'
import { UpdateNewsDto } from './dto/update-news.dto'
import type { News, NewsRecord } from './models/news.model'
import { resolveEuScheduleTime } from './news-schedule-time'
import { NEWS } from './seeds/news.seed'

const publicationWindowMs = 30 * 60 * 1000
const clearedSchedule = { scheduledAtUtc: undefined, scheduleId: undefined, taskForgeJobId: undefined, enforcePublicationDeadline: false }

type ScheduledPublication = 'published' | 'already-published' | 'pending-registration' | 'stale' | 'not-due' | 'deadline-exceeded' | 'attempt-expired'

function isPublished(news: NewsRecord): boolean {
  return news.status === undefined || news.status === 'published'
}

function toPublicNews({ status: _status, scheduledAtUtc: _scheduledAtUtc, scheduleTimeZone: _timeZone, scheduleId: _scheduleId, taskForgeJobId: _jobId, enforcePublicationDeadline: _deadline, ...article }: NewsRecord & { scheduleTimeZone?: string }): News {
  return article
}

export function toEditorNews(news: NewsRecord) {
  return {
    ...toPublicNews(news),
    status: news.status ?? 'published',
    scheduledAtUtc: news.scheduledAtUtc,
    enforcePublicationDeadline: news.enforcePublicationDeadline ?? false,
  }
}

@Injectable()
export class NewsService {
  private readonly repository: SqliteRepository<NewsRecord>
  private readonly reactions: ReactionRepository

  constructor(private readonly database: DatabaseService) {
    this.repository = new SqliteRepository(database, 'news', NEWS, 'News item')
    this.reactions = new ReactionRepository(database, 'news')
  }

  findAll(): News[] {
    const articles = this.repository.findAll().filter(isPublished)
    return this.reactions.withCounts(articles).map(toPublicNews)
  }

  findOne(id: string): News {
    return toPublicNews(this.reactions.withCounts([this.requirePublished(id)])[0])
  }

  create(createNewsDto: CreateNewsDto & { author: string; updatedAt: string }): News {
    return toPublicNews(this.createArticle(createNewsDto, 'published'))
  }

  findForEditor() {
    return this.reactions.withCounts(this.repository.findAll()).map(toEditorNews)
  }

  createDraft(input: CreateNewsDto & { author: string; updatedAt: string }) {
    return toEditorNews(this.createArticle(input, 'draft'))
  }

  getReaction(userId: string, id: string) {
    this.requirePublished(id)
    return this.reactions.getState(userId, id)
  }

  setLiked(userId: string, id: string, liked: boolean): News {
    this.requirePublished(id)
    this.reactions.setLiked(userId, id, liked)
    return this.findOne(id)
  }

  update(id: string, input: UpdateNewsDto & { updatedAt: string }) {
    const { imageUrl, ...content } = input
    const changes = imageUrl === undefined ? content : { ...content, imageUrl: imageUrl ?? undefined }
    const article = this.database.transaction(() => this.repository.update(id, changes))
    return toEditorNews(this.reactions.withCounts([article])[0])
  }

  prepareSchedule(id: string, scheduledAtLocal: string, enforcePublicationDeadline = false) {
    const scheduledAtUtc = resolveEuScheduleTime(scheduledAtLocal)
    return this.database.transaction(() => {
      const current = this.repository.findOne(id)
      if (isPublished(current)) throw new ConflictException('Published news cannot be scheduled')
      if (Date.parse(scheduledAtUtc) <= Date.now()) throw new BadRequestException('Choose a future publication time')

      const article = this.repository.update(id, {
        ...clearedSchedule,
        status: 'draft',
        scheduledAtUtc,
        scheduleId: randomUUID(),
        enforcePublicationDeadline,
      })
      return { article, previousJobId: current.taskForgeJobId }
    })
  }

  pendingSchedule(id: string): NewsRecord {
    const current = this.repository.findOne(id)
    if (current.status !== 'draft' || !current.scheduleId || !current.scheduledAtUtc || current.taskForgeJobId) {
      throw new ConflictException('This article has no pending schedule registration')
    }
    return current
  }

  confirmSchedule(id: string, scheduleId: string, taskForgeJobId: string, canRun = true): NewsRecord | false {
    return this.database.transaction(() => {
      const current = this.repository.findOne(id)
      if (!current.scheduledAtUtc || current.scheduleId !== scheduleId) return false
      if (current.status === 'scheduled' || current.status === 'published') {
        return current.taskForgeJobId === taskForgeJobId ? current : false
      }
      if (!canRun || current.status !== 'draft' || current.taskForgeJobId) return false

      return this.repository.update(id, { status: 'scheduled', taskForgeJobId })
    })
  }

  discardPendingSchedule(id: string, scheduleId: string): void {
    this.database.transaction(() => {
      const current = this.repository.findOne(id)
      if (current.status === 'draft' && current.scheduleId === scheduleId && !current.taskForgeJobId) {
        this.repository.update(id, clearedSchedule)
      }
    })
  }

  removeSchedule(id: string) {
    return this.database.transaction(() => {
      const current = this.repository.findOne(id)
      if (isPublished(current)) throw new ConflictException('Published news has no active schedule')
      const article = this.repository.update(id, { ...clearedSchedule, status: 'draft' })
      return { article, previousJobId: current.taskForgeJobId }
    })
  }

  publishNow(id: string) {
    return this.database.transaction(() => {
      const current = this.repository.findOne(id)
      if (isPublished(current)) return { article: current, previousJobId: undefined }
      return { article: this.publish(id, clearedSchedule), previousJobId: current.taskForgeJobId }
    })
  }

  publishScheduled(id: string, scheduleId: string, taskForgeJobId: string, attemptDeadlineAt = Infinity): ScheduledPublication {
    return this.database.transaction(() => {
      const now = Date.now()
      if (now >= attemptDeadlineAt) return 'attempt-expired'
      const current = this.repository.findOne(id)
      if (!current.scheduledAtUtc || current.scheduleId !== scheduleId) return 'stale'
      if (current.status === 'draft' && !current.taskForgeJobId) return 'pending-registration'
      if (current.taskForgeJobId !== taskForgeJobId) return 'stale'
      if (current.status === 'published') return 'already-published'
      if (current.status !== 'scheduled') return 'stale'

      const scheduledAt = Date.parse(current.scheduledAtUtc)
      if (now < scheduledAt) return 'not-due'
      if (current.enforcePublicationDeadline && now > scheduledAt + publicationWindowMs) return 'deadline-exceeded'
      this.publish(id)
      return 'published'
    })
  }

  remove(id: string): string | undefined {
    return this.database.transaction(() => {
      const current = this.repository.findOne(id)
      this.repository.remove(id)
      return current.status === 'scheduled' ? current.taskForgeJobId : undefined
    })
  }

  private requirePublished(id: string): NewsRecord {
    const article = this.repository.findOne(id)
    if (!isPublished(article)) throw new NotFoundException(`News item with id ${id} not found`)
    return article
  }

  private createArticle(input: CreateNewsDto & { author: string; updatedAt: string }, status: 'draft' | 'published'): NewsRecord {
    return this.repository.create({ ...input, imageUrl: input.imageUrl ?? undefined, status, likeCount: 0 })
  }

  private publish(id: string, changes: Partial<NewsRecord> = {}): NewsRecord {
    return this.repository.update(id, { ...changes, status: 'published', updatedAt: new Date().toISOString() })
  }
}
