import { PageHeader } from '@/components/shell/app-shell'
import { PlanClient } from '@/components/plan/plan-client'
import { currentBlock, weekPlan } from '@/lib/seed-data'
import { mondayFirstWeekday } from '@/lib/date'

export default function PlanPage() {
  return (
    <>
      <PageHeader
        title="Plan"
        description="Adjustable weekly structure, training block, and monthly checkpoints."
      />
      <PlanClient
        initialPlan={weekPlan}
        block={currentBlock}
        todayWeekday={mondayFirstWeekday()}
      />
    </>
  )
}
