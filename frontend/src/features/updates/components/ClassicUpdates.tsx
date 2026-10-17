import BlueTracker from '../../blue-tracker/components/BlueTracker'
import RecentNews from '../../news/components/RecentNews'
import type { News } from '../../news/types/news'
import styles from './CompactFeed.module.css'

type ClassicUpdatesProps = {
  news: News[]
  loading: boolean
  error: string | null
}

export default function ClassicUpdates({ news, loading, error }: ClassicUpdatesProps): JSX.Element {
  return (
    <section id="news" className={styles.container} aria-label="WoWiki Classic updates">
      <div className={styles.board}>
        <BlueTracker />
        <RecentNews news={news} loading={loading} error={error} />
      </div>
    </section>
  )
}
