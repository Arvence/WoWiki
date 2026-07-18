export type ApiErrorResponse = {
  statusCode?: number
  status?: number
  error?: string
  message?: string | string[]
  title?: string
  detail?: string
  errors?: Record<string, string[]>
  timestamp?: string
  path?: string
}
