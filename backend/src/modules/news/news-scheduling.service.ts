import { ConflictException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import type { NewsRecord } from './models/news.model'
import { NewsService, toEditorNews } from './news.service'
import { TaskForgeClient, TaskForgeRequestError } from './taskforge.client'

@Injectable()
export class NewsSchedulingService {
  private readonly logger = new Logger(NewsSchedulingService.name)

  constructor(private readonly news: NewsService, private readonly taskForge: TaskForgeClient) {}

  async schedule(id: string, scheduledAtLocal: string, enforcePublicationDeadline?: boolean) {
    this.requireConfiguration()
    const { article, previousJobId } = this.news.prepareSchedule(id, scheduledAtLocal, enforcePublicationDeadline)
    await this.cancel(previousJobId)
    return this.register(article)
  }

  retry(id: string) {
    this.requireConfiguration()
    return this.register(this.news.pendingSchedule(id))
  }

  async removeSchedule(id: string) {
    const { article, previousJobId } = this.news.removeSchedule(id)
    await this.cancel(previousJobId)
    return toEditorNews(article)
  }

  async publishNow(id: string) {
    const { article, previousJobId } = this.news.publishNow(id)
    await this.cancel(previousJobId)
    return toEditorNews(article)
  }

  async remove(id: string): Promise<void> {
    await this.cancel(this.news.remove(id))
  }

  private async register({ id, scheduleId, scheduledAtUtc }: NewsRecord) {
    if (!scheduleId || !scheduledAtUtc) throw new ConflictException('This article has no pending schedule registration')
    let job
    try {
      job = await this.taskForge.submitNews(id, scheduleId, scheduledAtUtc)
    } catch (error) {
      if (!(error instanceof TaskForgeRequestError)) throw error
      if (error.retryable) {
        throw new ServiceUnavailableException('TaskForge did not confirm the schedule. Retry registration for this draft.')
      }
      this.news.discardPendingSchedule(id, scheduleId)
      this.logger.warn(`TaskForge rejected News schedule registration with HTTP ${error.status}`)
      if (error.status === 409) throw new ConflictException('TaskForge rejected the schedule key. Save a new schedule.')
      throw new ServiceUnavailableException('TaskForge rejected registration. The article is a draft. Check the TaskForge configuration before scheduling again.')
    }

    const canRun = !job.cancellationRequested && ['Queued', 'Processing', 'Retrying'].includes(job.status)
    let confirmed
    try {
      confirmed = this.news.confirmSchedule(id, scheduleId, job.id, canRun)
    } catch (error) {
      if (!(error instanceof NotFoundException)) throw error
      await this.cancel(job.id)
      throw error
    }
    if (confirmed) return toEditorNews(confirmed)

    if (!canRun) {
      this.news.discardPendingSchedule(id, scheduleId)
      throw new ConflictException('The TaskForge job can no longer run. Save a new schedule.')
    }
    await this.cancel(job.id)
    throw new ConflictException('The schedule changed before registration finished')
  }

  private requireConfiguration(): void {
    if (!this.taskForge.configured) throw new ServiceUnavailableException('TaskForge scheduling is not configured')
  }

  private async cancel(jobId: string | undefined): Promise<void> {
    if (!jobId) return
    try {
      await this.taskForge.cancel(jobId)
    } catch {
      this.logger.warn(`Could not cancel TaskForge job ${jobId}. Its local schedule is already inactive.`)
    }
  }
}
