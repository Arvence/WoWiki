import { useState, type FormEvent } from 'react'
import InfoPageLayout from '../components/layout/InfoPageLayout'

export default function ContactPage(): JSX.Element {
  const [sent, setSent] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSent(true)
    event.currentTarget.reset()
  }

  return (
    <InfoPageLayout eyebrow="Support" title="Contact WoWiki" summary="Report an issue, request help, propose a correction, or talk with the team responsible for the WoWiki community." sections={[]}>
      <div className="grid items-start gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="message-heading">
          <h2 id="message-heading" className="text-2xl font-bold text-text">Send a message</h2>
          <p className="mt-2 max-w-2xl leading-7 text-muted">Choose the closest topic and include page links, account details, or reproduction steps when relevant. Never send passwords, authentication codes, or payment information.</p>
          {sent ? <div className="mt-6 border-y border-success/50 bg-success/10 px-4 py-6" role="status"><p className="font-semibold text-text">Message received</p><p className="mt-1 text-sm text-muted">Thanks for contacting WoWiki. The team will review your message.</p><button type="button" onClick={() => setSent(false)} className="mt-4 text-sm font-semibold text-primary hover:text-primary-hover">Send another message</button></div> : (
            <form onSubmit={submit} className="mt-6 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold text-text">Name<input name="name" required maxLength={80} autoComplete="name" className="h-11 rounded border border-border bg-surface px-3 font-normal text-text outline-none focus:border-primary" /></label>
                <label className="grid gap-1.5 text-sm font-semibold text-text">Email<input name="email" required type="email" autoComplete="email" className="h-11 rounded border border-border bg-surface px-3 font-normal text-text outline-none focus:border-primary" /></label>
              </div>
              <label className="grid gap-1.5 text-sm font-semibold text-text">Topic<select name="topic" defaultValue="content" className="h-11 rounded border border-border bg-surface px-3 font-normal text-text outline-none focus:border-primary"><option value="content">Content correction</option><option value="account">Account help</option><option value="privacy">Privacy request</option><option value="safety">Safety or abuse report</option><option value="copyright">Copyright concern</option><option value="other">Other</option></select></label>
              <label className="grid gap-1.5 text-sm font-semibold text-text">Page URL <span className="font-normal text-muted">(optional)</span><input name="url" type="url" placeholder="https://wowiki.example/..." className="h-11 rounded border border-border bg-surface px-3 font-normal text-text outline-none placeholder:text-muted focus:border-primary" /></label>
              <label className="grid gap-1.5 text-sm font-semibold text-text">Message<textarea name="message" required minLength={20} maxLength={4000} rows={8} className="resize-y rounded border border-border bg-surface px-3 py-3 font-normal leading-6 text-text outline-none focus:border-primary" /></label>
              <div className="flex items-center justify-between gap-4 border-t border-border pt-4"><p className="text-xs text-muted">Submitting this form does not create a support account.</p><button type="submit" className="rounded bg-primary px-5 py-2.5 text-sm font-bold text-background hover:bg-primary-hover">Send message</button></div>
            </form>
          )}
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24" aria-label="Contact information">
          <section className="border-b border-border pb-5"><h2 className="font-bold text-text">Email</h2><a href="mailto:support@wowiki.example" className="mt-2 block break-all text-sm text-primary hover:text-primary-hover">support@wowiki.example</a><p className="mt-2 text-sm leading-6 text-muted">Best for account access, private reports, and legal requests.</p></section>
          <section className="border-b border-border pb-5"><h2 className="font-bold text-text">Response times</h2><dl className="mt-3 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted">Safety reports</dt><dd className="font-semibold text-text">24 hours</dd></div><div className="flex justify-between gap-4"><dt className="text-muted">Account help</dt><dd className="font-semibold text-text">2-3 days</dd></div><div className="flex justify-between gap-4"><dt className="text-muted">Corrections</dt><dd className="font-semibold text-text">Up to 7 days</dd></div></dl></section>
          <section><h2 className="text-sm font-bold text-text">Before contacting us</h2><p className="mt-2 text-sm leading-6 text-muted">For factual corrections, include the article URL and a reliable source. For abuse reports, preserve relevant links and timestamps.</p></section>
        </aside>
      </div>
    </InfoPageLayout>
  )
}
