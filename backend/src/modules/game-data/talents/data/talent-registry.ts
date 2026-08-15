import { ClassTalents, TalentTree, WowClassId } from '../models/talent'
import { WARRIOR_TALENTS } from './warrior-talents'

type TalentTreeDefinition = readonly [id: string, name: string]

function createTalentClass(classId: WowClassId, className: string, color: string, treeDefinitions: readonly TalentTreeDefinition[]): ClassTalents {
  const trees: TalentTree[] = treeDefinitions.map(([id, name], order) => ({ id, name, order, talents: [] }))

  return {
    classId,
    className,
    color,
    version: 'classic-era',
    maxLevel: 60,
    maxTalentPoints: 51,
    trees,
  }
}

export const TALENT_CLASSES: readonly ClassTalents[] = [
  WARRIOR_TALENTS,
  createTalentClass('paladin', 'Paladin', '#f48cba', [['paladin-holy', 'Holy'], ['paladin-protection', 'Protection'], ['paladin-retribution', 'Retribution']]),
  createTalentClass('hunter', 'Hunter', '#aad372', [['hunter-beast-mastery', 'Beast Mastery'], ['hunter-marksmanship', 'Marksmanship'], ['hunter-survival', 'Survival']]),
  createTalentClass('rogue', 'Rogue', '#fff468', [['rogue-assassination', 'Assassination'], ['rogue-combat', 'Combat'], ['rogue-subtlety', 'Subtlety']]),
  createTalentClass('priest', 'Priest', '#ffffff', [['priest-discipline', 'Discipline'], ['priest-holy', 'Holy'], ['priest-shadow', 'Shadow']]),
  createTalentClass('shaman', 'Shaman', '#0070dd', [['shaman-elemental', 'Elemental'], ['shaman-enhancement', 'Enhancement'], ['shaman-restoration', 'Restoration']]),
  createTalentClass('mage', 'Mage', '#3fc7eb', [['mage-arcane', 'Arcane'], ['mage-fire', 'Fire'], ['mage-frost', 'Frost']]),
  createTalentClass('warlock', 'Warlock', '#8788ee', [['warlock-affliction', 'Affliction'], ['warlock-demonology', 'Demonology'], ['warlock-destruction', 'Destruction']]),
  createTalentClass('druid', 'Druid', '#ff7c0a', [['druid-balance', 'Balance'], ['druid-feral', 'Feral'], ['druid-restoration', 'Restoration']]),
]
