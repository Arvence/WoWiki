const DAY_IN_MILLISECONDS = 86_400_000

export function formatDate(value: string, options: Intl.DateTimeFormatOptions, locale = 'en'): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale, options).format(date)
}

export function formatRelativeDate(value: string, fallbackOptions: Intl.DateTimeFormatOptions = { dateStyle: 'long' }, locale = 'en'): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const elapsedDays = Math.round((date.getTime() - Date.now()) / DAY_IN_MILLISECONDS)
  return Math.abs(elapsedDays) < 7
    ? new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(elapsedDays, 'day')
    : formatDate(value, fallbackOptions, locale)
}

export function formatCompactAge(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000))
  if (elapsedMinutes === 0) return 'now'
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`
  if (elapsedMinutes < 1_440) return `${Math.floor(elapsedMinutes / 60)}h`

  const elapsedDays = Math.floor(elapsedMinutes / 1_440)
  if (elapsedDays < 7) return `${elapsedDays}d`
  if (elapsedDays < 30) return `${Math.floor(elapsedDays / 7)}w`
  if (elapsedDays < 365) return `${Math.floor(elapsedDays / 30)}mo`
  return `${Math.floor(elapsedDays / 365)}y`
}
