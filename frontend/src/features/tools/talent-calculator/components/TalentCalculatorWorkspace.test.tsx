// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TALENT_CLASSES } from '../../../../../../backend/src/modules/game-data/talents/data/talent-registry'
import { fetchTalentClass } from '../api/talentCalculatorService'
import type { TalentClass } from '../types/talent'
import TalentCalculatorWorkspace from './TalentCalculatorWorkspace'

vi.mock('../api/talentCalculatorService', () => ({ fetchTalentClass: vi.fn() }))

const classes: TalentClass[] = TALENT_CLASSES.map(({ classId, className, ...data }) => ({ id: classId, name: className, ...data }))
let container: HTMLDivElement
let root: Root

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.mocked(fetchTalentClass).mockImplementation(async (classId) => classes.find((talentClass) => talentClass.id === classId)!)
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.resetAllMocks()
  vi.unstubAllGlobals()
})

describe('talent icons', () => {
  it.each(classes)('renders the existing icons and accessible talent names for $name', async (talentClass) => {
    await renderWorkspace()
    await selectClass(talentClass.name)
    const talents = talentClass.trees.flatMap((tree) => tree.talents)

    expect(container.querySelectorAll('article img')).toHaveLength(talents.length)
    expect(Array.from(container.querySelectorAll('h2'), (heading) => heading.textContent)).toEqual(talentClass.trees.map((tree) => tree.name))
    for (const talent of talents) {
      const button = talentButton(talent.name)
      const image = button.querySelector('img')!
      expect(button.getAttribute('aria-label')).toBe(`${talent.name}, rank 0 of ${talent.maxRank}`)
      expect(image.getAttribute('src')).toBe(`https://classicdb.ch/images/icons/large/${talent.icon.replace(/^classic_/, '')}.jpg`)
      expect(image.alt).toBe('')
      expect(image.closest('[aria-hidden="true"]')).not.toBeNull()
      expect(image.draggable).toBe(false)
    }
  })

  it.each(['', '   ', '../missing.jpg'])('uses initials without an image request for invalid icon %j', async (icon) => {
    const warrior = classes[0]
    vi.mocked(fetchTalentClass).mockResolvedValue({
      ...warrior,
      trees: warrior.trees.map((tree) => ({ ...tree, talents: tree.talents.map((talent) => ({ ...talent, icon })) })),
    })
    await renderWorkspace()

    expect(container.querySelectorAll('article img')).toHaveLength(0)
    expect(talentButton('Improved Heroic Strike').textContent).toBe('IHS0/3')
    await changeRank('Improved Heroic Strike')
    expectRank('Improved Heroic Strike', 1, 3)
  })

  it('replaces failed images with initials and still allows rank changes and class switching', async () => {
    await renderWorkspace()
    const image = talentButton('Improved Heroic Strike').querySelector('img')!
    await act(async () => image.dispatchEvent(new Event('error')))

    expect(talentButton('Improved Heroic Strike').querySelector('img')).toBeNull()
    expect(talentButton('Improved Heroic Strike').textContent).toBe('IHS0/3')
    await changeRank('Improved Heroic Strike')
    expectRank('Improved Heroic Strike', 1, 3)
    await selectClass('Mage')
    expect(talentButton('Arcane Subtlety').querySelector('img')).not.toBeNull()
    await selectClass('Warrior')
    expect(talentButton('Improved Heroic Strike').querySelector('img')).not.toBeNull()
    expectRank('Improved Heroic Strike', 0, 3)
  })
})

describe('talent interactions with icons', () => {
  it('preserves rank limits, right-click removal, and tree reset', async () => {
    await renderWorkspace()
    await changeRank('Improved Heroic Strike', 'click', 4)
    expectRank('Improved Heroic Strike', 3, 3)
    await changeRank('Improved Heroic Strike', 'contextmenu')
    expectRank('Improved Heroic Strike', 2, 3)
    const reset = container.querySelector('article header button') as HTMLButtonElement
    await act(async () => reset.click())
    expectRank('Improved Heroic Strike', 0, 3)
    expect(reset.disabled).toBe(true)
    await changeRank('Improved Heroic Strike', 'contextmenu')
    expectRank('Improved Heroic Strike', 0, 3)
  })

  it('keeps row and prerequisite requirements for adding and removing ranks', async () => {
    await renderWorkspace()
    await changeRank('Tactical Mastery')
    expectRank('Tactical Mastery', 0, 5)
    await changeRank('Deflection', 'click', 5)
    await changeRank('Improved Heroic Strike', 'click', 3)
    await changeRank('Improved Charge', 'click', 2)
    await changeRank('Anger Management')
    expectRank('Anger Management', 0, 1)
    await changeRank('Tactical Mastery', 'click', 4)
    await changeRank('Anger Management')
    expectRank('Anger Management', 0, 1)
    await changeRank('Tactical Mastery')
    await changeRank('Anger Management')
    expectRank('Anger Management', 1, 1)

    await changeRank('Tactical Mastery', 'contextmenu')
    expectRank('Tactical Mastery', 5, 5)
    await changeRank('Anger Management', 'contextmenu')
    await changeRank('Tactical Mastery', 'contextmenu')
    expectRank('Tactical Mastery', 4, 5)
    await changeRank('Deflection', 'contextmenu', 5)
    expectRank('Deflection', 2, 5)
  })

  it('enforces the total point cap and resets ranks when switching classes', async () => {
    const warrior = classes[0]
    vi.mocked(fetchTalentClass).mockImplementation(async (classId) => classId === 'warrior'
      ? { ...warrior, maxTalentPoints: 1 }
      : classes.find((talentClass) => talentClass.id === classId)!)
    await renderWorkspace()
    await changeRank('Improved Heroic Strike')
    await changeRank('Deflection')
    expectRank('Improved Heroic Strike', 1, 3)
    expectRank('Deflection', 0, 5)
    await selectClass('Mage')
    await selectClass('Warrior')
    expectRank('Improved Heroic Strike', 0, 3)
    await changeRank('Deflection')
    expectRank('Deflection', 1, 5)
  })
})

async function renderWorkspace(): Promise<void> {
  await act(async () => root.render(<TalentCalculatorWorkspace />))
}

async function selectClass(name: string): Promise<void> {
  const button = container.querySelector(`button[aria-label="${name}"]`) as HTMLButtonElement
  await act(async () => button.click())
  expect(button.getAttribute('aria-pressed')).toBe('true')
}

function talentButton(name: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll('button')).find((candidate) => candidate.getAttribute('aria-label')?.startsWith(`${name}, rank `))
  expect(button, `Talent button for ${name}`).toBeDefined()
  return button!
}

function expectRank(name: string, rank: number, maxRank: number): void {
  expect(talentButton(name).getAttribute('aria-label')).toBe(`${name}, rank ${rank} of ${maxRank}`)
}

async function changeRank(name: string, eventType = 'click', count = 1): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await act(async () => {
      talentButton(name).dispatchEvent(new MouseEvent(eventType, { bubbles: true, cancelable: true, button: eventType === 'contextmenu' ? 2 : 0 }))
    })
  }
}
