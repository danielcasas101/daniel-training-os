import { TodayClient } from '@/components/today/today-client'
import { currentBlock, todayWorkout } from '@/lib/seed-data'

export default function TodayPage() {
  return (
    <TodayClient initialWorkout={todayWorkout} blockName={currentBlock.name} />
  )
}
