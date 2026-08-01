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

  const normalizedQuery = normalizeSearchText(query.trim())
  const terms = normalizedQuery.split(/\s+/).filter(Boolean)
  return results
    .map((result) => {
      const haystack = normalizeSearchText(`${result.title} ${result.description} ${result.category} ${result.searchableText}`)
      return { result, haystack, rank: score(result, terms, normalizedQuery) }
    })
    .filter(({ haystack }) => terms.every((term) => haystack.includes(term)))
    .sort((a, b) => b.rank - a.rank || a.result.title.localeCompare(b.result.title))
    .map(({ result }) => result)
}

function score(result: SearchResult, terms: string[], fullQuery: string): number {
  const title = normalizeSearchText(result.title)
  const category = normalizeSearchText(result.category)
  const description = normalizeSearchText(result.description)
  const phraseScore = title === fullQuery ? 30 : title.startsWith(fullQuery) ? 18 : title.includes(fullQuery) ? 10 : 0

  return phraseScore + terms.reduce((total, term) => {
    const titleScore = title === term ? 12 : title.startsWith(term) ? 7 : title.includes(term) ? 4 : 0
    const categoryScore = category === term ? 5 : category.includes(term) ? 2 : 0
    const descriptionScore = description.includes(term) ? 1 : 0
    return total + titleScore + categoryScore + descriptionScore
  }, 0)
}

function normalizeSearchText(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase()
}
