import React from 'react'

const categories = [
  'Races',
  'Classes',
  'Dungeons',
  'Raids',
  'Items',
  'Quests',
]

const popular = [
  { title: 'Sylvanas Windrunner', type: 'NPC', views: 12543 },
  { title: "Dragonflight: The Hidden Vale", type: 'Zone', views: 9842 },
  { title: 'Epic Plate of the Fallen', type: 'Item', views: 7601 },
]

export default function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <header className="bg-slate-900/72 backdrop-blur sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-3 grid grid-cols-3 items-center gap-4">
          {/* Left: Logo/Home */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-extrabold text-gold hover:opacity-90">WoWiki</a>
          </div>

          {/* Center: Wide Search */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl">
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35" />
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth={2} />
              </svg>
              <input aria-label="Search WoW Wiki" placeholder="Search WoW Wiki" className="pl-12 pr-4 py-2 rounded-full border border-slate-700 bg-slate-800 text-sm w-full focus:outline-none focus:ring-2 focus:ring-wow-gold/30 placeholder:text-slate-400 text-slate-200" />
            </div>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center justify-end gap-3">
            <a href="/guides" aria-label="Guides" className="p-2 rounded hover:bg-slate-800/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20h9" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h8" />
              </svg>
            </a>

            <a href="/news" aria-label="News" className="p-2 rounded hover:bg-slate-800/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="4" width="18" height="14" rx="2" ry="2" strokeWidth={1.5} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h5" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <article className="rounded-2xl overflow-hidden shadow-lg card-surface">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1600375964243-6b1f5a8d3f0b?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=abc" alt="WoW" className="w-full h-56 object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-6 text-white">
                <h2 className="text-3xl font-bold">The Fall of Quel'Thalas</h2>
                <p className="text-sm opacity-90">An illustrated deep-dive into the Battle for Silvermoon and its aftermath.</p>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                <span className="px-2 py-1 bg-wow-gold/10 text-gold rounded">Lore</span>
                <span>Updated 3 days ago</span>
                <span>·</span>
                <span>By <strong className="text-slate-100">Archivist</strong></span>
              </div>

              <p className="text-slate-200 leading-relaxed">
                Quel'Thalas, the home of the high elves, stood proud for millennia. This article traces the political tensions,
                the military campaigns, and the tragic fall that reshaped Azeroth's history.
              </p>

              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 rounded-md bg-wow-gold text-slate-900">Read full article</button>
                <button className="px-4 py-2 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800">Save</button>
                <button className="ml-auto text-sm text-slate-400">Share</button>
              </div>
            </div>
          </article>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {popular.map((p) => (
              <div key={p.title} className="card-surface rounded-lg p-4 shadow-sm hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-slate-700 rounded flex items-center justify-center text-wow-gold font-bold">{p.type[0]}</div>
                  <div>
                    <h3 className="font-semibold text-slate-100">{p.title}</h3>
                    <div className="text-xs text-slate-400">{p.type} · {p.views.toLocaleString()} views</div>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mt-3">A concise summary or excerpt can live here to entice readers to open the page.</p>
              </div>
            ))}
          </div>
        </section>

        <aside>
          <div className="sticky top-24 space-y-6">
            <div className="card-surface p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-slate-100 mb-3">Categories</h4>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => (
                  <button key={c} className="text-left text-sm px-3 py-2 rounded hover:bg-slate-700/50 text-slate-200">{c}</button>
                ))}
              </div>
            </div>

            <div className="card-surface p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-slate-100 mb-3">Popular Pages</h4>
              <ul className="space-y-2">
                {popular.map((p) => (
                  <li key={p.title} className="flex items-center justify-between">
                    <a className="text-sm text-slate-200 hover:underline">{p.title}</a>
                    <span className="text-xs text-slate-400">{p.views.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card-surface p-4 rounded-lg shadow-sm text-sm text-slate-300">
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
      </main>

      <footer className="border-t border-slate-800 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-sm text-slate-400">© {new Date().getFullYear()} WoWiki — a community-driven World of Warcraft encyclopedia.</div>
      </footer>
    </div>
  )
}
