import wowClassicLogo from '../../assets/images/wow_classic_logo.png'

export default function HeroArticle(): JSX.Element {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface/80 shadow-lg">
      <div className="relative">
        <div className="h-[20rem] bg-background sm:h-[24rem] lg:h-[25rem]">
          <img src={wowClassicLogo} alt="WoW Classic logo" className="h-full w-full object-contain p-4 pb-16 opacity-90 sm:p-6 sm:pb-24" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background/90 via-background/50 to-transparent sm:h-52" />
        <div className="absolute bottom-3 left-4 right-4 z-10 text-text sm:bottom-4 sm:left-6 sm:right-6">
          <h2 className="text-2xl font-bold sm:text-3xl">The Fall of Quel'Thalas</h2>
          <p className="mt-2 text-sm opacity-90">An illustrated deep-dive into the Battle for Silvermoon and its aftermath.</p>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted sm:gap-4">
          <span className="rounded bg-primary/10 px-2 py-1 text-primary">Lore</span>
          <span>Updated 3 days ago</span>
          <span>·</span>
          <span>By <strong className="text-text">Archivist</strong></span>
        </div>

        <p className="leading-relaxed text-text">
          Quel'Thalas, the home of the high elves, stood proud for millennia. This article traces the political tensions,
          the military campaigns, and the tragic fall that reshaped Azeroth's history.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button className="rounded-md bg-primary px-4 py-2 text-background">Read full article</button>
          <button className="rounded-md border border-border px-4 py-2 text-text hover:bg-surface">Save</button>
          <button className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-text transition hover:bg-surface" aria-label="Share article">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}
