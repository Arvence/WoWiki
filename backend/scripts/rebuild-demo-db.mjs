import { existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const demoPath = resolve(import.meta.dirname, '../Data/demo/wowiki-demo.db')
const classSource = 'https://worldofwarcraft.blizzard.com/en-us/news/23317716/taking-your-first-steps-in-world-of-warcraft-classic'
const primerSource = 'https://worldofwarcraft.blizzard.com/en-us/news/23090134/wow-classic-primer-for-new-players'
const direMaulSource = 'https://worldofwarcraft.blizzard.com/en-us/news/23185723/wow-classic-dire-maul-now-available'
const moltenCoreSource = 'https://worldofwarcraft.blizzard.com/en-us/news/24165121/20th-anniversary-realms-molten-core-and-onyxia-s-lair-now-live'
const blackwingLairSource = 'https://worldofwarcraft.blizzard.com/en-us/news/23302788/wow-classic-descend-into-the-depths-of-blackwing-lair'
const zulGurubSource = 'https://worldofwarcraft.blizzard.com/en-us/news/23391283/wow-classic-zulgurub-and-more-now-available'
const ahnQirajSource = 'https://worldofwarcraft.blizzard.com/en-us/news/23493335/explore-the-temple-of-ahnqiraj-and-ruins-of-ahnqiraj'
const naxxramasSource = 'https://worldofwarcraft.blizzard.com/en-us/news/23572632/wow-classic-naxxramas-is-now-live'
const worldBossSource = 'https://worldofwarcraft.blizzard.com/en-us/news/23221132/wow-classic-world-bosses-and-pvp-honor-system-available'
const restoringClassicSource = 'https://worldofwarcraft.blizzard.com/en-us/news/22646759/restoring-history-creating-wow-classic-panel-recap'
const gameVersion = 'WoW Classic'

const classes = [
  { id: '1', name: 'Warrior', roles: ['tank', 'damage'], resource: 'Rage', armor: 'All', description: 'Weapon masters who fight on the front line as damage dealers or tanks.', races: ['Dwarf', 'Gnome', 'Human', 'Night Elf', 'Orc', 'Tauren', 'Troll', 'Undead'], specializations: ['Arms', 'Fury', 'Protection'], gameVersion, officialSource: classSource },
  { id: '2', name: 'Mage', roles: ['damage'], resource: 'Mana', armor: 'Cloth', description: 'Ranged spellcasters who wield arcane, fire, and frost magic.', races: ['Gnome', 'Human', 'Troll', 'Undead'], specializations: ['Arcane', 'Fire', 'Frost'], gameVersion, officialSource: classSource },
  { id: '3', name: 'Priest', roles: ['healer', 'damage'], resource: 'Mana', armor: 'Cloth', description: 'Spellcasters who heal with holy magic or attack through shadow magic.', races: ['Dwarf', 'Human', 'Night Elf', 'Troll', 'Undead'], specializations: ['Discipline', 'Holy', 'Shadow'], gameVersion, officialSource: classSource },
  { id: '4', name: 'Paladin', roles: ['tank', 'healer', 'damage'], resource: 'Mana', armor: 'All', description: 'Alliance-only holy warriors who combine divine magic with martial combat.', races: ['Dwarf', 'Human'], specializations: ['Holy', 'Protection', 'Retribution'], gameVersion, officialSource: classSource },
  { id: '5', name: 'Hunter', roles: ['damage'], resource: 'Mana', armor: 'Cloth, Leather, Mail', description: 'Ranged survival experts who fight alongside trained beasts.', races: ['Dwarf', 'Night Elf', 'Orc', 'Tauren', 'Troll'], specializations: ['Beast Mastery', 'Marksmanship', 'Survival'], gameVersion, officialSource: classSource },
  { id: '6', name: 'Shaman', roles: ['healer', 'damage'], resource: 'Mana', armor: 'Cloth, Leather, Mail', description: 'Horde-only spellcasters who channel the elements and empower totems.', races: ['Orc', 'Tauren', 'Troll'], specializations: ['Elemental', 'Enhancement', 'Restoration'], gameVersion, officialSource: classSource },
  { id: '7', name: 'Druid', roles: ['tank', 'healer', 'damage'], resource: 'Mana, Rage, Energy', armor: 'Cloth, Leather', description: 'Versatile nature spellcasters who heal, cast, or assume primal beast forms.', races: ['Night Elf', 'Tauren'], specializations: ['Balance', 'Feral', 'Restoration'], gameVersion, officialSource: classSource },
  { id: '8', name: 'Rogue', roles: ['damage'], resource: 'Energy, Combo Points', armor: 'Cloth, Leather', description: 'Stealth combatants who rely on blades, poisons, energy, and combo points.', races: ['Dwarf', 'Gnome', 'Human', 'Night Elf', 'Orc', 'Troll', 'Undead'], specializations: ['Assassination', 'Combat', 'Subtlety'], gameVersion, officialSource: classSource },
  { id: '9', name: 'Warlock', roles: ['damage'], resource: 'Mana, Soul Shards', armor: 'Cloth', description: 'Dark spellcasters who summon demons, curse enemies, and wield destructive magic.', races: ['Gnome', 'Human', 'Orc', 'Undead'], specializations: ['Affliction', 'Demonology', 'Destruction'], gameVersion, officialSource: classSource },
]

const factions = [
  { id: '1', name: 'Alliance', alignment: 'alliance', races: ['Dwarf', 'Gnome', 'Human', 'Night Elf'], headquarters: 'Alliance capital cities', description: 'One of WoW Classic’s two playable factions.', gameVersion, officialSource: primerSource },
  { id: '2', name: 'Horde', alignment: 'horde', races: ['Orc', 'Tauren', 'Troll', 'Undead'], headquarters: 'Horde capital cities', description: 'One of WoW Classic’s two playable factions.', gameVersion, officialSource: primerSource },
]

const dungeons = [
  {
    id: '1',
    name: 'Dire Maul',
    location: 'Feralas',
    levelRange: '54-60 (55-60 recommended)',
    playerLimit: 5,
    bosses: ['Lethtendris', 'Zevrim Thornhoof', 'Hydrospawn', 'Alzzin the Wildshaper', 'Illyanna Ravenoak', 'Tendris Warpwood', 'Magister Kalendris', "Immol'thar", 'Prince Tortheldrin', "Guard Mol'dar", 'Stomper Kreeg', 'Guard Fengus', "Guard Slip'kik", 'Captain Kromcrush', "Cho'Rush the Observer", 'King Gordok'],
    description: 'A three-wing, five-player dungeon in the ruined city of Eldre’Thalas. Blizzard lists 16 bosses and a level range of 54-60.',
    gameVersion,
    officialSource: direMaulSource,
  },
]

const raids = [
  {
    id: '1',
    name: 'Molten Core',
    location: 'Burning Steppes',
    level: 60,
    playerLimit: 40,
    bosses: ['Lucifron', 'Magmadar', 'Gehennas', 'Garr', 'Baron Geddon', 'Shazzrah', 'Sulfuron Harbinger', 'Golemagg the Incinerator', 'Majordomo Executus', 'Ragnaros'],
    description: 'A 40-player raid at the bottom of Blackrock Depths and the domain of Ragnaros.',
    gameVersion,
    officialSource: moltenCoreSource,
  },
  {
    id: '2',
    name: "Onyxia's Lair",
    location: 'Dustwallow Marsh',
    level: 60,
    playerLimit: 40,
    bosses: ['Onyxia'],
    description: 'A 40-player raid containing the lair of the black dragon Onyxia.',
    gameVersion,
    officialSource: moltenCoreSource,
  },
  {
    id: '3',
    name: 'Blackwing Lair',
    location: 'Burning Steppes',
    level: 60,
    playerLimit: 40,
    bosses: ['Razorgore the Untamed', 'Vaelastrasz the Corrupt', 'Broodlord Lashlayer', 'Firemaw', 'Ebonroc', 'Flamegore', 'Chromaggus', 'Nefarian'],
    description: 'A 40-player raid at the height of Blackrock Spire where Nefarian commands the black dragonflight.',
    gameVersion,
    officialSource: blackwingLairSource,
  },
  {
    id: '4',
    name: "Zul'Gurub",
    location: 'Stranglethorn Vale',
    level: 60,
    playerLimit: 20,
    bosses: ['High Priest Arlokk', "High Priest Jek'lik", "High Priest Mar'li", 'High Priest Thekal', 'High Priest Venoxis', 'Bloodlord Mandokir', "Jin'do the Hexer", "Gahz'ranka", "Gri'lek", "Hazza'rah", 'Renataki', 'Wushoolay', 'Hakkar'],
    description: 'A max-level, 20-player raid in the ancient troll city of Zul’Gurub, with 13 boss encounters.',
    gameVersion,
    officialSource: zulGurubSource,
  },
  {
    id: '5',
    name: "Ruins of Ahn'Qiraj",
    location: 'Silithus',
    level: 60,
    playerLimit: 20,
    bosses: ['Kurinnaxx', 'General Rajaxx', 'Moam', 'Buru the Gorger', 'Ayamiss the Hunter', 'Ossirian the Unscarred'],
    description: 'An outdoor, 20-player raid beyond the Gates of Ahn’Qiraj, with six bosses.',
    gameVersion,
    officialSource: ahnQirajSource,
  },
  {
    id: '6',
    name: "Temple of Ahn'Qiraj",
    location: 'Silithus',
    level: 60,
    playerLimit: 40,
    bosses: ['The Prophet Skeram', 'Silithid Royalty', 'Battleguard Sartura', 'Fankriss the Unyielding', 'Viscidus', 'Princess Huhuran', 'The Twin Emperors', 'Ouro', "C'Thun"],
    description: 'A 40-player raid beyond the Gates of Ahn’Qiraj where the final encounter is C’Thun.',
    gameVersion,
    officialSource: ahnQirajSource,
  },
  {
    id: '7',
    name: 'Naxxramas',
    location: 'Eastern Plaguelands',
    level: 60,
    playerLimit: 40,
    bosses: ['Patchwerk', 'Grobbulus', 'Gluth', 'Thaddius', 'Instructor Razuvious', 'Gothik the Harvester', 'The Four Horsemen', 'Noth the Plaguebringer', 'Heigan the Unclean', 'Loatheb', "Anub'Rekhan", 'Grand Widow Faerlina', 'Maexxna', 'Sapphiron', "Kel'Thuzad"],
    description: 'A 40-player necropolis raid with four wings, Frostwyrm Lair, and 15 boss encounters.',
    gameVersion,
    officialSource: naxxramasSource,
  },
]

const news = [
  { id: '1', title: 'WoW Classic Primer for New Players', summary: 'Blizzard’s primer covers Classic realms, factions, races, classes, resources, professions, dungeons, and raids.', content: primerSource, category: 'WoW Classic', author: 'Blizzard Entertainment', updatedAt: '2019-08-27T00:00:00.000Z', viewerCount: 0, likeCount: 0, gameVersion, officialSource: primerSource },
  { id: '2', title: 'WoW Classic: Dire Maul Now Available!', summary: 'Blizzard’s overview of the three-wing Dire Maul dungeon, its level range, bosses, quests, and rewards.', content: direMaulSource, category: 'WoW Classic', author: 'Blizzard Entertainment', updatedAt: '2019-10-15T00:00:00.000Z', viewerCount: 0, likeCount: 0, gameVersion, officialSource: direMaulSource },
  { id: '3', title: 'WoW Classic: World Bosses and PvP Honor System Available', summary: 'Blizzard announces Azuregos, Lord Kazzak, and the WoW Classic PvP Honor system.', content: worldBossSource, category: 'WoW Classic', author: 'Blizzard Entertainment', updatedAt: '2019-11-14T00:00:00.000Z', viewerCount: 0, likeCount: 0, gameVersion, officialSource: worldBossSource },
  { id: '4', title: 'WoW Classic: Descend Into the Depths of Blackwing Lair', summary: 'Blizzard’s official overview of Blackwing Lair, its location, eight encounters, and raid rewards.', content: blackwingLairSource, category: 'WoW Classic', author: 'Blizzard Entertainment', updatedAt: '2020-02-12T00:00:00.000Z', viewerCount: 0, likeCount: 0, gameVersion, officialSource: blackwingLairSource },
  { id: '5', title: 'WoW Classic: Zul’Gurub and More Now Available!', summary: 'Blizzard introduces the 20-player Zul’Gurub raid and its 13 boss encounters.', content: zulGurubSource, category: 'WoW Classic', author: 'Blizzard Entertainment', updatedAt: '2020-04-15T00:00:00.000Z', viewerCount: 0, likeCount: 0, gameVersion, officialSource: zulGurubSource },
  { id: '6', title: 'Explore the Temple of Ahn’Qiraj and Ruins of Ahn’Qiraj', summary: 'Blizzard details the 20-player Ruins and 40-player Temple raids in Silithus.', content: ahnQirajSource, category: 'WoW Classic', author: 'Blizzard Entertainment', updatedAt: '2020-08-04T00:00:00.000Z', viewerCount: 0, likeCount: 0, gameVersion, officialSource: ahnQirajSource },
  { id: '7', title: 'WoW Classic: Naxxramas is Now Live!', summary: 'Blizzard’s official overview of the 40-player Naxxramas raid and its 15 encounters.', content: naxxramasSource, category: 'WoW Classic', author: 'Blizzard Entertainment', updatedAt: '2020-12-03T00:00:00.000Z', viewerCount: 0, likeCount: 0, gameVersion, officialSource: naxxramasSource },
  { id: '8', title: 'Restoring History: Creating WoW Classic', summary: 'Blizzard explains how it restored original data and systems to recreate the Classic experience.', content: restoringClassicSource, category: 'WoW Classic', author: 'Blizzard Entertainment', updatedAt: '2018-11-03T00:00:00.000Z', viewerCount: 0, likeCount: 0, gameVersion, officialSource: restoringClassicSource },
]

const collectionData = new Map([
  ['characters', []],
  ['classes', classes],
  ['comments', []],
  ['community', []],
  ['dungeons', dungeons],
  ['factions', factions],
  ['items', []],
  ['news', news],
  ['raids', raids],
  ['reports', []],
])

mkdirSync(dirname(demoPath), { recursive: true })
for (const path of [demoPath, `${demoPath}-shm`, `${demoPath}-wal`]) {
  if (existsSync(path)) unlinkSync(path)
}

const database = new DatabaseSync(demoPath)
database.exec(`
  PRAGMA journal_mode = DELETE;
  PRAGMA synchronous = FULL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
  );

  CREATE TABLE collections (
    name TEXT PRIMARY KEY,
    next_id INTEGER NOT NULL,
    next_sequence INTEGER NOT NULL
  );

  CREATE TABLE entities (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    data TEXT NOT NULL,
    PRIMARY KEY (collection, id),
    UNIQUE (collection, sequence),
    FOREIGN KEY (collection) REFERENCES collections(name) ON DELETE CASCADE
  );

  CREATE INDEX entities_collection_sequence
    ON entities(collection, sequence);
`)

const insertCollection = database.prepare('INSERT INTO collections(name, next_id, next_sequence) VALUES (?, ?, ?)')
const insertEntity = database.prepare('INSERT INTO entities(collection, id, sequence, data) VALUES (?, ?, ?, ?)')

database.exec('BEGIN IMMEDIATE')
try {
  database.prepare('INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)').run(1, '2026-08-14T00:00:00.000Z')
  for (const [collection, entities] of collectionData) {
    const greatestId = entities.reduce((greatest, entity) => Math.max(greatest, Number(entity.id)), 0)
    insertCollection.run(collection, greatestId + 1, entities.length + 1)
    entities.forEach((entity, index) => insertEntity.run(collection, entity.id, index + 1, JSON.stringify(entity)))
  }
  database.exec('COMMIT')
} catch (error) {
  database.exec('ROLLBACK')
  throw error
}

database.exec('VACUUM')
database.close()

console.log(`Rebuilt ${demoPath}`)
for (const [collection, entities] of collectionData) console.log(`${collection}: ${entities.length}`)
