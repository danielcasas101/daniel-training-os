import { PageHeader } from '@/components/shell/app-shell'
import { SkillsClient } from '@/components/skills/skills-client'
import { skills, skillStates } from '@/lib/seed-data'

export default function SkillsPage() {
  return (
    <>
      <PageHeader
        title="Skills"
        description="Progression trees, current stages, and what to work on next."
      />
      <SkillsClient skills={skills} states={skillStates} />
    </>
  )
}
