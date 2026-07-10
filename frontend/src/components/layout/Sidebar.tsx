import type { Character } from '../../types/character'

type SidebarProps = {
  categories: string[]
  popular: Array<{ title: string; views: number }>
  characters: Character[]
  loading: boolean
  error: string | null
}

const categoryIcons: Record<string, JSX.Element> = {
  Races: (
    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v18M4 12h16" />
    </svg>
  ),
  Classes: (
    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 18h16" />
      <path d="M6 12h12" />
    </svg>
  ),
  Dungeons: (
    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20V4l8 4 8-4v16H4z" />
    </svg>
  ),
  Raids: (
    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="7" />
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Lore: (
    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 4h8v16H8z" />
      <path d="M8 8h8" />
    </svg>
  ),
  Factions: (
    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v16H4z" />
      <path d="M4 12h16" />
    </svg>
  ),
  Professions: (
    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6h12v12H6z" />
      <path d="M6 12h12" />
    </svg>
  ),
  Quests: (
    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 4l8 4-8 4-8-4 8-4z" />
      <path d="M4 12l8 4 8-4" />
    </svg>
  ),
}

export default function Sidebar({ categories, popular, characters, loading, error }: SidebarProps): JSX.Element {
  return (
    <aside className="w-full">
      <div className="space-y-6 lg:sticky lg:top-24">
        <div className="rounded-lg border border-border bg-surface/80 p-4 shadow-sm">
          <h4 className="mb-3 font-semibold text-text">Categories</h4>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <button key={category} className="flex items-center gap-2 rounded px-3 py-2 text-left text-sm text-text hover:bg-surface-alt/70">
                {categoryIcons[category] ?? <span className="h-4 w-4" />}
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface/80 p-4 shadow-sm">
          <h4 className="mb-3 font-semibold text-text">Popular Pages</h4>
          <ul className="space-y-2">
            {popular.map((item) => (
              <li key={item.title} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  <a className="text-sm text-text hover:underline">{item.title}</a>
                </div>
                <span className="text-xs text-muted">{item.views.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-surface/80 p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-semibold text-text">Popular Characters</h4>
            <span className="text-xs text-muted">{characters.length}</span>
          </div>

          {loading && <p className="text-text">Loading characters...</p>}
          {error && <p className="text-danger">{error}</p>}

          {!loading && !error && (
            <div className="space-y-3">
              {characters.map((character) => (
                <div key={character.id} className="rounded-lg border border-border bg-background/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className="font-semibold text-text">{character.name}</h5>
                      <p className="text-xs text-muted">{character.race} · {character.className}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[0.65rem] font-medium text-primary">{character.faction}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </aside>
  )
}
