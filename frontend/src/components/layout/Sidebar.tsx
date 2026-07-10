type SidebarProps = {
  categories: string[]
  popular: Array<{ title: string; views: number }>
}

export default function Sidebar({ categories, popular }: SidebarProps): JSX.Element {
  return (
    <aside className="w-full">
      <div className="space-y-6 lg:sticky lg:top-24">
        <div className="rounded-lg border border-border bg-surface/80 p-4 shadow-sm">
          <h4 className="mb-3 font-semibold text-text">Categories</h4>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <button key={category} className="rounded px-3 py-2 text-left text-sm text-text hover:bg-surface-alt/70">{category}</button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface/80 p-4 shadow-sm">
          <h4 className="mb-3 font-semibold text-text">Popular Pages</h4>
          <ul className="space-y-2">
            {popular.map((item) => (
              <li key={item.title} className="flex items-center justify-between">
                <a className="text-sm text-text hover:underline">{item.title}</a>
                <span className="text-xs text-muted">{item.views.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-surface/80 p-4 text-sm text-text shadow-sm">
          <h4 className="mb-3 font-semibold text-text">Quick Facts</h4>
          <dl className="grid grid-cols-2 gap-2">
            <div>
              <dt className="text-xs text-muted">Races</dt>
              <dd className="font-medium text-text">42</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Zones</dt>
              <dd className="font-medium text-text">128</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Items</dt>
              <dd className="font-medium text-text">9,342</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Guides</dt>
              <dd className="font-medium text-text">421</dd>
            </div>
          </dl>
        </div>
      </div>
    </aside>
  )
}
