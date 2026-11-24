import { Link } from 'react-router-dom'
import ReportIssue from '../../features/reports/components/ReportIssue'

const projectLinks = [
  { label: 'GitHub', href: 'https://github.com/Arvence/WoWiki', path: 'M12 .7a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18a4.62 4.62 0 0 1 1.24 3.22c0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12 12 0 0 0 12 .7Z' },
]

const footerGroups = [
  {
    label: 'Explore',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Database', to: '/database' },
      { label: 'Latest News', to: '/#news' },
      { label: 'Community Entries', to: '/community#entries' },
    ],
  },
  {
    label: 'WoWiki',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    label: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Use', to: '/terms' },
    ],
  },
]

export default function AppFooter(): JSX.Element {
  return (
    <footer className="mt-6 border-t border-border py-6 sm:mt-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 text-sm text-muted sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
        <div className="max-w-xl space-y-2">
          <Link to="/" className="inline-flex text-lg font-bold text-primary transition hover:text-primary-hover">WoWiki</Link>
          <p className="leading-6">An independent World of Warcraft Classic portfolio project with sample reference data, discussions, and planning tools.</p>
          <div className="flex items-center gap-2 pt-2" aria-label="WoWiki project links">
            {projectLinks.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition hover:border-primary hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d={social.path} /></svg>
              </a>
            ))}
          </div>
          <div className="pt-2">
            <ReportIssue />
          </div>
          <p className="pt-2 text-xs text-muted/75">&copy; {new Date().getFullYear()} WoWiki. Built by and for the community.</p>
          <p className="max-w-lg text-[0.68rem] leading-5 text-muted/60">WoWiki is an independent fan project and is not affiliated with or endorsed by Blizzard Entertainment. Warcraft and World of Warcraft are trademarks of Blizzard Entertainment.</p>
        </div>

        <nav className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3" aria-label="Footer navigation">
          {footerGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">{group.label}</p>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.to}>
                    {link.to.includes('#') ? (
                      <a className="text-text/85 transition hover:text-primary focus:outline-none focus-visible:text-primary focus-visible:underline" href={link.to}>{link.label}</a>
                    ) : (
                      <Link className="text-text/85 transition hover:text-primary focus:outline-none focus-visible:text-primary focus-visible:underline" to={link.to}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  )
}
