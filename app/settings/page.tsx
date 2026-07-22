import { PageHeader } from '@/components/shell/app-shell'
import { SettingsClient } from '@/components/settings/settings-client'
import { profile, preferences, equipment, injuries } from '@/lib/seed-data'

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Profile, training mode, equipment, injuries, and preferences."
      />
      <SettingsClient
        profile={profile}
        preferences={preferences}
        equipment={equipment}
        injuries={injuries}
      />
    </>
  )
}
