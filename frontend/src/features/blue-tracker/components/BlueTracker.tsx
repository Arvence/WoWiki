import { useEffect, useMemo, useState } from 'react'
import CompactFeedPanel from '../../updates/components/CompactFeedPanel'
import styles from '../../updates/components/CompactFeed.module.css'
import { fetchBlueAnnouncements } from '../api/blueTrackerService'
import type { BlueAnnouncement, BlueRegion } from '../types/announcement'

type RegionFilter = 'ALL' | BlueRegion

export default function BlueTracker(): JSX.Element {
  const [announcements, setAnnouncements] = useState<BlueAnnouncement[]>([])
  const [region, setRegion] = useState<RegionFilter>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void fetchBlueAnnouncements()
      .then((items) => { if (active) setAnnouncements(items) })
      .catch(() => { if (active) setError('Blue Tracker could not be loaded.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const entries = useMemo(() => announcements
    .filter((announcement) => region === 'ALL' || announcement.region === region)
    .sort((first, second) => Date.parse(second.publishedAt) - Date.parse(first.publishedAt) || first.id.localeCompare(second.id))
    .map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      publishedAt: announcement.publishedAt,
      href: announcement.url,
      marker: <span className={`${styles.flag} ${styles[announcement.region]}`}>{announcement.region}</span>,
    })), [announcements, region])

  return (
    <CompactFeedPanel
      title="Blue Tracker"
      tone="tracker"
      entries={entries}
      loading={loading}
      error={error}
      emptyMessage="No announcements are available for this region."
      sourceLabel="Sample feed"
      controls={(
        <div className={styles.segment} role="group" aria-label="Blue Tracker region">
          {(['ALL', 'US', 'EU'] as const).map((filter) => (
            <button key={filter} type="button" aria-pressed={region === filter} onClick={() => setRegion(filter)}>{filter}</button>
          ))}
        </div>
      )}
    />
  )
}
