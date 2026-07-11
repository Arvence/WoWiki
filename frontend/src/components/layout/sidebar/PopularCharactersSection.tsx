import { useEffect, useState } from 'react'
import { fetchCharacters } from '../../../features/characters/api/characterService'
import type { Character } from '../../../features/characters/types/character'

export default function PopularCharactersSection(): JSX.Element {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setCharacters(await fetchCharacters())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    void loadCharacters()
  }, [])

  return (
    <section className="rounded-lg border border-border bg-surface/80 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="font-semibold text-text">Popular Characters</h4>
        {!loading && !error && <span className="text-xs text-muted">{characters.length}</span>}
      </div>

      {loading && (
        <div className="space-y-2" aria-label="Loading popular characters">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex animate-pulse items-center gap-3 rounded-md bg-background/40 px-3 py-2">
              <span className="h-8 w-8 rounded-md bg-surface-alt" />
              <span className="h-3 flex-1 rounded bg-surface-alt" />
            </div>
          ))}
        </div>
      )}

      {error && <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>}

      {!loading && !error && characters.length > 0 && (
        <ol className="space-y-2">
          {characters.map((character, index) => {
            const isHorde = character.faction.toLowerCase() === 'horde'

            return (
              <li key={character.id}>
                <a href="#" className="group flex items-center gap-3 rounded-md bg-background/40 px-3 py-2 transition hover:border-border hover:bg-surface-alt/70">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {character.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-text group-hover:text-primary">{character.name}</span>
                    <span className="block truncate text-xs text-muted">{character.race} · {character.className}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5" title={`${character.faction} · Rank ${index + 1}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isHorde ? 'bg-danger' : 'bg-info'}`} />
                    <span className="text-[0.65rem] text-muted">#{index + 1}</span>
                  </span>
                </a>
              </li>
            )
          })}
        </ol>
      )}

      {!loading && !error && characters.length === 0 && (
        <p className="rounded-md bg-background/40 px-3 py-4 text-center text-xs text-muted">No characters available.</p>
      )}
    </section>
  )
}
