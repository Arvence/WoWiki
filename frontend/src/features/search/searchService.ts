import { fetchCommunityEntries } from '../community/api/communityService'
import { databaseCollections } from '../database/database.config'
import { fetchDatabaseCollection } from '../database/api/databaseService'
import { fetchNews } from '../news/api/newsService'

export type SearchResult = {
  id: string
  kind: 'News' | 'Community' | 'Database'
  category: string
  title: string
  description: string
  href: string
  searchableText: string
}

export async function searchWoWiki(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
  const [news, community, ...collections] = await Promise.all([
    fetchNews(),
    fetchCommunityEntries(),
    ...databaseCollections.map((collection) => fetchDatabaseCollection(collection.id, signal)),
  ])

  const results: SearchResult[] = [
    ...news.map((entry) => ({ id: `news-${entry.id}`, kind: 'News' as const, category: entry.category, title: entry.title, description: entry.summary, href: `/news/${entry.id}`, searchableText: `${entry.title} ${entry.summary} ${entry.content} ${entry.category} ${entry.author}` })),
    ...community.map((entry) => ({ id: `community-${entry.id}`, kind: 'Community' as const, category: entry.category, title: entry.title, description: entry.excerpt, href: `/community/${entry.id}`, searchableText: `${entry.title} ${entry.excerpt} ${entry.content} ${entry.category} ${entry.author} ${(entry.hashtags ?? []).join(' ')}` })),
    ...databaseCollections.flatMap((collection, index) => collections[index].map((entry) => {
      const record = entry as unknown as Record<string, unknown>
      return { id: `${collection.id}-${String(record.id)}`, kind: 'Database' as const, category: collection.title, title: String(record.name ?? 'Untitled record'), description: String(record.description ?? collection.note), href: `${collection.href}?q=${encodeURIComponent(String(record.name ?? ''))}`, searchableText: JSON.stringify(record) }
    })),
  ]

  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return results
    .map((result) => ({ result, haystack: `${result.title} ${result.description} ${result.searchableText}`.toLocaleLowerCase() }))
    .filter(({ haystack }) => terms.every((term) => haystack.includes(term)))
    .sort((a, b) => score(b.result, terms) - score(a.result, terms))
    .map(({ result }) => result)
}

function score(result: SearchResult, terms: string[]): number {
  const title = result.title.toLocaleLowerCase()
  return terms.reduce((total, term) => total + (title === term ? 8 : title.startsWith(term) ? 4 : title.includes(term) ? 2 : 0), 0)
}
