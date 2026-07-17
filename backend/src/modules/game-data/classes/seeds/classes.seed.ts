import { GameClass } from '../models/class.model'

export const CLASSES: GameClass[] = [
  { id: '1', name: 'Warrior', roles: ['tank', 'damage'], resource: 'Rage', armor: 'Plate', description: 'A heavily armed martial combatant who can protect allies or deal devastating physical damage.' },
  { id: '2', name: 'Mage', roles: ['damage'], resource: 'Mana', armor: 'Cloth', description: 'A master of arcane, fire, and frost magic with powerful ranged attacks and utility.' },
  { id: '3', name: 'Priest', roles: ['healer', 'damage'], resource: 'Mana', armor: 'Cloth', description: 'A spiritual caster who heals allies with holy magic or attacks enemies with shadow magic.' },
  { id: '4', name: 'Paladin', roles: ['tank', 'healer', 'damage'], resource: 'Mana', armor: 'Plate', description: 'A holy warrior who protects allies, restores health, and fights with blessed weapons.' },
  { id: '5', name: 'Hunter', roles: ['damage'], resource: 'Mana', armor: 'Mail', description: 'A ranged tracker who fights alongside a loyal beast companion.' },
  { id: '6', name: 'Shaman', roles: ['healer', 'damage'], resource: 'Mana', armor: 'Mail', description: 'An elemental spellcaster who empowers allies with totems and ancestral magic.' },
  { id: '7', name: 'Druid', roles: ['tank', 'healer', 'damage'], resource: 'Mana, Rage, or Energy', armor: 'Leather', description: 'A versatile shapeshifter who draws healing and destructive power from nature.' },
  { id: '8', name: 'Rogue', roles: ['damage'], resource: 'Energy', armor: 'Leather', description: 'A stealthy combatant who uses poisons and rapid weapon strikes.' },
  { id: '9', name: 'Warlock', roles: ['damage'], resource: 'Mana', armor: 'Cloth', description: 'A dark spellcaster who commands demons, curses, and destructive shadow magic.' },
]
