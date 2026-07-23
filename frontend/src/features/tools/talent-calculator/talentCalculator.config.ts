export type TalentCalculatorClass = {
  id: string
  name: string
  image: string | null
  specializations: readonly [string, string, string]
}

export const talentCalculatorClasses: readonly TalentCalculatorClass[] = [
  { id: 'warrior', name: 'Warrior', image: '/images/classes/ClassIcon_warrior.png', specializations: ['Arms', 'Fury', 'Protection'] },
  { id: 'paladin', name: 'Paladin', image: '/images/classes/ClassIcon_paladin.png', specializations: ['Holy', 'Protection', 'Retribution'] },
  { id: 'hunter', name: 'Hunter', image: '/images/classes/ClassIcon_hunter.png', specializations: ['Beast Mastery', 'Marksmanship', 'Survival'] },
  { id: 'rogue', name: 'Rogue', image: '/images/classes/ClassIcon_rogue.png', specializations: ['Assassination', 'Combat', 'Subtlety'] },
  { id: 'priest', name: 'Priest', image: '/images/classes/ClassIcon_priest.png', specializations: ['Discipline', 'Holy', 'Shadow'] },
  { id: 'shaman', name: 'Shaman', image: '/images/classes/ClassIcon_shaman.png', specializations: ['Elemental', 'Enhancement', 'Restoration'] },
  { id: 'mage', name: 'Mage', image: '/images/classes/ClassIcon_mage.png', specializations: ['Arcane', 'Fire', 'Frost'] },
  { id: 'warlock', name: 'Warlock', image: '/images/classes/ClassIcon_warlock.png', specializations: ['Affliction', 'Demonology', 'Destruction'] },
  { id: 'druid', name: 'Druid', image: '/images/classes/ClassIcon_druid.png', specializations: ['Balance', 'Feral Combat', 'Restoration'] },
]
