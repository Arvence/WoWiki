import type { SearchResult } from './searchService'

type SearchIconKind = SearchResult['kind'] | 'All'

type SearchResultIconProps = {
  kind: SearchIconKind
  category?: string
  className?: string
}

export default function SearchResultIcon({ kind, category, className = 'h-5 w-5' }: SearchResultIconProps): JSX.Element {
  const icon = kind === 'Database' ? category ?? kind : kind

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {icon === 'News' && <><path strokeLinecap="round" strokeLinejoin="round" d="M5 5.5h10.5A2.5 2.5 0 0 1 18 8v10.5H7.5A2.5 2.5 0 0 1 5 16V5.5Z" /><path strokeLinecap="round" d="M8 9h7M8 12h7M8 15h4" /><path strokeLinecap="round" strokeLinejoin="round" d="M18 9h1a1 1 0 0 1 1 1v6a2.5 2.5 0 0 1-2.5 2.5" /></>}
      {icon === 'Community' && <><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 16.5 4 19v-4.5A7 7 0 1 1 7.5 16.5Z" /><path strokeLinecap="round" d="M8 9.5h8M8 12.5h5" /></>}
      {icon === 'Characters' && <><circle cx="12" cy="8" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M5.5 19a6.5 6.5 0 0 1 13 0" /></>}
      {icon === 'Classes' && <><path strokeLinecap="round" strokeLinejoin="round" d="m7 4 10 16M17 4 7 20M5.5 6.5 8.5 3M15.5 3l3 3.5M4.5 17.5 7.5 21M16.5 21l3-3.5" /></>}
      {icon === 'Dungeons' && <><path strokeLinecap="round" strokeLinejoin="round" d="M4 20V8l3-3v3l5-4 5 4V5l3 3v12M3 20h18" /><path strokeLinecap="round" d="M9 20v-5a3 3 0 0 1 6 0v5" /></>}
      {icon === 'Raids' && <><path strokeLinecap="round" strokeLinejoin="round" d="m5 4 14 16M19 4 5 20M4 7l3-3M17 4l3 3M4 17l3 3M17 20l3-3" /><circle cx="12" cy="12" r="2.25" fill="currentColor" stroke="none" /></>}
      {icon === 'Items' && <><path strokeLinecap="round" strokeLinejoin="round" d="M5 8.5h14l-1 11H6l-1-11Z" /><path strokeLinecap="round" d="M9 9V7a3 3 0 0 1 6 0v2" /></>}
      {(icon === 'Database' || icon === 'All') && <><circle cx="10.5" cy="10.5" r="6.5" /><path strokeLinecap="round" d="m15.5 15.5 4 4" /></>}
    </svg>
  )
}
