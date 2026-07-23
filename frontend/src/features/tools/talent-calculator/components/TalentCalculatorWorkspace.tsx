import { useState } from 'react'
import ClassSelector from './ClassSelector'
import TalentTreeLayout from './TalentTreeLayout'

export default function TalentCalculatorWorkspace(): JSX.Element {
  const [selectedClass, setSelectedClass] = useState('warrior')
  const [ranks, setRanks] = useState<Record<string, number>>({})

  const selectClass = (classId: string) => {
    setSelectedClass(classId)
    setRanks({})
  }

  const changeRank = (talentId: string, rank: number) => {
    setRanks((current) => {
      const next = { ...current }
      if (rank > 0) next[talentId] = rank
      else delete next[talentId]
      return next
    })
  }

  const resetTalents = (talentIds: string[]) => {
    setRanks((current) => {
      const next = { ...current }
      talentIds.forEach((talentId) => delete next[talentId])
      return next
    })
  }

  return (
    <section
      className="min-h-[32rem] rounded-2xl bg-surface p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] sm:p-6"
      aria-label="Talent calculator workspace"
    >
      <ClassSelector selectedClass={selectedClass} onSelect={selectClass} />
      <TalentTreeLayout classId={selectedClass} ranks={ranks} onRankChange={changeRank} onResetTalents={resetTalents} />
    </section>
  )
}
