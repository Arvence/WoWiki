import { formatNumber } from '../../shared/utils/number'

type ViewerCountProps = {
  count?: number
  compact?: boolean
  className?: string
}

export default function ViewerCount({ count = 0, compact = false, className = '' }: ViewerCountProps): JSX.Element {
  const formattedCount = formatNumber(count)

  return (
    <span className={`inline-flex items-center tabular-nums text-muted ${compact ? 'gap-1 text-xs' : 'gap-2 px-2 text-sm'} ${className}`} aria-label={`${formattedCount} views`}>
      <svg className={`${compact ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]'} shrink-0 text-primary`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
      {formattedCount}
    </span>
  )
}
