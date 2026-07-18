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
    viewerCount: 1847,
    image: '/images/featured-content-horde-board-optimized.jpg',
    hashtags: ['deadmines', 'dungeons', 'beginners'],
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
    viewerCount: 1264,
    image: '/images/featured-news-notice-board.png',
    hashtags: ['lore', 'emerald-dream', 'druids'],
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
    viewerCount: 938,
    image: '/images/calendar-undead-casting-bg.png',
    hashtags: ['raiding', 'guilds', 'preparation'],
  },
  {
    id: '4',
    author: 'Copperbolt',
    title: 'Choosing professions for your first Classic character',
    excerpt: 'A practical way to compare gathering, crafting, and gold-making professions without chasing a perfect combination.',
    content: `Your first professions should support the way you actually play. Two gathering professions are inexpensive and make steady gold while leveling, while a gathering and crafting pair gives you useful items at the cost of more bag space and materials.

Do not worry about choosing a permanent combination at level five. Start with skills that make your journey easier, sell materials you do not need, and change direction later when your class goals and available gold are clearer.`,
    category: 'Profession Guide',
    publishedAt: '2026-07-11T08:30:00.000Z',
    viewerCount: 1572,
  },
  {
    id: '5',
    author: 'Ironward',
    title: 'Simple threat habits that make every dungeon smoother',
    excerpt: 'Small positioning, marking, and pacing habits for tanks and damage dealers learning Classic dungeon threat.',
    content: `Threat becomes manageable when the group agrees on a first target and gives the tank a moment to establish control. Mark dangerous enemies, pull packs into safe spaces, and avoid opening with the largest area attack before enemies have settled.

Damage dealers should watch for loose enemies and move toward the tank instead of running away. Tanks should communicate when a pull is unstable. These habits prevent more wipes than small differences in gear or damage.`,
    category: 'Class Guide',
    publishedAt: '2026-07-10T15:00:00.000Z',
    viewerCount: 1328,
  },
  {
    id: '6',
    author: 'Ashmantle',
    title: 'Blackrock Depths quest checklist before entering',
    excerpt: 'A faction-aware checklist for collecting important quests before committing to a long Blackrock Depths run.',
    content: `Blackrock Depths rewards preparation because many quest chains begin far from the instance. Clear your log, confirm which wing your group plans to visit, and collect the relevant capital-city and Burning Steppes quests before traveling.

Share objectives before the first pull. A group focused on the prison, arena, or emperor will follow different routes, so agreeing on priorities prevents a long run from ending before someone reaches their objective.`,
    category: 'Dungeon Guide',
    publishedAt: '2026-07-09T18:15:00.000Z',
    viewerCount: 2241,
  },
  {
    id: '7',
    author: 'Mira Quickcoin',
    title: 'Making reliable gold while leveling without grinding',
    excerpt: 'Low-effort habits for earning gold through normal questing, gathering, vendor awareness, and careful spending.',
    content: `Reliable leveling income comes from reducing waste as much as increasing sales. Train only the abilities you use, keep gathering professions active along your route, and learn which common materials are worth listing instead of vendoring.

Check deposits before posting cheap auctions and avoid buying equipment that one or two quests will replace. Small decisions repeated across many levels usually fund a mount more reliably than stopping progression for a speculative farming spot.`,
    category: 'Economy Guide',
    publishedAt: '2026-07-08T13:45:00.000Z',
    viewerCount: 1986,
  },
  {
    id: '8',
    author: 'Stonebanner',
    title: 'Warsong Gulch basics for players who dislike chaos',
    excerpt: 'Clear roles, map awareness, and simple communication for making an unfamiliar battleground easier to understand.',
    content: `Warsong Gulch becomes less chaotic when you decide what your next minute is for. Escort your flag carrier, slow the enemy carrier, or protect midfield routes instead of chasing every nearby opponent.

Call the enemy carrier location, count defenders before entering a base, and regroup after a failed push. A coordinated smaller group often achieves more than scattered players winning unrelated fights.`,
    category: 'PvP Guide',
    publishedAt: '2026-07-07T20:00:00.000Z',
    viewerCount: 1164,
  },
  {
    id: '9',
    author: 'Maplebranch',
    title: 'A small addon setup for a mostly default interface',
    excerpt: 'A restrained addon list covering quest notes, threat, encounters, and inventory without replacing the entire interface.',
    content: `Addons are most useful when each one solves a problem you have actually noticed. Begin with quest-map support, a threat display, encounter timers, and a simple way to search your bags. Learn those tools before adding more.

Keep addons updated, remove overlapping features, and test your interface outside a dungeon or raid. A smaller setup is easier to troubleshoot and leaves more attention for the game itself.`,
    category: 'New Player Guide',
    publishedAt: '2026-07-06T11:20:00.000Z',
    viewerCount: 873,
  },
  {
    id: '10',
    author: 'Frostquill',
    title: 'Healing low-level dungeons without wasting mana',
    excerpt: 'Simple spell-ranking, pacing, and positioning habits for healers entering their first Classic dungeons.',
    content: `Efficient healing starts with choosing the smallest spell that safely handles the damage. Keep more than one rank available, let the tank establish each pull, and avoid spending mana on damage that natural recovery can cover.

Stand where you can see the group without attracting patrols and tell the tank when you need a drinking break. Calm pacing gives you more control than constantly reacting with your largest heal.`,
    category: 'Class Guide',
    publishedAt: '2026-07-12T17:40:00.000Z',
    viewerCount: 1426,
  },
  {
    id: '11',
    author: 'RedridgeScout',
    title: 'Quest routes that reduce travel time in the Eastern Kingdoms',
    excerpt: 'A zone-planning approach that groups nearby objectives and makes long leveling journeys more efficient.',
    content: `Before leaving a quest hub, group objectives by location rather than accepting the order shown in your log. Complete nearby caves, camps, and collection quests together, then return once instead of crossing the same road repeatedly.

Keep your hearthstone near the hub with the longest return journey and use flight paths to connect completed zones. A flexible route is better than forcing quests that have become slow or overcrowded.`,
    category: 'Leveling Guide',
    publishedAt: '2026-07-12T09:10:00.000Z',
    viewerCount: 2103,
  },
  {
    id: '12',
    author: 'Geargrinder',
    title: 'Understanding item upgrades beyond the green numbers',
    excerpt: 'A quick framework for judging stats, useful effects, and opportunity cost before replacing equipment.',
    content: `An item is an upgrade when its stats support what your character does most often. Compare primary attributes, survivability, weapon speed, and useful effects instead of relying on armor value or item quality alone.

Keep situational resistance and utility pieces when they solve a real encounter problem. Selling every older item immediately can make a later role or activity more expensive to prepare for.`,
    category: 'Gear Guide',
    publishedAt: '2026-07-11T21:25:00.000Z',
    viewerCount: 1768,
  },
  {
    id: '13',
    author: 'Nightwatch',
    title: 'How to organize a fair dungeon loot agreement',
    excerpt: 'Clear expectations for reserved items, off-spec rolls, and handling rare drops without group conflict.',
    content: `State loot rules before the group travels to the dungeon. Mention reserved items clearly, decide how off-spec rolls work, and give everyone a chance to leave if the agreement does not fit their goals.

When an unusual item drops, pause and discuss who can genuinely use it. A short conversation protects the group better than assuming every player interprets unwritten rules the same way.`,
    category: 'Group Guide',
    publishedAt: '2026-07-10T20:30:00.000Z',
    viewerCount: 1195,
  },
  {
    id: '14',
    author: 'Sunscale',
    title: 'Building a useful bank alt in ten minutes',
    excerpt: 'A minimal setup for handling auctions, stored materials, and mail without interrupting your main character.',
    content: `Place a level-one character near an auction house, bank, and mailbox, then give that character enough bags to sort common materials. Use consistent mail subjects or bag sections so items remain easy to find.

Keep a small amount of posting money available and collect expired auctions regularly. The goal is not a complex trading operation, but fewer unnecessary trips on the character you are actively leveling.`,
    category: 'Economy Guide',
    publishedAt: '2026-07-09T12:05:00.000Z',
    viewerCount: 987,
  },
]
