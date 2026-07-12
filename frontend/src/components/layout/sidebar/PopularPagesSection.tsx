type PopularPage = {
  title: string
  views: number
}

type PopularPagesSectionProps = {
  popular: PopularPage[]
}

export default function PopularPagesSection({ popular }: PopularPagesSectionProps): JSX.Element {
  return (
    <section className="rounded-lg border border-border bg-surface/80 p-4 shadow-sm">
      <h4 className="mb-3 font-semibold text-text">Popular Pages</h4>
      <ul className="space-y-2">
        {popular.map((item) => (
          <li key={item.title} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
              <a className="text-sm text-text hover:underline">{item.title}</a>
            </div>
            <ViewerCount count={item.views} compact />
          </li>
        ))}
      </ul>
    </section>
  )
}
import ViewerCount from '../../ui/ViewerCount'
