import { useMemo } from 'react'
import CompactFeedPanel, { CustomizeFeedButton } from '../../updates/components/CompactFeedPanel'
import styles from '../../updates/components/CompactFeed.module.css'
import type { News } from '../types/news'

type RecentNewsProps = {
  news: News[]
  loading: boolean
  error: string | null
}

const categoryStyles: Record<string, string> = {
  news: styles.updates,
  'patch notes': styles.updates,
  guide: styles.guides,
  guides: styles.guides,
  raids: styles.raids,
  pvp: styles.pvp,
  community: styles.community,
  events: styles.community,
}

export default function RecentNews({ news, loading, error }: RecentNewsProps): JSX.Element {
  const entries = useMemo(() => [...news]
    .sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt) || first.id.localeCompare(second.id))
    .map((article) => ({
      id: article.id,
      title: article.title,
      publishedAt: article.updatedAt,
      href: `/news/${article.id}`,
      marker: <span className={`${styles.topic} ${categoryStyles[article.category.toLowerCase()] ?? ''}`} role="img" aria-label={article.category} title={article.category} />,
    })), [news])

  return (
    <CompactFeedPanel
      title="Recent News"
      tone="news"
      entries={entries}
      loading={loading}
      error={error}
      emptyMessage="No Classic news is available."
      controls={<CustomizeFeedButton />}
    />
  )
}
