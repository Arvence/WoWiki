import { CommunityEntry } from '../models/community-entry.model'

export const COMMUNITY_ENTRIES: CommunityEntry[] = [
  {
    id: '1',
    author: 'Arannis',
    title: 'A beginner-friendly route through the Deadmines',
    excerpt: 'A room-by-room walkthrough with suggested levels, key quests, and tips for handling each boss with a new group.',
    content: `The Deadmines can feel chaotic on a first run, but the dungeon becomes much easier when the group treats it as a steady route rather than a race. Aim for level 18 or higher, bring the Westfall quest chain, and make sure everyone has cleared enough bag space before entering.

Work through the opening tunnels one pack at a time. Goblin Engineers can summon mechanical allies, so interrupt them early and keep the group behind the tank. In the Foundry, move away from the lumbering Shredders when they begin their heavier attacks and give the healer a moment to recover between pulls.

The ship is where new groups most often lose control. Clear every deck before moving upward, watch for patrols, and fight bosses with your backs away from the ledges. On Edwin VanCleef, defeat his adds quickly before returning to the boss. A calm group with clear targets will have a smoother run than a stronger group that pulls ahead.`,
    category: 'Dungeon Guide',
    publishedAt: '2026-07-10T00:00:00.000Z',
  },
  {
    id: '2',
    author: 'Moonfeather',
    title: 'What the Emerald Dream tells us about Azeroth',
    excerpt: 'A community lore theory connecting recent discoveries to older druid stories and the origins of the world trees.',
    content: `The Emerald Dream is often described as Azeroth in an untouched state, but the stories surrounding it suggest something more active: a living record of what the world could become. Its shifting paths and imperfect reflections make it less like a preserved blueprint and more like a realm of possibilities.

That distinction matters when we look at the world trees. Each tree connects mortal history to a much older natural order, yet every connection has produced different consequences. Nordrassil became a source of protection, Teldrassil carried the weight of ambition, and newer discoveries suggest the Dream does not simply approve or reject these choices.

My theory is that the trees act as anchors between possible versions of Azeroth. Druids do not only protect nature as it exists; they help decide which possibilities are allowed to take root. That would explain why corruption in the Dream is so dangerous: it changes the range of futures available to the waking world.`,
    category: 'Lore',
    publishedAt: '2026-07-08T00:00:00.000Z',
  },
  {
    id: '3',
    author: 'Brakka',
    title: 'Preparing your first raid without overgearing',
    excerpt: 'Practical advice for consumables, group roles, and communication when your guild is stepping into its first raid night.',
    content: `Your first raid night is a coordination test, not a gear inspection. Set a realistic goal for the evening, publish the start and finish times in advance, and assign one person to make calls during combat. Players perform better when they know what success looks like before the first pull.

Ask everyone to bring basic consumables, repaired gear, and any resistance items the encounter genuinely requires. Avoid turning the preparation list into an expensive barrier. A few reliable potions and the correct class tools matter more than chasing every possible stat increase.

During the raid, keep explanations short and give each role one clear responsibility. After a wipe, identify the first actionable problem instead of listing every mistake. Take a scheduled break, protect the end time, and finish by noting what improved. A team that wants to return next week has made meaningful progress.`,
    category: 'Raiding',
    publishedAt: '2026-07-05T00:00:00.000Z',
  },
]
