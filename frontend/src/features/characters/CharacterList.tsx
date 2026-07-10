import type { Character } from '../../types/character'

type CharacterListProps = {
  characters: Character[]
  loading: boolean
  error: string | null
}

export default function CharacterList({ characters, loading, error }: CharacterListProps): JSX.Element {
  return (
    <div className="mt-8 rounded-2xl border border-border bg-surface/70 p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold text-text">Characters from the backend</h3>
        <span className="text-sm text-muted">{characters.length} available</span>
      </div>

      {loading && <p className="text-text">Loading characters...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4">
          {characters.map((character) => (
            <div key={character.id} className="rounded-lg border border-border bg-background/70 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="font-semibold text-text">{character.name}</h4>
                  <p className="text-sm text-muted">{character.race} · {character.className}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary sm:self-start">{character.faction}</span>
              </div>
              <p className="mt-2 text-sm text-text">{character.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
