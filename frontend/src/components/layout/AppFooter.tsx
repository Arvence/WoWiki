import { Link } from 'react-router-dom'

const socialLinks = [
  { label: 'Twitter', href: 'https://twitter.com', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z' },
  { label: 'Instagram', href: 'https://instagram.com', path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.5-3.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z' },
  { label: 'Discord', href: 'https://discord.com', path: 'M19.54 5.34A16.3 16.3 0 0 0 15.44 4l-.5 1.03a15.2 15.2 0 0 0-5.88 0L8.55 4a16.5 16.5 0 0 0-4.1 1.35C1.85 9.2 1.15 12.95 1.5 16.65a16.7 16.7 0 0 0 5.03 2.55l1.23-1.68a10.7 10.7 0 0 1-1.94-.94l.48-.37c3.74 1.73 7.8 1.73 11.5 0l.5.37c-.63.37-1.28.68-1.95.94l1.23 1.68a16.6 16.6 0 0 0 5.02-2.55c.41-4.29-.7-8-3.06-11.31ZM8.68 14.38c-1.12 0-2.04-1.03-2.04-2.3s.9-2.3 2.04-2.3c1.15 0 2.06 1.04 2.04 2.3 0 1.27-.9 2.3-2.04 2.3Zm6.64 0c-1.12 0-2.04-1.03-2.04-2.3s.9-2.3 2.04-2.3c1.15 0 2.06 1.04 2.04 2.3 0 1.27-.89 2.3-2.04 2.3Z' },
  { label: 'Twitch', href: 'https://twitch.tv', path: 'M2 2h20v14l-5 5h-4l-3 3v-3H6l-4-4V2Zm2 2v12l3 3h5v2l2-2h3l3-3V4H4Zm5 3h2v6H9V7Zm5 0h2v6h-2V7Z' },
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
      { label: 'Careers', to: '/careers' },
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
          <p className="leading-6">A community-driven World of Warcraft encyclopedia with reliable lore, guides, and character insights.</p>
          <div className="flex items-center gap-2 pt-2" aria-label="WoWiki social links">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition hover:border-primary hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d={social.path} /></svg>
              </a>
            ))}
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
