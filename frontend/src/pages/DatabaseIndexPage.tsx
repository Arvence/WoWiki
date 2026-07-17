import { Link } from 'react-router-dom'
import databaseBackground from '../assets/images/database-gnome-archive-background.png'
import AppFooter from '../components/layout/AppFooter'
import AppHeader from '../components/layout/AppHeader'
import { databaseCollections as collections } from '../features/database/database.config'

export default function DatabaseIndexPage(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-[120rem] flex-1 px-3 py-7 sm:px-5 sm:py-10 lg:px-6">
        <section
          className="relative isolate flex min-h-[34rem] items-center overflow-hidden rounded-3xl border border-border bg-surface px-6 py-10 shadow-[0_22px_60px_rgba(0,0,0,0.32)] sm:px-9 lg:min-h-[38rem] lg:px-12"
          style={{ backgroundImage: `url(${databaseBackground})`, backgroundPosition: 'center right', backgroundSize: 'cover' }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-[68%] bg-gradient-to-r from-background/90 via-background/60 to-transparent" aria-hidden="true" />
          <div className="max-w-3xl">
            <h1 className="inline-block border-b border-primary/60 pb-3 text-3xl font-light tracking-tight text-primary drop-shadow-[0_0_18px_rgba(212,169,73,0.18)] sm:text-5xl">World of Warcraft Database</h1>
            <div className="mt-5 space-y-4 text-sm leading-7 text-muted sm:text-base sm:leading-8">
              <p>
                Azeroth is built from countless connected stories, places, people, and rewards. The WoWiki Database brings that information together as a structured reference for players who want a clear path through the world—whether they are recalling the history of a familiar character, comparing the identities of the game’s classes, preparing for an instance, or tracking down a memorable item.
              </p>
              <p>
                Each collection is organized around one part of the game and presented on its own focused page. Characters connect the factions and events that shaped the world. Classes describe the paths available to adventurers. Dungeons and raids gather the group challenges hidden across Azeroth, while the item archive records the weapons, armor, and treasures earned along the way.
              </p>
              <p>
                This archive is designed to grow alongside WoWiki. As more records are added, these collections will form a connected map of Classic World of Warcraft knowledge: easy to browse when you need a quick answer, consistent enough to compare related game data, and useful as a starting point for deeper guides and community discoveries.
              </p>
            </div>
          </div>
        </section>

        <section className="pt-6">
          <nav className="grid gap-x-12 gap-y-8 md:grid-cols-2 xl:grid-cols-3" aria-label="Game database collections">
            {collections.map((collection) => (
              <section key={collection.href} className="self-start border-l border-primary/35 pl-4 sm:pl-5" aria-labelledby={`collection-${collection.id}`}>
                <Link to={collection.href} className="group block border-b border-border/70 pb-3 focus:outline-none focus-visible:border-primary">
                  <span className="flex items-center justify-between gap-4">
                    <span id={`collection-${collection.id}`} className="text-lg font-black text-text transition group-hover:text-primary">{collection.title}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">View all <span className="inline-block transition group-hover:translate-x-0.5" aria-hidden="true">→</span></span>
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted">{collection.note}</span>
                </Link>
                <ul className="mt-1" aria-label={`${collection.title} sections`}>
                  {collection.sections.map((section) => (
                    <li key={section}>
                      <Link to={collection.href} className="group/child flex min-h-9 items-center justify-between border-b border-border/40 px-1 py-2 text-sm font-medium text-muted transition hover:border-primary/40 hover:bg-primary/[0.035] hover:px-2 hover:text-text focus:outline-none focus-visible:border-primary focus-visible:text-primary">
                        {section}
                        <span className="text-xs text-muted/45 transition group-hover/child:translate-x-0.5 group-hover/child:text-primary" aria-hidden="true">›</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </section>
      </main>
      <AppFooter />
    </div>
  )
}
