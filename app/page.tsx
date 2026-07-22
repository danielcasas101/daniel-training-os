import { TodayClient } from '@/components/today/today-client'
import { currentBlock, todayWorkout } from '@/lib/seed-data'
import { localDateKey } from '@/lib/date'
import { weekPlan } from '@/lib/seed-data'
import { workoutFromPlan } from '@/lib/planning'

export default function TodayPage() {
  const current = workoutFromPlan(weekPlan)
  const baseline =
    current.title === todayWorkout.title
      ? { ...todayWorkout, id: current.id, date: localDateKey() }
      : current
  return (
    <TodayClient
      initialWorkout={baseline}
      blockName={currentBlock.name}
    />
  )
}
