import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import TextTooltip from '../../../components/ui/TextTooltip'
import { formatCompactAge, formatDate } from '../../../shared/utils/date'
import styles from './CompactFeed.module.css'

export type CompactFeedItem = {
  id: string
  title: string
  publishedAt: string
  href?: string
  marker: ReactNode
}

type CompactFeedPanelProps = {
  title: string
  tone: 'tracker' | 'news'
  entries: readonly CompactFeedItem[]
  loading: boolean
  error: string | null
  emptyMessage: string
  controls?: ReactNode
  logoSrc?: string
  sourceLabel?: string
}

const INITIAL_ENTRY_LIMIT = 10

function FeedLogo({ title, src }: { title: string; src?: string }): JSX.Element {
  return (
    <span className={styles.logo} role="img" aria-label={`${title} logo${src ? '' : ' placeholder'}`}>
      {src ? <img src={src} alt="" /> : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="4" width="17" height="16" rx="2" />
          <path d="M7 9.5h10M7 13h7M7 16.5h4" />
        </svg>
      )}
    </span>
  )
}

function CompactFeedEntry({ entry }: { entry: CompactFeedItem }): JSX.Element {
  const content = (
    <>
      {entry.marker}
      <time dateTime={entry.publishedAt} title={formatDate(entry.publishedAt, { dateStyle: 'long', timeStyle: 'short' })} className={styles.time}>
        {formatCompactAge(entry.publishedAt)}
      </time>
      <span className={styles.entryTitle}>{entry.title}</span>
    </>
  )
  const internalLink = entry.href?.startsWith('/') && !entry.href.startsWith('//')
  const externalLink = entry.href && /^https?:\/\//i.test(entry.href)

  return (
    <li className={styles.listItem}>
      <TextTooltip text={entry.title} className="w-full" onlyWhenTruncated={false}>
        {internalLink ? <Link to={entry.href!} className={styles.entry}>{content}</Link>
          : externalLink ? <a href={entry.href} className={styles.entry}>{content}</a>
            : <div tabIndex={0} className={styles.entry}>{content}</div>}
      </TextTooltip>
    </li>
  )
}

export function CustomizeFeedButton(): JSX.Element {
  return (
    <TextTooltip text="Customize Feed — coming later" onlyWhenTruncated={false}>
      <button type="button" className={styles.iconButton} aria-label="Customize Feed" aria-disabled="true">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
          <circle cx="9" cy="6" r="2" />
          <circle cx="15" cy="12" r="2" />
          <circle cx="11" cy="18" r="2" />
        </svg>
      </button>
    </TextTooltip>
  )
}

export default function CompactFeedPanel({ title, tone, entries, loading, error, emptyMessage, controls, logoSrc, sourceLabel }: CompactFeedPanelProps): JSX.Element {
  const id = useId()
  const headingId = `${id}-heading`
  const entriesId = `${id}-entries`
  const [showAll, setShowAll] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const visibleEntries = showAll ? entries : entries.slice(0, INITIAL_ENTRY_LIMIT)
  const canToggleLimit = !loading && !error && (showAll || entries.length > INITIAL_ENTRY_LIMIT)

  return (
    <section className={`${styles.panel} ${styles[tone]}`} aria-labelledby={headingId}>
      <header className={styles.head}>
        <FeedLogo title={title} src={logoSrc} />
        <div className={styles.headingGroup}>
          <h2 id={headingId} className={styles.heading}>{title}</h2>
          {sourceLabel && <span className={styles.sourceLabel}>{sourceLabel}</span>}
        </div>
        {tone === 'tracker' && controls}
        <span className={styles.spacer} />
        {tone === 'news' && controls}
        <button
          type="button"
          className={styles.view}
          disabled={!canToggleLimit}
          aria-label={`${showAll ? 'Show less' : 'View all'} ${title}`}
          aria-controls={entriesId}
          aria-expanded={showAll && !collapsed}
          onClick={() => {
            setShowAll((value) => !value)
            setCollapsed(false)
          }}
        >
          <span>{showAll ? 'Show Less' : 'View All'}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
        </button>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${title}`}
          aria-controls={entriesId}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
        >
          <svg className={collapsed ? styles.closedChevron : undefined} viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6" /></svg>
        </button>
      </header>
      <div id={entriesId} hidden={collapsed} aria-busy={loading}>
        {loading ? <p className={styles.status} role="status">Loading {title.toLowerCase()}…</p>
          : error ? <p className={styles.status} role="alert">{title} could not be loaded.</p>
            : visibleEntries.length === 0 ? <p className={styles.status}>{emptyMessage}</p>
              : <ol className={styles.entries}>{visibleEntries.map((entry) => <CompactFeedEntry key={entry.id} entry={entry} />)}</ol>}
      </div>
    </section>
  )
}
