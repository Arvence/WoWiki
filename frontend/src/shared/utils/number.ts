export function formatNumber(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatCompactNumber(value: number, locale = 'en'): string {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}
