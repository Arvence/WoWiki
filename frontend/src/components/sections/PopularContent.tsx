type PopularItem = {
  title: string
  type: string
  views: number
}

type PopularContentProps = {
  items: PopularItem[]
}

export default function PopularContent({ items }: PopularContentProps): JSX.Element {
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
      {items.map((item) => (
        <div key={item.title} className="rounded-lg border border-border bg-surface/80 p-4 shadow-sm hover:shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded bg-surface-alt font-bold text-primary">{item.type[0]}</div>
            <div>
              <h3 className="font-semibold text-text">{item.title}</h3>
              <div className="text-xs text-muted">{item.type} · {item.views.toLocaleString()} views</div>
            </div>
          </div>
          <p className="mt-3 text-sm text-text">A concise summary or excerpt can live here to entice readers to open the page.</p>
        </div>
      ))}
    </div>
  )
}
