'use client'

import { useState } from 'react'
import type {
  Profile,
  UserPreferences,
  Equipment,
  InjuryHistory,
} from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  User,
  Dumbbell,
  HeartPulse,
  Settings as SettingsIcon,
  Check,
  CalendarClock,
} from 'lucide-react'
import { trainingStore } from '@/lib/training-store'
import { useTrainingState } from '@/components/training-state-provider'

const MODES = [
  { id: 'summer', label: 'Summer', desc: 'More time, higher volume' },
  { id: 'school', label: 'School', desc: 'Time-efficient, maintain skills' },
  { id: 'travel', label: 'Travel', desc: 'Minimal equipment, short sessions' },
] as const

export function SettingsClient({
  profile,
  preferences,
  equipment,
  injuries,
}: {
  profile: Profile
  preferences: UserPreferences
  equipment: Equipment[]
  injuries: InjuryHistory[]
}) {
  const trainingState = useTrainingState()
  const currentProfile = trainingState.profile ?? profile
  const currentPreferences = trainingState.preferences ?? preferences
  const equip = trainingState.equipment.length ? trainingState.equipment : equipment
  const currentInjuries = trainingState.injuries.length ? trainingState.injuries : injuries
  const [saved, setSaved] = useState(false)

  function updateSettings(
    nextProfile = currentProfile,
    nextPreferences = currentPreferences,
    nextEquipment = equip,
  ) {
    trainingStore.saveSettings(nextProfile, nextPreferences, nextEquipment, currentInjuries)
  }

  function toggleEquip(id: string) {
    updateSettings(
      currentProfile,
      currentPreferences,
      equip.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item,
      ),
    )
  }

  function save() {
    updateSettings()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const grouped = equip.reduce<Record<string, Equipment[]>>((acc, e) => {
    ;(acc[e.location] ||= []).push(e)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-4">
        <SectionTitle icon={User} title="Profile" />
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name" className="text-xs text-muted-foreground">
              Name
            </Label>
            <Input
              id="name"
              value={currentProfile.name}
              onChange={(event) => updateSettings({ ...currentProfile, name: event.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="tz" className="text-xs text-muted-foreground">
              Timezone
            </Label>
            <Input
              id="tz"
              value={currentProfile.timezone}
              onChange={(event) => updateSettings({ ...currentProfile, timezone: event.target.value })}
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ctx" className="text-xs text-muted-foreground">
              Context
            </Label>
            <Textarea
              id="ctx"
              value={currentProfile.context}
              onChange={(event) => updateSettings({ ...currentProfile, context: event.target.value })}
              className="mt-1"
              rows={2}
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle icon={CalendarClock} title="Active mode" />
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() =>
                updateSettings(currentProfile, {
                  ...currentPreferences,
                  activeMode: m.id as UserPreferences['activeMode'],
                })
              }
              className={cn(
                'rounded-lg border p-3 text-left transition-colors',
                currentPreferences.activeMode === m.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-muted-foreground/40',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{m.label}</span>
                {currentPreferences.activeMode === m.id && <Check className="size-4 text-primary" />}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{m.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle icon={Dumbbell} title="Equipment" />
        <div className="mt-3 flex flex-col gap-4">
          {Object.entries(grouped).map(([location, items]) => (
            <div key={location}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {location}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((e) => (
                  <label
                    key={e.id}
                    className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-card/50 px-3 py-2"
                  >
                    <span className="text-sm">{e.name}</span>
                    <Switch
                      checked={e.available}
                      onCheckedChange={() => toggleEquip(e.id)}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle icon={HeartPulse} title="Injury history" />
        <div className="mt-3 flex flex-col gap-2">
          {currentInjuries.map((inj) => (
            <div
              key={inj.id}
              className="flex items-start justify-between gap-3 rounded-md border border-border bg-card/50 p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{inj.area}</p>
                  <Badge
                    variant={inj.status === 'monitoring' ? 'default' : 'outline'}
                    className="text-xs capitalize"
                  >
                    {inj.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{inj.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle icon={SettingsIcon} title="Preferences" />
        <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-card/50 px-3 py-2">
          <div>
            <p className="text-sm font-medium">Units</p>
            <p className="text-xs text-muted-foreground">
              {currentPreferences.units === 'imperial' ? 'Pounds, inches' : 'Kilograms, centimeters'}
            </p>
          </div>
          <div className="flex gap-1.5">
            {(['imperial', 'metric'] as const).map((u) => (
              <Button
                key={u}
                size="sm"
                variant={currentPreferences.units === u ? 'default' : 'outline'}
                onClick={() =>
                  updateSettings(currentProfile, { ...currentPreferences, units: u })
                }
                className="capitalize"
              >
                {u}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save}>
          {saved ? (
            <>
              <Check className="size-4" /> Saved
            </>
          ) : (
            'Save changes'
          )}
        </Button>
      </div>
    </div>
  )
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-primary" />
      <h2 className="text-sm font-semibold">{title}</h2>
    </div>
  )
}
