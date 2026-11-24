import InfoPageLayout from '../components/layout/InfoPageLayout'
import { openReportDialog } from '../features/reports/reportDialog'

export default function ContactPage(): JSX.Element {
  return (
    <InfoPageLayout eyebrow="Feedback" title="Contact WoWiki" summary="Use Report issue to flag a problem with the portfolio demo." sections={[]}>
      <section aria-labelledby="feedback-heading" className="max-w-2xl space-y-4 py-8">
        <h2 id="feedback-heading" className="text-xl font-bold text-text">Report a content issue</h2>
        <p className="leading-7 text-muted">Reports go to the local WoWiki database. Include the page and what needs correcting, and leave out passwords or other private details.</p>
        <button type="button" className="rounded bg-primary px-4 py-2 text-sm font-semibold text-background hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" onClick={() => openReportDialog({ pagePath: '/contact' })}>Report issue</button>
      </section>
    </InfoPageLayout>
  )
}
