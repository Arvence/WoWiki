export default function HeroArticle(): JSX.Element {
  return (
    <article className="rounded-2xl overflow-hidden shadow-lg bg-surface/80 border border-border">
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
          <span className="px-2 py-1 bg-primary/10 text-primary rounded">Lore</span>
          <span>Updated 3 days ago</span>
          <span>·</span>
          <span>By <strong className="text-slate-100">Archivist</strong></span>
        </div>

        <p className="text-slate-200 leading-relaxed">
          Quel'Thalas, the home of the high elves, stood proud for millennia. This article traces the political tensions,
          the military campaigns, and the tragic fall that reshaped Azeroth's history.
        </p>

        <div className="mt-6 flex gap-3">
          <button className="px-4 py-2 rounded-md bg-primary text-slate-900">Read full article</button>
          <button className="px-4 py-2 rounded-md border border-border text-slate-200 hover:bg-surface">Save</button>
          <button className="ml-auto text-sm text-slate-400">Share</button>
        </div>
      </div>
    </article>
  )
}
