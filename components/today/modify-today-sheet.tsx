'use client'

import { useState } from 'react'
import type {
  ModificationReason,
  ModificationScope,
  ModificationStrategy,
  PlanModification,
  PlanItemChange,
  Workout,
} from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ArrowRight, Check, RotateCcw } from 'lucide-react'

const REASONS: { value: ModificationReason; label: string }[] = [
  { value: 'no_pool', label: 'No pool' },
  { value: 'no_gym', label: 'No gym' },
  { value: 'no_equipment', label: 'No equipment' },
  { value: 'less_time', label: 'Less time' },
  { value: 'travel', label: 'Travel' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'discomfort', label: 'Discomfort' },
  { value: 'schedule', label: 'Schedule conflict' },
  { value: 'custom', label: 'Custom' },
]

const STRATEGIES: { value: ModificationStrategy; label: string; desc: string }[] = [
  { value: 'keep_focus', label: 'Keep the same focus', desc: 'Same goal, minor adjustments only.' },
  { value: 'shorter', label: 'Give me a shorter version', desc: 'Trim to the essentials.' },
  { value: 'replace_unavailable', label: 'Replace unavailable activity', desc: 'Swap what you cannot do today.' },
  { value: 'easier', label: 'Make today easier', desc: 'Lower intensity and load.' },
  { value: 'manual', label: 'Edit manually', desc: 'You choose what changes.' },
]

export type ModificationResult = PlanModification

export function ModifyTodaySheet({
  workout,
  open,
  onOpenChange,
  onApply,
  onRevert,
  modified,
}: {
  workout: Workout
  open: boolean
  onOpenChange: (v: boolean) => void
  onApply: (result: ModificationResult) => void
  onRevert: () => void
  modified: boolean
}) {
  const [step, setStep] = useState(1)
  const [reason, setReason] = useState<ModificationReason | null>(null)
  const [strategy, setStrategy] = useState<ModificationStrategy | null>(null)
  const [note, setNote] = useState('')
  const [manualRemoved, setManualRemoved] = useState<string[]>([])

  const reset = () => {
    setStep(1)
    setReason(null)
    setStrategy(null)
    setNote('')
    setManualRemoved([])
  }

  const automaticChanges = reason && strategy ? computeChanges(workout, reason, strategy) : []
  const changes =
    strategy === 'manual'
      ? manualRemoved.map((name) => ({
          original: name,
          updated: '',
          removed: true,
          reason: 'Removed manually for this plan scope.',
        }))
      : automaticChanges

  const apply = (scope: ModificationScope) => {
    if (!reason || !strategy) return
    onApply({ reason, strategy, scope, changes, note })
    onOpenChange(false)
    reset()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-none sm:data-[side=bottom]:inset-y-0 sm:data-[side=bottom]:right-0 sm:data-[side=bottom]:left-auto sm:data-[side=bottom]:h-full sm:data-[side=bottom]:w-full sm:data-[side=bottom]:max-w-md sm:data-[side=bottom]:border-l"
      >
        <SheetHeader className="pb-0">
          <SheetTitle>Modify today</SheetTitle>
          <SheetDescription>
            {step === 1 && 'What changed today?'}
            {step === 2 && 'How should we adjust?'}
            {step === 3 && 'Review the updated plan.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-6">
          <StepDots step={step} />

          {step === 1 && (
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map((r) => (
                <ChoiceButton
                  key={r.value}
                  active={reason === r.value}
                  onClick={() => {
                    setReason(r.value)
                    setStep(2)
                  }}
                >
                  {r.label}
                </ChoiceButton>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-2">
              {STRATEGIES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => {
                    setStrategy(s.value)
                    setStep(3)
                  }}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-colors',
                    strategy === s.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-muted-foreground/40',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{s.label}</span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
                </button>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="mt-1 self-start">
                Back
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {strategy === 'manual' && (
                  <div className="mb-2 flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">
                      Tap any exercise to remove it from the modified plan.
                    </p>
                    {workout.exercises.map((exercise) => {
                      const removed = manualRemoved.includes(exercise.name)
                      return (
                        <button
                          key={exercise.id}
                          type="button"
                          onClick={() =>
                            setManualRemoved((current) =>
                              removed
                                ? current.filter((name) => name !== exercise.name)
                                : [...current, exercise.name],
                            )
                          }
                          className={cn(
                            'flex items-center justify-between rounded-lg border p-3 text-left text-sm',
                            removed
                              ? 'border-destructive/40 bg-destructive/10 text-destructive'
                              : 'border-border bg-card',
                          )}
                        >
                          <span>{exercise.name}</span>
                          <span className="text-xs">{removed ? 'Removed' : 'Keep'}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
                {changes.length === 0 ? (
                  <p className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
                    No automatic changes needed. Your focus stays the same — adjust manually below if you like.
                  </p>
                ) : (
                  changes.map((c, i) => <ChangeRow key={i} change={c} />)
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Optional note</label>
                <Input
                  value={note}
                  placeholder="Anything to remember about today..."
                  className="mt-1"
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={() => apply('today')}>
                  <Check className="size-4" />
                  Save for today only
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => apply('this_week')}>
                    Apply to this week
                  </Button>
                  <Button variant="outline" onClick={() => apply('recurring')}>
                    Update recurring
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="self-start">
                  Back
                </Button>
              </div>

              {modified && (
                <Button
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => {
                    onRevert()
                    onOpenChange(false)
                    reset()
                  }}
                >
                  <RotateCcw className="size-4" />
                  Revert to original plan
                </Button>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function StepDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors',
            n <= step ? 'bg-primary' : 'bg-muted',
          )}
        />
      ))}
    </div>
  )
}

function ChoiceButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg border px-3 py-3 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-card hover:border-muted-foreground/40',
      )}
    >
      {children}
    </button>
  )
}

function ChangeRow({ change }: { change: PlanItemChange }) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        change.removed ? 'border-border bg-card/60' : 'border-border bg-card',
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className={cn('text-muted-foreground', change.removed && 'line-through')}>
          {change.original}
        </span>
        {!change.removed && (
          <>
            <ArrowRight className="size-3.5 text-muted-foreground" />
            <span className="font-medium">{change.updated}</span>
          </>
        )}
        {change.removed && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            removed
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{change.reason}</p>
    </div>
  )
}

// Non-destructive rule-based revision: derives original->updated changes.
function computeChanges(
  workout: Workout,
  reason: ModificationReason,
  strategy: ModificationStrategy,
): PlanItemChange[] {
  const changes: PlanItemChange[] = []
  const ex = workout.exercises

  // Reason-driven removals/replacements
  if (reason === 'no_pool') {
    const swim = ex.find((e) => e.section === 'swim')
    if (swim) {
      changes.push({
        original: swim.name,
        updated: '',
        removed: true,
        reason: 'Pool unavailable today. Missing one swim does not need to be made up — no replacement forced.',
      })
    }
  }
  if (reason === 'no_gym') {
    const strength = ex.filter((e) => e.section === 'strength')
    strength.forEach((s) =>
      changes.push({
        original: s.name,
        updated: 'Home parallettes / bodyweight equivalent',
        reason: 'Gym unavailable — swap to an equipment-free version.',
      }),
    )
  }
  if (reason === 'no_equipment') {
    changes.push({
      original: 'Equipment-based work',
      updated: 'Floor-only skill + mobility session',
      reason: 'No equipment — keep skill practice that needs only the floor.',
    })
  }
  if (reason === 'discomfort') {
    const planche = ex.find((e) => e.name.toLowerCase().includes('planche'))
    if (planche) {
      changes.push({
        original: planche.name,
        updated: `${planche.name} (reduced load, stop at pain 2/5)`,
        reason: 'Discomfort reported — cap wrist/forearm load and reduce volume.',
      })
    }
  }

  // Strategy-driven adjustments
  if (strategy === 'shorter') {
    changes.push({
      original: `Full session (~${workout.estimatedMinutes} min)`,
      updated: `Short session (~${Math.round(workout.estimatedMinutes * 0.5)} min): primary work only`,
      reason: 'Keep the main skill work, drop accessory volume.',
    })
  }
  if (strategy === 'easier') {
    changes.push({
      original: `Intensity: ${workout.intensity}`,
      updated: 'Intensity: light — submaximal holds, longer rests',
      reason: 'Lower the demand while staying consistent.',
    })
  }
  if (strategy === 'keep_focus' && changes.length === 0) {
    // nothing to change
  }

  return changes
}
