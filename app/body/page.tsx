import { PageHeader } from '@/components/shell/app-shell'
import { BodyClient } from '@/components/body/body-client'
import { profile, bodyweightLogs } from '@/lib/seed-data'

export default function BodyPage() {
  return (
    <>
      <PageHeader
        title="Body"
        description="Bodyweight trend, gym consistency, and physique focus."
      />
      <BodyClient profile={profile} logs={bodyweightLogs} />
    </>
  )
}
