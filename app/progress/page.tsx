import { PageHeader } from '@/components/shell/app-shell'
import { ProgressClient } from '@/components/progress/progress-client'
import { skills, skillStates, bodyweightLogs, weekPlan } from '@/lib/seed-data'

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        title="Progress"
        description="A simple snapshot. Update only when something meaningful changes."
      />
      <ProgressClient
        skills={skills}
        skillStates={skillStates}
        bodyweightLogs={bodyweightLogs}
        plan={weekPlan}
      />
    </>
  )
}
