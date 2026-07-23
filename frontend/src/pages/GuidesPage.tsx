import { Link } from 'react-router-dom'
import AppFooter from '../components/layout/AppFooter'
import AppHeader from '../components/layout/AppHeader'

const guideSections = [
  { title: 'Class Builds', description: 'Talents, rotations, gear priorities, and role advice for every Classic class.', link: '/database/classes', linkLabel: 'Browse classes' },
  { title: 'Dungeon Guides', description: 'Boss mechanics, efficient routes, useful quests, and preparation for five-player content.', link: '/database/dungeons', linkLabel: 'Explore dungeons' },
  { title: 'Raid Guides', description: 'Encounter strategies, group composition, consumables, and loot planning for raid teams.', link: '/database/raids', linkLabel: 'Explore raids' },
  { title: 'PvP Guides', description: 'Battleground tactics, class matchups, honor progression, and practical gearing advice.', link: '/community', linkLabel: 'Read community advice' },
  { title: 'Leveling Guides', description: 'Quest routes, zone progression, professions, and gold-saving tips for the journey to max level.', link: '/community', linkLabel: 'Find leveling entries' },
  { title: 'Profession Guides', description: 'Training paths, material planning, crafted upgrades, and complementary profession pairings.', link: '/database/items', linkLabel: 'Browse useful items' },
]

export default function GuidesPage(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <header className="border-b border-border pb-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Plan your adventure</p>
          <h1 className="mt-3 text-4xl font-light tracking-tight text-text sm:text-5xl">World of Warcraft Guides</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted">Practical, focused walkthroughs for leveling, building your character, and overcoming Azeroth’s toughest encounters.</p>
        </header>
        <section className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3" aria-label="Guide categories">
          {guideSections.map((guide, index) => (
            <article key={guide.title} className="group flex min-h-56 flex-col rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
              <span className="text-xs font-bold tracking-[0.18em] text-primary/70">{String(index + 1).padStart(2, '0')}</span>
              <h2 className="mt-5 text-xl font-black text-text transition group-hover:text-primary">{guide.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted">{guide.description}</p>
              <Link to={guide.link} className="mt-6 text-sm font-bold text-primary hover:text-primary-hover">{guide.linkLabel} <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </section>
      </main>
      <AppFooter />
    </div>
  )
}
