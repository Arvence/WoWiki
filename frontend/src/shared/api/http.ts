import type { ApiErrorResponse } from '../types/api-error'

type HttpOptions = Omit<RequestInit, 'body' | 'method'> & {
  errorMessage?: string
  notFoundMessage?: string
}

type RequestOptions = RequestInit & {
  errorMessage?: string
  notFoundMessage?: string
}

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly response?: ApiErrorResponse,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { errorMessage = 'Request failed', notFoundMessage, headers: initialHeaders, ...requestOptions } = options
  const headers = new Headers(initialHeaders)

  if (requestOptions.body !== undefined && !(requestOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(url, { ...requestOptions, headers })
  } catch {
    throw new HttpError(errorMessage, 0)
  }

  const body = await parseResponseBody(response)
  if (!response.ok) {
    const apiError = isApiErrorResponse(body) ? body : undefined
    const backendMessage = apiError
      ? Array.isArray(apiError.message) ? apiError.message.join(', ') : apiError.message
      : undefined
    const message = response.status === 404 && notFoundMessage ? notFoundMessage : backendMessage || errorMessage
    throw new HttpError(message, response.status, apiError)
  }

  return body as T
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined
  const text = await response.text()
  if (!text) return undefined

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<ApiErrorResponse>
  return typeof candidate.statusCode === 'number' && (typeof candidate.message === 'string' || Array.isArray(candidate.message))
}

export const http = {
  get<T>(url: string, options?: HttpOptions): Promise<T> {
    return request<T>(url, { ...options, method: 'GET' })
  },

  post<T>(url: string, body?: unknown, options?: HttpOptions): Promise<T> {
    return request<T>(url, {
      ...options,
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  },

  patch<T>(url: string, body: unknown, options?: HttpOptions): Promise<T> {
    return request<T>(url, { ...options, method: 'PATCH', body: JSON.stringify(body) })
  },

  delete(url: string, options?: HttpOptions): Promise<void> {
    return request<void>(url, { ...options, method: 'DELETE' })
  },
}
