import { PageHeader } from '@/components/shell/app-shell'
import { FlexibilityClient } from '@/components/flexibility/flexibility-client'
import { mobilityItems, flexibilityRoutines } from '@/lib/seed-data'

export default function FlexibilityPage() {
  return (
    <>
      <PageHeader
        title="Flexibility"
        description="Guided routines for handstand, planche, and recovery."
      />
      <FlexibilityClient items={mobilityItems} routines={flexibilityRoutines} />
    </>
  )
}
