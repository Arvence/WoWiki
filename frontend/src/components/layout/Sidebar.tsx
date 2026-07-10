type SidebarProps = {
  categories: string[]
  popular: Array<{ title: string; views: number }>
}

export default function Sidebar({ categories, popular }: SidebarProps): JSX.Element {
  return (
    <aside>
      <div className="sticky top-24 space-y-6">
        <div className="bg-surface/80 border border-border p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-slate-100 mb-3">Categories</h4>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <button key={category} className="text-left text-sm px-3 py-2 rounded hover:bg-slate-700/50 text-slate-200">{category}</button>
            ))}
          </div>
        </div>

        <div className="bg-surface/80 border border-border p-4 rounded-lg shadow-sm">
          <h4 className="font-semibold text-slate-100 mb-3">Popular Pages</h4>
          <ul className="space-y-2">
            {popular.map((item) => (
              <li key={item.title} className="flex items-center justify-between">
                <a className="text-sm text-slate-200 hover:underline">{item.title}</a>
                <span className="text-xs text-slate-400">{item.views.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-surface/80 border border-border p-4 rounded-lg shadow-sm text-sm text-slate-300">
          <h4 className="font-semibold text-slate-100 mb-3">Quick Facts</h4>
          <dl className="grid grid-cols-2 gap-2">
            <div>
              <dt className="text-xs text-slate-400">Races</dt>
              <dd className="font-medium text-slate-100">42</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Zones</dt>
              <dd className="font-medium text-slate-100">128</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Items</dt>
              <dd className="font-medium text-slate-100">9,342</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Guides</dt>
              <dd className="font-medium text-slate-100">421</dd>
            </div>
          </dl>
        </div>
      </div>
    </aside>
  )
}
