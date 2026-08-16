import { ClassTalents } from '../models/talent'
import { DRUID_TALENTS } from './druid-talents'
import { HUNTER_TALENTS } from './hunter-talents'
import { MAGE_TALENTS } from './mage-talents'
import { PALADIN_TALENTS } from './paladin-talents'
import { PRIEST_TALENTS } from './priest-talents'
import { ROGUE_TALENTS } from './rogue-talents'
import { SHAMAN_TALENTS } from './shaman-talents'
import { WARLOCK_TALENTS } from './warlock-talents'
import { WARRIOR_TALENTS } from './warrior-talents'

export const TALENT_CLASSES: readonly ClassTalents[] = [
  WARRIOR_TALENTS,
  PALADIN_TALENTS,
  HUNTER_TALENTS,
  ROGUE_TALENTS,
  PRIEST_TALENTS,
  SHAMAN_TALENTS,
  MAGE_TALENTS,
  WARLOCK_TALENTS,
  DRUID_TALENTS,
]
