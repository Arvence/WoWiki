import { Injectable } from '@nestjs/common'
import type { Report } from '../models/report.model'

type TaskForgeJobSubmission = {
  id: string
  status: string
}

type TaskForgeClientConfiguration = {
  baseUrl: string
  callbackBaseUrl: string
  timeoutMs: number
}

@Injectable()
export class TaskForgeClient {
  private readonly configuration = readConfiguration()

  async submitUserReport(report: Report): Promise<TaskForgeJobSubmission> {
    const externalReference = `WOW-${report.id}`
    const callbackUrl = [
      this.configuration.callbackBaseUrl,
      'api/internal/taskforge/user-reports',
      encodeURIComponent(report.id),
      'ready',
    ].join('/')
    const response = await fetch(`${this.configuration.baseUrl}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': `wowiki-user-report-${report.id}`,
      },
      body: JSON.stringify({
        type: 'http-request',
        priority: 'Normal',
        payload: {
          url: callbackUrl,
          method: 'POST',
          body: {
            reportId: report.id,
            externalReference,
          },
          headers: {
            'X-TaskForge-Source': 'wowiki-user-reports',
          },
        },
        maxRetries: 3,
        timeoutSeconds: 10,
      }),
      signal: AbortSignal.timeout(this.configuration.timeoutMs),
    })

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`TaskForge rejected the user-report job with HTTP ${response.status}`)
    }

    const job = await response.json() as Partial<TaskForgeJobSubmission>
    if (
      typeof job.id !== 'string'
      || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(job.id)
      || typeof job.status !== 'string'
    ) {
      throw new Error('TaskForge returned an invalid job response')
    }

    return { id: job.id, status: job.status }
  }
}

function readConfiguration(): TaskForgeClientConfiguration {
  return {
    baseUrl: readHttpUrl(
      'TASKFORGE_URL',
      process.env.TASKFORGE_URL ?? 'http://127.0.0.1:8275',
    ),
    callbackBaseUrl: readHttpUrl(
      'TASKFORGE_USER_REPORT_CALLBACK_BASE_URL',
      process.env.TASKFORGE_USER_REPORT_CALLBACK_BASE_URL ?? 'http://127.0.0.1:5000',
    ),
    timeoutMs: readPositiveInteger(
      process.env.TASKFORGE_SUBMISSION_TIMEOUT_MS,
      3000,
    ),
  }
}

function readHttpUrl(name: string, value: string): string {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${name} must be an absolute HTTP or HTTPS URL`)
  }

  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:')
    || url.username
    || url.password
    || url.search
    || url.hash
  ) {
    throw new Error(`${name} must be an absolute HTTP or HTTPS URL without credentials, query, or fragment`)
  }

  return url.toString().replace(/\/+$/, '')
}

function readPositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}
