type CategoriesSectionProps = {
  categories: string[]
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

export default function CategoriesSection({ categories }: CategoriesSectionProps): JSX.Element {
  return (
    <section className="rounded-lg border border-border bg-surface/80 p-3 shadow-sm">
      <h4 className="mb-2 text-sm font-semibold text-text">Categories</h4>
      <div className="grid grid-cols-2 gap-1">
        {categories.map((category) => (
          <button key={category} className="flex items-center gap-1.5 rounded px-2 py-1.5 text-left text-xs text-text hover:bg-surface-alt/70">
            {categoryIcons[category] ?? <span className="h-4 w-4" />}
            {category}
          </button>
        ))}
      </div>
    </section>
  )
}
