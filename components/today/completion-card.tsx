'use client'

import { useState } from 'react'
import type {
  DiscomfortArea,
  SessionCompletion,
  SessionOutcome,
} from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const OUTCOMES: { value: SessionOutcome; label: string; tone: string }[] = [
  { value: 'great', label: 'Great', tone: 'data-[active=true]:border-mint data-[active=true]:bg-mint-soft data-[active=true]:text-mint' },
  { value: 'fine', label: 'Fine', tone: 'data-[active=true]:border-sky data-[active=true]:bg-sky-soft data-[active=true]:text-sky' },
  { value: 'rough', label: 'Rough', tone: 'data-[active=true]:border-warning data-[active=true]:bg-warning/15 data-[active=true]:text-warning' },
  { value: 'skipped', label: 'Skipped', tone: 'data-[active=true]:border-muted-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground' },
]

const DISCOMFORT: { value: DiscomfortArea; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'forearm', label: 'Forearm' },
  { value: 'wrist', label: 'Wrist' },
  { value: 'elbow', label: 'Elbow' },
  { value: 'shoulder', label: 'Shoulder' },
  { value: 'other', label: 'Other' },
]

export function CompletionCard({
  onSave,
  saved,
}: {
  onSave: (c: SessionCompletion) => void
  saved: boolean
}) {
  const [outcome, setOutcome] = useState<SessionOutcome | null>(null)
  const [discomfort, setDiscomfort] = useState<DiscomfortArea>('none')
  const [note, setNote] = useState('')

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">How did it go?</h2>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {OUTCOMES.map((o) => (
          <button
            key={o.value}
            data-active={outcome === o.value}
            onClick={() => setOutcome(o.value)}
            className={cn(
              'rounded-lg border border-border bg-background py-2 text-sm font-medium text-muted-foreground transition-colors',
              o.tone,
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <h3 className="mt-4 text-sm font-medium">Any discomfort?</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {DISCOMFORT.map((d) => (
          <button
            key={d.value}
            onClick={() => setDiscomfort(d.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                discomfort === d.value
                ? d.value === 'none'
                  ? 'border-mint bg-mint-soft text-mint'
                  : 'border-warning bg-warning/15 text-warning'
                : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/40',
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      <Input
        value={note}
        placeholder="Optional note..."
        className="mt-4"
        onChange={(e) => setNote(e.target.value)}
      />

      <Button
        className="mt-4 w-full sm:w-fit"
        disabled={!outcome}
        onClick={() => outcome && onSave({ outcome, discomfort, note })}
      >
        {saved ? (
          <>
            <Check className="size-4" /> Saved
          </>
        ) : (
          'Save & finish'
        )}
      </Button>
    </div>
  )
}
