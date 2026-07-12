import { Link } from 'react-router-dom'
import InfoPageLayout from '../components/layout/InfoPageLayout'

const roles = [
  {
    id: 'full-stack-engineer',
    title: 'Full-stack Product Engineer',
    team: 'Product Engineering',
    type: 'Full-time',
    location: 'Remote, UTC-1 to UTC+4',
    range: '$78,000-$108,000 USD',
    summary: 'Own community and editorial workflows across React, TypeScript, NestJS, PostgreSQL, and the systems that keep contribution data reliable.',
    responsibilities: ['Build account, publishing, moderation, search, and notification features end to end.', 'Design durable data models and APIs for articles, revisions, comments, reactions, and reports.', 'Improve accessibility, responsiveness, observability, testing, and delivery practices.', 'Work directly with editorial and community contributors to turn ambiguous needs into maintainable product behavior.'],
    requirements: ['Strong TypeScript experience across modern frontend and backend applications.', 'Production experience with relational databases, API design, authentication, and automated testing.', 'Ability to make pragmatic architecture decisions in a small team.', 'Clear written communication and comfort reviewing product behavior, not only code.'],
  },
  {
    id: 'knowledge-editor',
    title: 'Senior Knowledge Editor',
    team: 'Editorial',
    type: 'Full-time',
    location: 'Remote, Americas or Europe',
    range: '$58,000-$76,000 USD',
    summary: 'Set the editorial standard for a structured Warcraft reference while helping contributors turn complex research into clear, sourced material.',
    responsibilities: ['Plan and review coverage across lore, characters, locations, systems, and patch-sensitive guides.', 'Create sourcing, style, correction, and version-context standards that contributors can apply consistently.', 'Edit high-impact pages and coach community writers through constructive review.', 'Partner with engineering on revision history, citations, review queues, and contributor tooling.'],
    requirements: ['Professional editing, research, documentation, journalism, or knowledge-management experience.', 'Excellent command of source evaluation, structure, fact checking, and plain-language writing.', 'Deep familiarity with Warcraft or demonstrated ability to master a large fictional and technical domain.', 'Confidence making transparent corrections and handling good-faith editorial disagreement.'],
  },
  {
    id: 'community-safety',
    title: 'Community Operations & Safety Lead',
    team: 'Community',
    type: 'Full-time',
    location: 'Remote, UTC-5 to UTC+3',
    range: '$62,000-$84,000 USD',
    summary: 'Build fair, understandable community operations for contributors, moderators, support requests, safety reports, and appeals.',
    responsibilities: ['Define moderation playbooks, escalation paths, response targets, and contributor support processes.', 'Review difficult safety and conduct cases with consistency, context, and careful documentation.', 'Recruit and support volunteer moderators as the community grows.', 'Use reporting trends and member feedback to improve policy, product controls, and abuse prevention.'],
    requirements: ['Experience in trust and safety, community operations, moderation, customer support, or online governance.', 'Sound judgment under uncertainty and the ability to explain sensitive decisions respectfully.', 'Experience writing operational policy and protecting confidential information.', 'Comfort collaborating with product and engineering on tooling, metrics, and incident response.'],
  },
]

export default function CareersPage(): JSX.Element {
  return (
    <InfoPageLayout eyebrow="Build with us" title="Careers at WoWiki" summary="Help build an independent knowledge platform where careful research, useful software, and a healthy player community reinforce each other." sections={[]}>
      <div className="py-8">
        <section className="grid gap-6 pb-8 md:grid-cols-3" aria-label="Working at WoWiki">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Stage</p><p className="mt-2 font-semibold text-text">Early product team</p><p className="mt-1 text-sm leading-6 text-muted">Small, hands-on, and building foundational systems without layers of process.</p></div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Work model</p><p className="mt-2 font-semibold text-text">Remote by default</p><p className="mt-1 text-sm leading-6 text-muted">Written decisions, protected focus time, and purposeful live collaboration.</p></div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Mission</p><p className="mt-2 font-semibold text-text">Knowledge that lasts</p><p className="mt-1 text-sm leading-6 text-muted">Make complex game information understandable, traceable, and open to improvement.</p></div>
        </section>

        <section className="border-y border-border py-9" aria-labelledby="open-roles">
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Current opportunities</p>
              <h2 id="open-roles" className="mt-2 text-2xl font-bold text-text sm:text-3xl">Open roles</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Join a small team building the product, editorial systems, and community operations behind WoWiki.</p>
            </div>
            <div className="flex shrink-0 items-center gap-4 border-l border-primary/50 py-1 pl-5" aria-label={`${roles.length} open positions`}>
              <span className="text-5xl font-bold tabular-nums leading-none text-primary">{roles.length}</span>
              <span className="text-sm font-bold uppercase leading-6 tracking-wider text-text">Open<br />positions</span>
            </div>
          </div>
          <div className="mt-6 divide-y divide-border">
            {roles.map((role) => (
              <article key={role.id} id={role.id} className="scroll-mt-24 py-7">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{role.team}</p>
                    <h3 className="mt-1 text-xl font-bold text-text sm:text-2xl">{role.title}</h3>
                    <p className="mt-3 max-w-3xl leading-7 text-muted">{role.summary}</p>
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <div><h4 className="text-sm font-bold text-text">What you will do</h4><ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-muted">{role.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></div>
                      <div><h4 className="text-sm font-bold text-text">What we are looking for</h4><ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-muted">{role.requirements.map((item) => <li key={item}>{item}</li>)}</ul></div>
                    </div>
                  </div>
                  <aside className="bg-surface-alt/25 p-4" aria-label={`${role.title} details`}>
                    <dl className="space-y-4 text-sm"><div><dt className="text-muted">Employment</dt><dd className="mt-1 font-semibold text-text">{role.type}</dd></div><div><dt className="text-muted">Location</dt><dd className="mt-1 font-semibold text-text">{role.location}</dd></div><div><dt className="text-muted">Base salary</dt><dd className="mt-1 font-semibold text-text">{role.range}</dd></div></dl>
                    <a href={`mailto:careers@wowiki.example?subject=${encodeURIComponent(`Application: ${role.title}`)}`} className="mt-5 inline-flex h-10 w-full items-center justify-center rounded bg-primary px-4 text-sm font-bold text-background hover:bg-primary-hover">Apply by email</a>
                    <p className="mt-2 text-xs leading-5 text-muted">Include a resume or work history and a short note about why this role fits.</p>
                  </aside>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 pt-9 pb-9 lg:grid-cols-2">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">How we work</p><h2 className="mt-2 text-2xl font-bold text-text">Principles over perks</h2><div className="mt-4 space-y-4 leading-7 text-muted"><p><strong className="text-text">Readers come first.</strong> We prefer clear, dependable behavior over impressive-looking complexity.</p><p><strong className="text-text">Sources beat certainty.</strong> Strong opinions are welcome; unexplained claims are not.</p><p><strong className="text-text">Small changes still deserve care.</strong> Accessibility, privacy, moderation, and maintainability are part of the feature.</p><p><strong className="text-text">Disagreement should produce better decisions.</strong> We document tradeoffs, invite challenge, and commit once a direction is chosen.</p></div></div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Benefits</p><h2 className="mt-2 text-2xl font-bold text-text">Support for sustainable work</h2><ul className="mt-4 grid gap-3 text-sm leading-6 text-muted sm:grid-cols-2"><li className="border-l-2 border-primary/50 pl-3">Flexible working hours with defined collaboration windows</li><li className="border-l-2 border-primary/50 pl-3">25 days paid leave plus local public holidays</li><li className="border-l-2 border-primary/50 pl-3">Health coverage or regional healthcare stipend</li><li className="border-l-2 border-primary/50 pl-3">Home-office equipment and internet budget</li><li className="border-l-2 border-primary/50 pl-3">Annual learning and conference allowance</li><li className="border-l-2 border-primary/50 pl-3">Twice-yearly compensation and growth reviews</li></ul></div>
        </section>

        <section className="grid gap-8 border-t border-border py-9 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Hiring process</p><h2 className="mt-2 text-2xl font-bold text-text">Know what to expect</h2><ol className="mt-5 grid gap-4 sm:grid-cols-2"><li><span className="text-xs font-bold text-primary">01</span><p className="mt-1 font-semibold text-text">Application review</p><p className="mt-1 text-sm leading-6 text-muted">We review relevant experience, work samples, and your note. Expect a response within ten business days.</p></li><li><span className="text-xs font-bold text-primary">02</span><p className="mt-1 font-semibold text-text">Introductory conversation</p><p className="mt-1 text-sm leading-6 text-muted">A 30-minute call covering the role, your goals, work model, and practical questions.</p></li><li><span className="text-xs font-bold text-primary">03</span><p className="mt-1 font-semibold text-text">Role discussion</p><p className="mt-1 text-sm leading-6 text-muted">A structured working conversation using a realistic scenario. No unpaid take-home projects.</p></li><li><span className="text-xs font-bold text-primary">04</span><p className="mt-1 font-semibold text-text">Final conversation</p><p className="mt-1 text-sm leading-6 text-muted">Meet collaborators, align expectations, check references with permission, and review a written offer.</p></li></ol></div>
          <aside className="bg-surface-alt/25 p-5"><h2 className="font-bold text-text">Accessibility</h2><p className="mt-2 text-sm leading-6 text-muted">We provide reasonable accommodations throughout the hiring process. Share what you need when applying or contact us privately.</p><Link to="/contact" className="mt-4 inline-flex text-sm font-semibold text-primary hover:text-primary-hover">Contact the team <span className="ml-2" aria-hidden="true">&rarr;</span></Link></aside>
        </section>

        <section className="pt-8"><h2 className="text-xl font-bold text-text">Equal opportunity</h2><p className="mt-3 max-w-4xl leading-7 text-muted">WoWiki evaluates applicants based on skills, experience, judgment, and the requirements of each role. We do not discriminate based on race, color, religion, national origin, ancestry, sex, gender identity or expression, sexual orientation, age, disability, medical status, veteran status, marital status, or any other characteristic protected by applicable law.</p><p className="mt-3 max-w-4xl leading-7 text-muted">If no listed role fits, you may send a concise introduction to <a href="mailto:careers@wowiki.example" className="font-semibold text-primary hover:text-primary-hover">careers@wowiki.example</a>. We review general applications when a relevant need emerges.</p></section>
      </div>
    </InfoPageLayout>
  )
}
