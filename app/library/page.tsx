import { PageHeader } from '@/components/shell/app-shell'
import { LibraryClient } from '@/components/library/library-client'
import { resources } from '@/lib/seed-data'

export default function LibraryPage() {
  return (
    <>
      <PageHeader
        title="Library"
        description="Curated guides, drills, and articles matched to your current stages."
      />
      <LibraryClient resources={resources} />
    </>
  )
}
