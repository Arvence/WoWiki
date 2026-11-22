import { Injectable, Logger, NotFoundException, type BeforeApplicationShutdown, type OnApplicationBootstrap } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import { NewsService } from './news.service'
import { TaskForgeClient, TaskForgeRequestError, type TaskForgeAssignment, type TaskForgeFailure } from './taskforge.client'

type OperationOutcome = TaskForgeFailure | 'expired' | undefined
type OperationHandler = (payload: Record<string, unknown>, assignment: TaskForgeAssignment, deadlineAt: number) => OperationOutcome

@Injectable()
export class TaskForgeWorker implements OnApplicationBootstrap, BeforeApplicationShutdown {
  private readonly logger = new Logger(TaskForgeWorker.name)
  private readonly stopping = new AbortController()
  private readonly workerId = `wowiki-${randomUUID()}`
  private readonly operations = new Map<string, OperationHandler>([
    ['publish-news', (payload, assignment, deadlineAt) => this.publishNews(payload, assignment, deadlineAt)],
  ])
  private loop?: Promise<void>

  constructor(private readonly taskForge: TaskForgeClient, private readonly news: NewsService) {}

  onApplicationBootstrap(): void {
    if (this.taskForge.configured) this.loop = this.run(this.stopping.signal)
  }

  async beforeApplicationShutdown(): Promise<void> {
    this.stopping.abort()
    await this.loop
  }

  private async run(signal: AbortSignal): Promise<void> {
    while (!signal.aborted) {
      try {
        const assignment = await this.taskForge.acquire(this.workerId, signal)
        if (assignment && !signal.aborted) await this.execute(assignment, signal)
      } catch (error) {
        if (signal.aborted) break
        this.logger.warn(error instanceof TaskForgeRequestError ? error.message : 'Unexpected TaskForge worker error')
        await delay(1000, undefined, { signal }).catch(() => undefined)
      }
    }
  }

  private async execute(assignment: TaskForgeAssignment, signal: AbortSignal): Promise<void> {
    const deadlineAt = Date.parse(assignment.deadlineAtUtc)
    const remaining = deadlineAt - Date.now()
    if (remaining <= 0) return

    // The News operation is synchronous. Check ownership immediately before entering its SQLite transaction.
    let job
    try {
      job = await this.taskForge.getJob(assignment.jobId, signal, remaining)
    } catch (error) {
      if (signal.aborted || (error instanceof TaskForgeRequestError && error.status === 404)) return
      if (!(error instanceof TaskForgeRequestError) || !error.retryable) throw error
      await this.reportOutcome(assignment, { errorCode: 'TaskForgeStatusUnavailable', errorMessage: 'WoWiki could not verify attempt ownership' }, signal, deadlineAt)
      return
    }
    if (job.status !== 'Processing' || job.cancellationRequested
      || job.owningWorkerId !== assignment.workerId || job.startedAtUtc !== assignment.startedAtUtc
      || signal.aborted || Date.now() >= deadlineAt) return

    let outcome: OperationOutcome
    try {
      outcome = this.dispatch(assignment, deadlineAt)
    } catch {
      outcome = { errorCode: 'NewsStoreUnavailable', errorMessage: 'WoWiki could not update the article' }
    }
    if (outcome !== 'expired') await this.reportOutcome(assignment, outcome, signal, deadlineAt)
  }

  private dispatch(assignment: TaskForgeAssignment, deadlineAt: number): OperationOutcome {
    const { payload } = assignment
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return invalidPayload()
    const input = payload as Record<string, unknown>
    if (typeof input.operation !== 'string' || !input.operation) return invalidPayload()
    const handler = this.operations.get(input.operation)
    return handler ? handler(input, assignment, deadlineAt) : permanentFailure('This WoWiki operation is not supported')
  }

  private publishNews({ newsId, scheduleId }: Record<string, unknown>, assignment: TaskForgeAssignment, deadlineAt: number): OperationOutcome {
    if (typeof newsId !== 'string' || !newsId || typeof scheduleId !== 'string' || !scheduleId) return invalidPayload()
    try {
      switch (this.news.publishScheduled(newsId, scheduleId, assignment.jobId, deadlineAt)) {
        case 'stale':
          return permanentFailure('The News schedule is no longer current')
        case 'deadline-exceeded':
          return permanentFailure('The News publication deadline has passed')
        case 'pending-registration':
          return { errorCode: 'NewsSchedulePending', errorMessage: 'The News schedule registration is still pending' }
        case 'not-due':
          return { errorCode: 'NewsScheduleNotDue', errorMessage: 'The News is not due for publication' }
        case 'published':
        case 'already-published':
          return undefined
        case 'attempt-expired':
          return 'expired'
      }
    } catch (error) {
      if (error instanceof NotFoundException) return permanentFailure('The News article no longer exists')
      throw error
    }
  }

  private async reportOutcome(assignment: TaskForgeAssignment, failure: TaskForgeFailure | undefined, signal: AbortSignal, deadlineAt: number): Promise<void> {
    let backoff = 250
    while (!signal.aborted) {
      const remaining = deadlineAt - Date.now()
      if (remaining <= 0) return
      try {
        await this.taskForge.report(assignment, failure, signal, remaining)
        return
      } catch (error) {
        if (signal.aborted) return
        if (!(error instanceof TaskForgeRequestError) || !error.retryable) {
          this.logger.warn(`TaskForge did not accept the outcome for attempt ${assignment.attemptId}`)
          return
        }
        if (deadlineAt - Date.now() <= backoff) return
        await delay(backoff, undefined, { signal }).catch(() => undefined)
        backoff = Math.min(backoff * 2, 1000)
      }
    }
  }
}

function invalidPayload(): TaskForgeFailure {
  return { errorCode: 'InvalidPayload', errorMessage: 'The WoWiki job payload is invalid' }
}

function permanentFailure(errorMessage: string): TaskForgeFailure {
  return { errorCode: 'NonRetryableJobException', errorMessage }
}
