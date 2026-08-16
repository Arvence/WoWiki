const assert = require('node:assert/strict')
const test = require('node:test')
const { DRUID_TALENTS, DRUID_TALENT_SOURCE } = require('../dist/modules/game-data/talents/data/druid-talents')
const { HUNTER_TALENTS, HUNTER_TALENT_SOURCE } = require('../dist/modules/game-data/talents/data/hunter-talents')
const { MAGE_TALENTS, MAGE_TALENT_SOURCE } = require('../dist/modules/game-data/talents/data/mage-talents')
const { PALADIN_TALENTS, PALADIN_TALENT_SOURCE } = require('../dist/modules/game-data/talents/data/paladin-talents')
const { PRIEST_TALENTS, PRIEST_TALENT_SOURCE } = require('../dist/modules/game-data/talents/data/priest-talents')
const { ROGUE_TALENTS, ROGUE_TALENT_SOURCE } = require('../dist/modules/game-data/talents/data/rogue-talents')
const { SHAMAN_TALENTS, SHAMAN_TALENT_SOURCE } = require('../dist/modules/game-data/talents/data/shaman-talents')
const { WARLOCK_TALENTS, WARLOCK_TALENT_SOURCE } = require('../dist/modules/game-data/talents/data/warlock-talents')
const { WARRIOR_TALENTS } = require('../dist/modules/game-data/talents/data/warrior-talents')
const { TalentsService } = require('../dist/modules/game-data/talents/talents.service')

function validateClassTalents(classTalents, expectedTrees, expectedTalentCount) {
  assert.equal(classTalents.maxLevel, 60)
  assert.equal(classTalents.maxTalentPoints, 51)
  assert.deepEqual(classTalents.trees.map(({ name, talents }) => [name, talents.length]), expectedTrees)

  const talentIds = new Set()
  const spellIds = new Set()

  for (const [treeOrder, tree] of classTalents.trees.entries()) {
    assert.equal(tree.order, treeOrder)
    const talentsById = new Map(tree.talents.map((talent) => [talent.id, talent]))

    for (const talent of tree.talents) {
      assert.equal(talentIds.has(talent.id), false, `Duplicate talent ID: ${talent.id}`)
      talentIds.add(talent.id)
      assert.match(talent.id, new RegExp(`^${classTalents.classId}-[a-z0-9-]+$`))
      assert.match(talent.icon, /^[a-z0-9_]+$/)
      assert.equal(Number.isInteger(talent.row) && talent.row >= 0 && talent.row <= 6, true, `${talent.name} has an invalid row`)
      assert.equal(Number.isInteger(talent.column) && talent.column >= 0 && talent.column <= 3, true, `${talent.name} has an invalid column`)
      assert.equal(talent.requiredPoints, talent.row * 5, `${talent.name} has invalid required points`)
      assert.equal(talent.ranks.length, talent.maxRank, `${talent.name} has a max-rank mismatch`)

      for (const rank of talent.ranks) {
        assert.equal(Number.isInteger(rank.spellId) && rank.spellId > 0, true, `${talent.name} has an invalid spell ID`)
        assert.equal(spellIds.has(rank.spellId), false, `Duplicate spell ID: ${rank.spellId}`)
        spellIds.add(rank.spellId)
        assert.equal(rank.description.trim().length > 0, true, `${talent.name} has an empty rank description`)
      }

      if (talent.prerequisite) {
        const prerequisite = talentsById.get(talent.prerequisite.talentId)
        assert.ok(prerequisite, `${talent.name} has an unknown prerequisite`)
        assert.equal(talent.prerequisite.requiredRank >= 1 && talent.prerequisite.requiredRank <= prerequisite.maxRank, true, `${talent.name} has an invalid prerequisite rank`)
        assert.equal(prerequisite.row <= talent.row, true, `${talent.name} prerequisite cannot be in a later row`)
      }
    }
  }

  assert.equal(talentIds.size, expectedTalentCount)
}

test('Classic Warrior talent data is complete and structurally valid', () => {
  validateClassTalents(WARRIOR_TALENTS, [['Arms', 18], ['Fury', 17], ['Protection', 17]], 52)
})

test('Classic Paladin talent data is complete and structurally valid', () => {
  assert.equal(PALADIN_TALENT_SOURCE, 'https://www.wowhead.com/classic/talent-calc/paladin')
  validateClassTalents(PALADIN_TALENTS, [['Holy', 14], ['Protection', 15], ['Retribution', 15]], 44)
  assert.equal(PALADIN_TALENTS.trees.flatMap((tree) => tree.talents).flatMap((talent) => talent.ranks).some((rank) => /Season of Discovery|Tuning and Overrides|S0\d/.test(rank.description)), false)
})

test('Classic Hunter talent data is complete and structurally valid', () => {
  assert.equal(HUNTER_TALENT_SOURCE, 'https://www.wowhead.com/classic/talent-calc/hunter')
  validateClassTalents(HUNTER_TALENTS, [['Beast Mastery', 16], ['Marksmanship', 14], ['Survival', 16]], 46)
  assert.equal(HUNTER_TALENTS.trees.flatMap((tree) => tree.talents).flatMap((talent) => talent.ranks).some((rank) => /Season of Discovery|Tuning and Overrides|S0\d/.test(rank.description)), false)
})

test('Classic Rogue talent data is complete and structurally valid', () => {
  assert.equal(ROGUE_TALENT_SOURCE, 'https://www.wowhead.com/classic/talent-calc/rogue')
  validateClassTalents(ROGUE_TALENTS, [['Assassination', 15], ['Combat', 19], ['Subtlety', 17]], 51)
  assert.equal(ROGUE_TALENTS.trees.flatMap((tree) => tree.talents).flatMap((talent) => talent.ranks).some((rank) => /Season of Discovery|Tuning and Overrides|S0\d/.test(rank.description)), false)
})

test('Classic Priest talent data is complete and structurally valid', () => {
  assert.equal(PRIEST_TALENT_SOURCE, 'https://www.wowhead.com/classic/talent-calc/priest')
  validateClassTalents(PRIEST_TALENTS, [['Discipline', 15], ['Holy', 16], ['Shadow', 16]], 47)
  assert.equal(PRIEST_TALENTS.trees.flatMap((tree) => tree.talents).flatMap((talent) => talent.ranks).some((rank) => /Season of Discovery|Tuning and Overrides|S0\d/.test(rank.description)), false)
})

test('Classic Shaman talent data is complete and structurally valid', () => {
  assert.equal(SHAMAN_TALENT_SOURCE, 'https://www.wowhead.com/classic/talent-calc/shaman')
  validateClassTalents(SHAMAN_TALENTS, [['Elemental', 15], ['Enhancement', 16], ['Restoration', 15]], 46)
  assert.equal(SHAMAN_TALENTS.trees.flatMap((tree) => tree.talents).flatMap((talent) => talent.ranks).some((rank) => /Season of Discovery|Tuning and Overrides|S0\d/.test(rank.description)), false)
})

test('Classic Mage talent data is complete and structurally valid', () => {
  assert.equal(MAGE_TALENT_SOURCE, 'https://www.wowhead.com/classic/talent-calc/mage')
  validateClassTalents(MAGE_TALENTS, [['Arcane', 16], ['Fire', 16], ['Frost', 17]], 49)
  assert.equal(MAGE_TALENTS.trees.flatMap((tree) => tree.talents).flatMap((talent) => talent.ranks).some((rank) => /Season of Discovery|Tuning and Overrides|S0\d|\$/.test(rank.description)), false)
})

test('Classic Warlock talent data is complete and structurally valid', () => {
  assert.equal(WARLOCK_TALENT_SOURCE, 'https://www.wowhead.com/classic/talent-calc/warlock')
  validateClassTalents(WARLOCK_TALENTS, [['Affliction', 17], ['Demonology', 17], ['Destruction', 16]], 50)
  assert.equal(WARLOCK_TALENTS.trees.flatMap((tree) => tree.talents).flatMap((talent) => talent.ranks).some((rank) => /Season of Discovery|Tuning and Overrides|S0\d|\$/.test(rank.description)), false)
})

test('Classic Druid talent data is complete and structurally valid', () => {
  assert.equal(DRUID_TALENT_SOURCE, 'https://www.wowhead.com/classic/talent-calc/druid')
  validateClassTalents(DRUID_TALENTS, [['Balance', 16], ['Feral Combat', 16], ['Restoration', 15]], 47)
  assert.equal(DRUID_TALENTS.trees.flatMap((tree) => tree.talents).flatMap((talent) => talent.ranks).some((rank) => /Season of Discovery|Tuning and Overrides|S0\d|\$/.test(rank.description)), false)
})

test('talent service exposes all populated registry entries', () => {
  const service = new TalentsService()

  assert.equal(service.findOne('Warrior').trees.flatMap((tree) => tree.talents).length, 52)
  assert.equal(service.findOne('Paladin').trees.flatMap((tree) => tree.talents).length, 44)
  assert.equal(service.findOne('Hunter').trees.flatMap((tree) => tree.talents).length, 46)
  assert.equal(service.findOne('Rogue').trees.flatMap((tree) => tree.talents).length, 51)
  assert.equal(service.findOne('Priest').trees.flatMap((tree) => tree.talents).length, 47)
  assert.equal(service.findOne('Shaman').trees.flatMap((tree) => tree.talents).length, 46)
  assert.equal(service.findOne('Mage').trees.flatMap((tree) => tree.talents).length, 49)
  assert.equal(service.findOne('Warlock').trees.flatMap((tree) => tree.talents).length, 50)
  assert.equal(service.findOne('Druid').trees.flatMap((tree) => tree.talents).length, 47)
})
