import { talentCalculatorClasses } from '../talentCalculator.config'
import { useTalentClass } from '../hooks/useTalentClass'
import type { Talent, TalentTree } from '../types/talent'

type TalentTreeLayoutProps = {
  classId: string
  ranks: Record<string, number>
  onRankChange: (talentId: string, rank: number) => void
  onResetTalents: (talentIds: string[]) => void
}

export default function TalentTreeLayout({ classId, ranks, onRankChange, onResetTalents }: TalentTreeLayoutProps): JSX.Element {
  const configuredClass = talentCalculatorClasses.find((gameClass) => gameClass.id === classId) ?? talentCalculatorClasses[0]
  const { talentClass, loading, error } = useTalentClass(classId)

  if (loading) {
    return (
      <section className="mt-5 grid min-w-[48rem] grid-cols-3 gap-4" aria-label={`Loading ${configuredClass.name} talent trees`}>
        {configuredClass.specializations.map((specialization) => (
          <div key={specialization} className="min-h-[32rem] animate-pulse rounded-2xl bg-background/45">
            <div className="h-16 bg-background/40 px-5 py-4 text-base font-black text-muted/50">{specialization}</div>
          </div>
        ))}
      </section>
    )
  }

  if (error || !talentClass) {
    return <p className="mt-5 rounded-xl bg-danger/10 px-4 py-5 text-sm text-danger">{error ?? 'Talent data could not be loaded.'}</p>
  }

  return (
    <section className="mt-5 w-full overflow-x-auto pb-2" aria-label={`${talentClass.name} talent trees`}>
      <div className="grid min-w-[48rem] grid-cols-3 gap-4">
        {talentClass.trees.map((tree) => (
          <TalentTreePanel
            key={tree.id}
            tree={tree}
            classColor={talentClass.color}
            ranks={ranks}
            maxTalentPoints={talentClass.maxTalentPoints}
            onRankChange={onRankChange}
            onReset={() => onResetTalents(tree.talents.map((talent) => talent.id))}
          />
        ))}
      </div>
    </section>
  )
}

type TalentTreePanelProps = {
  tree: TalentTree
  classColor: string
  ranks: Record<string, number>
  maxTalentPoints: number
  onRankChange: (talentId: string, rank: number) => void
  onReset: () => void
}

function TalentTreePanel({ tree, classColor, ranks, maxTalentPoints, onRankChange, onReset }: TalentTreePanelProps): JSX.Element {
  const rowCount = Math.max(9, ...tree.talents.map((talent) => talent.row + 1))
  const treePoints = pointsInTree(tree, ranks)
  const totalPoints = Object.values(ranks).reduce((sum, rank) => sum + rank, 0)

  return (
    <article className="min-h-[44rem] rounded-2xl bg-background/45 shadow-[0_12px_32px_rgba(0,0,0,0.2)]">
      <header className="flex items-center justify-between rounded-t-2xl bg-background/45 px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-black tracking-wide text-text">{tree.name}</h2>
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[0.65rem] font-bold text-primary" aria-label={`${treePoints} points in ${tree.name}`}>{treePoints}</span>
        </div>
        <button type="button" onClick={onReset} disabled={treePoints === 0} className="text-xs font-bold text-muted transition hover:text-primary disabled:cursor-default disabled:opacity-35 disabled:hover:text-muted">Reset</button>
      </header>
      <div className="px-4 py-6">
        <div
          className="relative grid grid-cols-4 justify-items-center gap-x-2 gap-y-3"
          style={{ gridTemplateRows: `repeat(${rowCount}, 4.25rem)` }}
        >
          <TalentConnections tree={tree} rowCount={rowCount} classColor={classColor} />
          {tree.talents.map((talent) => {
            const rank = ranks[talent.id] ?? 0
            const canAdd = rank < talent.maxRank
              && totalPoints < maxTalentPoints
              && pointsBeforeRow(tree, talent.row, ranks) >= talent.row * 5
              && (!talent.prerequisiteId || (ranks[talent.prerequisiteId] ?? 0) >= (tree.talents.find((candidate) => candidate.id === talent.prerequisiteId)?.maxRank ?? 0))
            return (
              <TalentNode
                key={talent.id}
                talent={talent}
                rank={rank}
                canAdd={canAdd}
                classColor={classColor}
                onAdd={() => canAdd && onRankChange(talent.id, rank + 1)}
                onRemove={() => {
                  if (rank === 0) return
                  const nextRanks = { ...ranks, [talent.id]: rank - 1 }
                  if (nextRanks[talent.id] === 0) delete nextRanks[talent.id]
                  if (treeRemainsValid(tree, nextRanks)) onRankChange(talent.id, rank - 1)
                }}
              />
            )
          })}
        </div>
      </div>
    </article>
  )
}

type TalentNodeProps = {
  talent: Talent
  rank: number
  canAdd: boolean
  classColor: string
  onAdd: () => void
  onRemove: () => void
}

function TalentNode({ talent, rank, canAdd, classColor, onAdd, onRemove }: TalentNodeProps): JSX.Element {
  const initials = talent.name
    .split(/\s+/)
    .filter((word) => !['of', 'the', 'and'].includes(word.toLowerCase()))
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()

  return (
    <button
      type="button"
      title={`${talent.name}\n${talent.description}\nMax rank: ${talent.maxRank}`}
      aria-label={`${talent.name}, rank ${rank} of ${talent.maxRank}`}
      onClick={onAdd}
      onContextMenu={(event) => { event.preventDefault(); onRemove() }}
      className={`group relative z-10 h-14 w-14 rounded-xl text-xs font-black shadow-[0_8px_18px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_22px_rgba(0,0,0,0.38)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${rank > 0 ? 'bg-primary/15 text-primary' : canAdd ? 'bg-surface text-text' : 'bg-surface/65 text-muted/45'}`}
      style={{
        gridColumn: talent.column + 1,
        gridRow: talent.row + 1,
        boxShadow: `inset 0 0 0 1px ${classColor}${rank > 0 ? 'bb' : '55'}, 0 8px 18px rgba(0,0,0,0.3)`,
      }}
    >
      <span aria-hidden="true">{initials}</span>
      <span className="absolute -bottom-1.5 -right-1.5 min-w-6 rounded-full bg-background px-1.5 py-0.5 text-[0.6rem] font-bold text-primary shadow-md">{rank}/{talent.maxRank}</span>
    </button>
  )
}

function TalentConnections({ tree, rowCount, classColor }: { tree: TalentTree; rowCount: number; classColor: string }): JSX.Element {
  const prerequisites = tree.talents.flatMap((talent) => {
    if (!talent.prerequisiteId) return []
    const source = tree.talents.find((candidate) => candidate.id === talent.prerequisiteId)
    return source ? [{ source, target: talent }] : []
  })

  return (
    <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" viewBox={`0 0 4 ${rowCount}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <marker id={`arrow-${tree.id}`} viewBox="0 0 4 4" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto">
          <path d="M0 0 4 2 0 4Z" fill={classColor} />
        </marker>
      </defs>
      {prerequisites.map(({ source, target }) => {
        const sourceX = source.column + 0.5
        const sourceY = source.row + 0.78
        const targetX = target.column + 0.5
        const targetY = target.row + 0.2
        const middleY = sourceY + (targetY - sourceY) / 2
        const path = sourceX === targetX
          ? `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
          : `M ${sourceX} ${sourceY} L ${sourceX} ${middleY} L ${targetX} ${middleY} L ${targetX} ${targetY}`
        return <path key={`${source.id}-${target.id}`} d={path} fill="none" stroke={classColor} strokeOpacity="0.7" strokeWidth="2" vectorEffect="non-scaling-stroke" markerEnd={`url(#arrow-${tree.id})`} />
      })}
    </svg>
  )
}

function pointsInTree(tree: TalentTree, ranks: Record<string, number>): number {
  return tree.talents.reduce((sum, talent) => sum + (ranks[talent.id] ?? 0), 0)
}

function pointsBeforeRow(tree: TalentTree, row: number, ranks: Record<string, number>): number {
  return tree.talents.filter((talent) => talent.row < row).reduce((sum, talent) => sum + (ranks[talent.id] ?? 0), 0)
}

function treeRemainsValid(tree: TalentTree, ranks: Record<string, number>): boolean {
  return tree.talents.every((talent) => {
    if ((ranks[talent.id] ?? 0) === 0) return true
    if (pointsBeforeRow(tree, talent.row, ranks) < talent.row * 5) return false
    if (!talent.prerequisiteId) return true
    const prerequisite = tree.talents.find((candidate) => candidate.id === talent.prerequisiteId)
    return prerequisite ? (ranks[prerequisite.id] ?? 0) >= prerequisite.maxRank : true
  })
}
