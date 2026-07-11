import { CommunityEntry } from '../models/community-entry.model'

export const COMMUNITY_ENTRIES: CommunityEntry[] = [
  {
    id: '1',
    author: 'Arannis',
    title: 'A beginner-friendly route through the Deadmines',
    excerpt: 'A room-by-room walkthrough with suggested levels, key quests, and tips for handling each boss with a new group.',
    category: 'Dungeon Guide',
    publishedAt: '2026-07-10T00:00:00.000Z',
  },
  {
    id: '2',
    author: 'Moonfeather',
    title: 'What the Emerald Dream tells us about Azeroth',
    excerpt: 'A community lore theory connecting recent discoveries to older druid stories and the origins of the world trees.',
    category: 'Lore',
    publishedAt: '2026-07-08T00:00:00.000Z',
  },
  {
    id: '3',
    author: 'Brakka',
    title: 'Preparing your first raid without overgearing',
    excerpt: 'Practical advice for consumables, group roles, and communication when your guild is stepping into its first raid night.',
    category: 'Raiding',
    publishedAt: '2026-07-05T00:00:00.000Z',
  },
]
