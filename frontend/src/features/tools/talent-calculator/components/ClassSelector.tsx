import { talentCalculatorClasses } from '../talentCalculator.config'

type ClassSelectorProps = {
  selectedClass: string | null
  onSelect: (classId: string) => void
}

export default function ClassSelector({ selectedClass, onSelect }: ClassSelectorProps): JSX.Element {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="mx-auto flex w-max min-w-full justify-center gap-2.5 px-1">
        {talentCalculatorClasses.map((gameClass) => {
          const selected = selectedClass === gameClass.id
          return (
            <button
              key={gameClass.id}
              type="button"
              aria-label={gameClass.name}
              aria-pressed={selected}
              onClick={() => onSelect(gameClass.id)}
              className={`group h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-background/55 p-2 shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition duration-200 hover:-translate-y-1 hover:bg-primary/[0.08] hover:shadow-[0_14px_28px_rgba(0,0,0,0.28)] focus:outline-none focus-visible:shadow-[0_0_0_3px_rgba(212,169,73,0.45)] ${selected ? 'bg-primary/[0.12] shadow-[0_0_24px_rgba(212,169,73,0.28)]' : ''}`}
            >
              {gameClass.image
                ? <img src={gameClass.image} alt="" className="h-full w-full object-contain drop-shadow-[0_5px_7px_rgba(0,0,0,0.38)] transition duration-200 group-hover:scale-110" />
                : <span className="block h-full w-full bg-gradient-to-br from-surface via-background/80 to-primary/[0.08]" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
