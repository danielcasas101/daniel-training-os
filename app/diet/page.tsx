import { PageHeader } from '@/components/shell/app-shell'
import { DietClient } from '@/components/diet/diet-client'
import { preferences, profile } from '@/lib/seed-data'

export default function DietPage() {
  return (
    <>
      <PageHeader
        title="Diet"
        description="Simple recommendations and a quick daily check-in. No macro tracking required."
      />
      <DietClient preferences={preferences} profile={profile} />
    </>
  )
}
