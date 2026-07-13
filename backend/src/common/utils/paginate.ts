import { PaginatedResponse, PaginationOptions } from '../types/pagination.type'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

export function paginate<T>(items: readonly T[], options: PaginationOptions = {}): PaginatedResponse<T> {
  const page = normalizePositiveInteger(options.page, DEFAULT_PAGE)
  const requestedPageSize = normalizePositiveInteger(options.pageSize, DEFAULT_PAGE_SIZE)
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE)
  const start = (page - 1) * pageSize

  return {
    data: items.slice(start, start + pageSize),
    meta: {
      page,
      pageSize,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / pageSize),
    },
  }
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value) || value < 1) return fallback
  return Math.floor(value)
}
