import type { Character } from '../../types/character'

type CharacterListProps = {
  characters: Character[]
  loading: boolean
  error: string | null
}

export default function CharacterList({ characters, loading, error }: CharacterListProps): JSX.Element {
  return (
    <div className="mt-8 rounded-2xl border border-border bg-surface/70 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-slate-100">Characters from the backend</h3>
        <span className="text-sm text-slate-400">{characters.length} available</span>
      </div>

      {loading && <p className="text-slate-300">Loading characters...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4">
          {characters.map((character) => (
            <div key={character.id} className="rounded-lg border border-border bg-background/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-slate-100">{character.name}</h4>
                  <p className="text-sm text-slate-400">{character.race} · {character.className}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{character.faction}</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{character.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
