import { Injectable } from '@nestjs/common'

const applicationId = 'wowiki'
const waitSeconds = 20
const requestTimeoutMs = 5000
const jobIdPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i

export type TaskForgeAssignment = {
  jobId: string
  attemptId: string
  workerId: string
  startedAtUtc: string
  deadlineAtUtc: string
  payload: unknown
}

type TaskForgeJob = {
  id: string
  status: 'Pending' | 'Queued' | 'Processing' | 'Retrying' | 'Completed' | 'DeadLettered' | 'Cancelled'
  cancellationRequested: boolean
  owningWorkerId: string | null
  startedAtUtc: string | null
}

export type TaskForgeFailure = { errorCode: string; errorMessage: string }

export class TaskForgeRequestError extends Error {
  constructor(readonly status?: number) {
    super(status === undefined ? 'TaskForge response unavailable or invalid' : `TaskForge returned HTTP ${status}`)
  }

  get retryable(): boolean {
    return this.status === undefined || this.status === 408 || this.status === 429 || this.status >= 500
  }
}

@Injectable()
export class TaskForgeClient {
  private readonly baseUrl = readBaseUrl(process.env.TASKFORGE_URL)
  private readonly apiKey = process.env.TASKFORGE_API_KEY?.trim()

  get configured(): boolean {
    return Boolean(this.baseUrl && this.apiKey && /^[A-Za-z0-9_-]{32,128}$/.test(this.apiKey))
  }

  async submitNews(newsId: string, scheduleId: string, scheduledAtUtc: string): Promise<TaskForgeJob> {
    const body = { applicationId, scheduledAtUtc, payload: { operation: 'publish-news', newsId, scheduleId } }
    return parseJob(await this.request('/api/jobs', [200, 201], {
      method: 'POST', body, idempotencyKey: `publish-news:${scheduleId}`,
    }))
  }

  async acquire(workerId: string, signal: AbortSignal): Promise<TaskForgeAssignment | undefined> {
    const value = await this.request('/api/executions/wait', [200, 204], {
      method: 'POST', body: { applicationId, workerId, supportedTypes: ['general'], waitSeconds }, signal, timeoutMs: (waitSeconds + 5) * 1000,
    })
    if (value === undefined) return
    const assignment = asObject(value)
    if (assignment.applicationId !== applicationId || assignment.workerId !== workerId || assignment.type !== 'general'
      || !isJobId(assignment.jobId) || !isJobId(assignment.attemptId)
      || !isTimestamp(assignment.startedAtUtc) || !isTimestamp(assignment.deadlineAtUtc)) {
      throw new TaskForgeRequestError()
    }
    return {
      jobId: assignment.jobId,
      attemptId: assignment.attemptId,
      workerId,
      startedAtUtc: assignment.startedAtUtc,
      deadlineAtUtc: assignment.deadlineAtUtc,
      payload: assignment.payload,
    }
  }

  async getJob(id: string, signal: AbortSignal, timeoutMs: number): Promise<TaskForgeJob> {
    return parseJob(await this.request(`/api/jobs/${id}`, [200], { signal, timeoutMs: Math.min(timeoutMs, requestTimeoutMs) }), id)
  }

  async report(assignment: TaskForgeAssignment, failure: TaskForgeFailure | undefined, signal: AbortSignal, timeoutMs: number): Promise<void> {
    const { jobId, attemptId, workerId } = assignment
    const path = `/api/jobs/${jobId}/attempts/${attemptId}/${failure ? 'fail' : 'complete'}`
    await this.request(path, [200], { method: 'POST', body: { applicationId, workerId, ...failure }, signal, timeoutMs: Math.min(timeoutMs, requestTimeoutMs), ignoreBody: true })
  }

  async cancel(id: string): Promise<void> {
    await this.request(`/api/jobs/${id}/cancel`, [200, 404, 409], { method: 'POST', ignoreBody: true })
  }

  private async request(path: string, statuses: number[], options: RequestOptions = {}): Promise<unknown> {
    if (!this.configured) throw new TaskForgeRequestError()
    const { method = 'GET', body, idempotencyKey, signal, timeoutMs = requestTimeoutMs, ignoreBody } = options
    const timeout = AbortSignal.timeout(timeoutMs)
    const headers: Record<string, string> = { Authorization: `Bearer ${this.apiKey}` }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method, headers, body: body === undefined ? undefined : JSON.stringify(body),
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout, redirect: 'error',
      })
      if (!statuses.includes(response.status) || ignoreBody) {
        void response.body?.cancel().catch(() => undefined)
        if (!statuses.includes(response.status)) throw new TaskForgeRequestError(response.status)
        return
      }
      return response.status === 204 ? undefined : await response.json()
    } catch (error) {
      throw error instanceof TaskForgeRequestError ? error : new TaskForgeRequestError()
    }
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: object
  idempotencyKey?: string
  signal?: AbortSignal
  timeoutMs?: number
  ignoreBody?: boolean
}

function readBaseUrl(value: string | undefined): string | undefined {
  if (!value) return
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) return
    return url.href.replace(/\/+$/, '')
  } catch {
    return undefined
  }
}

function isJobId(value: unknown): value is string {
  return typeof value === 'string' && jobIdPattern.test(value)
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

function asObject(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || !value || Array.isArray(value)) throw new TaskForgeRequestError()
  return value as Record<string, unknown>
}

function parseJob(value: unknown, expectedId?: string): TaskForgeJob {
  const job = asObject(value)
  const { id, status, cancellationRequested, owningWorkerId, startedAtUtc } = job
  if (!isJobId(id) || (expectedId && id !== expectedId) || job.applicationId !== applicationId
    || (status !== 'Pending' && status !== 'Queued' && status !== 'Processing' && status !== 'Retrying'
      && status !== 'Completed' && status !== 'DeadLettered' && status !== 'Cancelled')
    || typeof cancellationRequested !== 'boolean' || (owningWorkerId !== null && typeof owningWorkerId !== 'string')
    || (startedAtUtc !== null && !isTimestamp(startedAtUtc))) {
    throw new TaskForgeRequestError()
  }
  return { id, status, cancellationRequested, owningWorkerId, startedAtUtc }
}
