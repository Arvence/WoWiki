import { existsSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'

type CollectionState = { collection: string; records: number; nextId: number; nextSequence: number }
type CountResult = { count: number }
type IntegrityResult = { integrity_check: string }
type SourceCoverage = { total: number; official: number }

const expectedCollections = ['characters', 'classes', 'comments', 'community', 'dungeons', 'factions', 'items', 'news', 'raids', 'reports']
const intentionallyEmptyCollections = ['characters', 'comments', 'community', 'items', 'reports']

export function verifyDemoDatabase(demoDatabasePath: string): void {
  if (!existsSync(demoDatabasePath)) throw new Error(`Demo database template not found: ${demoDatabasePath}`)

  const database = new DatabaseSync(demoDatabasePath, { readOnly: true })
  try {
    const integrity = database.prepare('PRAGMA integrity_check').get() as unknown as IntegrityResult
    if (integrity.integrity_check !== 'ok') throw new Error(`SQLite integrity check failed: ${integrity.integrity_check}`)

    const collections = database.prepare(`
      SELECT c.name AS collection, COUNT(e.id) AS records, c.next_id AS nextId, c.next_sequence AS nextSequence
      FROM collections c
      LEFT JOIN entities e ON e.collection = c.name
      GROUP BY c.name
      ORDER BY c.name
    `).all() as unknown as CollectionState[]

    const collectionNames = collections.map(({ collection }) => collection)
    if (JSON.stringify(collectionNames) !== JSON.stringify(expectedCollections)) throw new Error(`Unexpected collections: ${collectionNames.join(', ')}`)

    for (const collection of intentionallyEmptyCollections) {
      const state = collections.find(({ collection: name }) => name === collection)
      if (!state || state.records !== 0) throw new Error(`${collection} must remain empty`)
    }

    const invalidJson = database.prepare('SELECT COUNT(*) AS count FROM entities WHERE NOT json_valid(data)').get() as unknown as CountResult
    if (invalidJson.count !== 0) throw new Error(`${invalidJson.count} entities contain invalid JSON`)

    const forbiddenReferences = database.prepare(`
      SELECT COUNT(*) AS count
      FROM entities
      WHERE lower(data) LIKE '%tbc%'
         OR lower(data) LIKE '%burning crusade%'
         OR lower(data) LIKE '%wowhead%'
         OR lower(data) LIKE '%cmangos%'
         OR lower(data) LIKE '%community%'
    `).get() as unknown as CountResult
    if (forbiddenReferences.count !== 0) throw new Error(`${forbiddenReferences.count} entities contain forbidden references`)

    const sourceCoverage = database.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN json_extract(data, '$.officialSource') LIKE 'https://worldofwarcraft.blizzard.com/%' THEN 1 ELSE 0 END) AS official
      FROM entities
    `).get() as unknown as SourceCoverage
    if (sourceCoverage.total !== sourceCoverage.official) throw new Error(`Official source coverage is ${sourceCoverage.official}/${sourceCoverage.total}`)

    const nonClassic = database.prepare(`
      SELECT COUNT(*) AS count
      FROM entities
      WHERE json_extract(data, '$.gameVersion') <> 'WoW Classic'
    `).get() as unknown as CountResult
    if (nonClassic.count !== 0) throw new Error(`${nonClassic.count} entities are outside WoW Classic scope`)

    const relationshipErrors = database.prepare(`
      SELECT COUNT(*) AS count
      FROM entities character
      WHERE character.collection = 'characters'
        AND (
          NOT EXISTS (
            SELECT 1 FROM entities class
            WHERE class.collection = 'classes'
              AND class.id = json_extract(character.data, '$.classId')
          )
          OR NOT EXISTS (
            SELECT 1 FROM entities faction
            WHERE faction.collection = 'factions'
              AND faction.id = json_extract(character.data, '$.factionId')
          )
        )
    `).get() as unknown as CountResult
    if (relationshipErrors.count !== 0) throw new Error(`${relationshipErrors.count} characters contain invalid relationships`)

  } finally {
    database.close()
  }
}
