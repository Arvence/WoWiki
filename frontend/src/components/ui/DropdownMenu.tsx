interface DropdownMenuProps {
  label: string
  items: string[]
  isOpen: boolean
  onToggle: () => void
  onOpen: () => void
  onClose: () => void
}

export default function DropdownMenu({ label, items, isOpen, onToggle, onOpen, onClose }: DropdownMenuProps): JSX.Element {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1 rounded-md border border-border bg-background/80 px-3 py-2 text-sm font-medium text-text transition hover:border-primary hover:bg-background/90"
      >
        {label}
        <span className="text-muted">▾</span>
      </button>

      <div className={`absolute left-0 top-full z-50 min-w-[14rem] overflow-visible transition duration-150 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="pointer-events-none h-2" />
        <div className="overflow-hidden rounded-md border border-border bg-surface shadow-[0_12px_24px_rgba(0,0,0,0.35)]">
          <div className="space-y-1 p-2">
            {items.map((item) => (
              <a
                key={item}
                href="#"
                className="block rounded-md px-3 py-2 text-sm text-text transition hover:bg-background/90"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
