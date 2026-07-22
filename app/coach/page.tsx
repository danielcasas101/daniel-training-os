import { PageHeader } from '@/components/shell/app-shell'
import { CoachClient } from '@/components/coach/coach-client'
import { coachConversation } from '@/lib/seed-data'

export default function CoachPage() {
  return (
    <>
      <PageHeader
        title="Coach"
        description="Data-aware reviews and plan adjustments you approve."
      />
      <CoachClient conversation={coachConversation} />
    </>
  )
}
