import { Faction } from '../models/faction.model'

export const FACTIONS: Faction[] = [
  {
    id: '1',
    name: 'Alliance',
    alignment: 'alliance',
    races: ['Human', 'Dwarf', 'Night Elf', 'Gnome'],
    headquarters: 'Stormwind City',
    description: 'A coalition of kingdoms and peoples united by mutual defense, diplomacy, and shared opposition to threats across Azeroth.',
  },
  {
    id: '2',
    name: 'Horde',
    alignment: 'horde',
    races: ['Orc', 'Tauren', 'Troll', 'Undead'],
    headquarters: 'Orgrimmar',
    description: 'An alliance of peoples bound by survival, strength, and a determination to secure their place in Azeroth.',
  },
  {
    id: '3',
    name: 'Argent Dawn',
    alignment: 'neutral',
    races: ['Human', 'Dwarf', 'High Elf', 'Orc', 'Tauren'],
    headquarters: "Light's Hope Chapel",
    description: 'A neutral organization dedicated to resisting the Scourge and defending the living from undeath and corruption.',
  },
  {
    id: '4',
    name: 'Cenarion Circle',
    alignment: 'neutral',
    races: ['Night Elf', 'Tauren'],
    headquarters: 'Moonglade',
    description: 'An order of druids that protects the natural world and works to preserve balance across Azeroth.',
  },
  {
    id: '5',
    name: 'Scourge',
    alignment: 'hostile',
    races: ['Undead'],
    headquarters: 'Icecrown Citadel',
    description: 'An army of undead creatures created to spread the Plague of Undeath and bring the living under the control of the Lich King.',
  },
]
