import InfoPageLayout, { type InfoSection } from '../components/layout/InfoPageLayout'

const sections: InfoSection[] = [
  {
    id: 'use',
    title: 'Using the demo',
    content: <p>WoWiki is an unofficial portfolio project for exploring Classic reference material, community discussions, and planning tools. Game records, Blue Tracker entries, and calendar events are examples.</p>,
  },
  {
    id: 'contributions',
    title: 'Community contributions',
    content: <p>Keep posts and comments relevant and respectful. Share only material you have permission to post and leave out personal or confidential information. Use Report issue to flag incorrect or inappropriate content.</p>,
  },
  {
    id: 'ownership',
    title: 'Artwork and references',
    content: <p>World of Warcraft, Blizzard Entertainment, and related names, artwork, and game materials belong to their respective owners. WoWiki is an independent fan project.</p>,
  },
]

export default function TermsPage(): JSX.Element {
  return <InfoPageLayout eyebrow="Community guidelines" title="Terms of Use" summary="Guidelines for reading and contributing to the WoWiki demo." sections={sections} />
}
