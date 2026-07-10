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
        <div key={item.title} className="bg-surface/80 border border-border rounded-lg p-4 shadow-sm hover:shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-slate-700 rounded flex items-center justify-center text-primary font-bold">{item.type[0]}</div>
            <div>
              <h3 className="font-semibold text-slate-100">{item.title}</h3>
              <div className="text-xs text-slate-400">{item.type} · {item.views.toLocaleString()} views</div>
            </div>
          </div>
          <p className="text-sm text-slate-300 mt-3">A concise summary or excerpt can live here to entice readers to open the page.</p>
        </div>
      ))}
    </div>
  )
}
