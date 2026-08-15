const assert = require('node:assert/strict')
const test = require('node:test')
const { WARRIOR_TALENTS } = require('../dist/modules/game-data/talents/data/warrior-talents')
const { TalentsService } = require('../dist/modules/game-data/talents/talents.service')

test('Classic Warrior talent data is complete and structurally valid', () => {
  assert.equal(WARRIOR_TALENTS.classId, 'warrior')
  assert.equal(WARRIOR_TALENTS.maxLevel, 60)
  assert.equal(WARRIOR_TALENTS.maxTalentPoints, 51)
  assert.deepEqual(WARRIOR_TALENTS.trees.map(({ name, talents }) => [name, talents.length]), [
    ['Arms', 18],
    ['Fury', 17],
    ['Protection', 17],
  ])

  const talentIds = new Set()
  const spellIds = new Set()

  for (const [treeOrder, tree] of WARRIOR_TALENTS.trees.entries()) {
    assert.equal(tree.order, treeOrder)
    const talentsById = new Map(tree.talents.map((talent) => [talent.id, talent]))

    for (const talent of tree.talents) {
      assert.equal(talentIds.has(talent.id), false, `Duplicate talent ID: ${talent.id}`)
      talentIds.add(talent.id)
      assert.match(talent.id, /^warrior-(arms|fury|protection)-[a-z0-9-]+$/)
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
        assert.equal(prerequisite.row < talent.row, true, `${talent.name} prerequisite must be in an earlier row`)
      }
    }
  }

  assert.equal(talentIds.size, 52)
})

test('talent service exposes the populated Warrior registry entry', () => {
  const warrior = new TalentsService().findOne('Warrior')

  assert.equal(warrior.id, 'warrior')
  assert.equal(warrior.trees.flatMap((tree) => tree.talents).length, 52)
})
