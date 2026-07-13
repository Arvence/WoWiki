export type ClassicEvent = {
  title: string
  category: string
  time: string
  location: string
  description: string
  preparation: string
}

const eventRotation: ClassicEvent[] = [
  { title: 'Classic Community Cup', category: 'Tournament', time: '20:00 realm time', location: 'Live on community streams', description: 'Community teams compete in a bracketed PvP tournament with live commentary, standings, and post-match interviews.', preparation: 'Check the published bracket, stream links, ruleset, and start time before the broadcast begins.' },
  { title: 'Patch Notes Watch Party', category: 'Game update', time: '19:00 realm time', location: 'WoWiki Discord stage', description: 'Players read through the latest Classic update together and discuss changes to classes, professions, PvP, and the economy.', preparation: 'Bring questions and verify any claims against the official patch notes linked by the hosts.' },
  { title: 'Creator Spotlight Stream', category: 'Streamer', time: '21:00 realm time', location: 'Featured creator channel', description: 'A featured Classic creator hosts a live discussion, answers community questions, and showcases their current project.', preparation: 'Follow the creator link when it is published and submit respectful questions before the stream.' },
  { title: 'Hardcore Leveling Race', category: 'Community race', time: '17:00 realm time', location: 'Community Hardcore realm', description: 'Players begin fresh characters together and compete for progress milestones under a shared community ruleset.', preparation: 'Review the race rules, register your character name, and install only the addons permitted by organizers.' },
  { title: 'Classic Transmog Showcase', category: 'Contest', time: '18:30 realm time', location: 'Orgrimmar and Stormwind', description: 'Players present themed outfits to a community judging panel, with separate faction showcases and audience voting.', preparation: 'Prepare one outfit, a short theme description, and arrive at the announced gathering point early.' },
  { title: 'Economy Roundtable', category: 'Live discussion', time: '20:30 realm time', location: 'WoWiki community stream', description: 'Crafters, gatherers, and auction-house specialists discuss market movement and answer questions from viewers.', preparation: 'Bring realm-specific observations, screenshots, or questions without sharing private player information.' },
  { title: 'Lore Quiz Night', category: 'Community game', time: '19:30 realm time', location: 'WoWiki Discord', description: 'Teams answer Classic-era lore questions across characters, zones, factions, quests, and historic game events.', preparation: 'Join a team before check-in or arrive early to be matched with other players.' },
]

export const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
export const dateFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
export const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function eventForDate(date: Date): ClassicEvent | null {
  if (![2, 6, 10, 14, 18, 22, 26].includes(date.getDate())) return null

  const dayIndex = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
  return eventRotation[Math.abs(dayIndex) % eventRotation.length]
}

export function sameDay(first: Date, second: Date): boolean {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate()
}
