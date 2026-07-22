'use client'

import { useState } from 'react'
import type {
  Workout,
  WorkoutExercise,
} from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ExerciseRow } from './exercise-row'
import { CompletionCard } from './completion-card'
import { CompactMode } from './compact-mode'
import { ModifyTodaySheet, type ModificationResult } from './modify-today-sheet'
import { SECTION_LABELS, formatDateLong, intensityBg } from '@/lib/format'
import { sectionAccent } from '@/lib/theme'
import { cn } from '@/lib/utils'
import { Clock, Flame, Play, PartyPopper, SlidersHorizontal, Target } from 'lucide-react'
import { useTrainingState } from '@/components/training-state-provider'
import { trainingStore } from '@/lib/training-store'
import { createProgressionUpdate } from '@/lib/progression/catalog'
import { applyModificationToPlan, applyModificationToWorkout, applyWorkoutVersion, workoutFromPlan } from '@/lib/planning'
import { mondayFirstWeekday, startOfWeekKey } from '@/lib/date'

const SECTION_ORDER = [
  'warmup',
  'primary',
  'secondary',
  'strength',
  'flexibility',
  'swim',
] as const

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function TodayClient({
  initialWorkout,
  blockName,
}: {
  initialWorkout: Workout
  blockName: string
}) {
  const trainingState = useTrainingState()
  const calendarDate = new Date(`${initialWorkout.date}T12:00:00`)
  const currentWeekPlan =
    trainingState.weekOverrides[startOfWeekKey(calendarDate)]?.plan ??
    trainingState.recurringPlan
  const generatedWorkout = workoutFromPlan(currentWeekPlan, calendarDate)
  const workoutSignature = (candidate: Workout) =>
    JSON.stringify({
      title: candidate.title,
      minutes: candidate.estimatedMinutes,
      intensity: candidate.intensity,
      exercises: candidate.exercises.map((exercise) => [exercise.name, exercise.target]),
    })
  const initialSignature = workoutSignature(initialWorkout)
  const generatedSignature = workoutSignature(generatedWorkout)
  const baseWorkout = initialSignature === generatedSignature ? initialWorkout : generatedWorkout
  const dailyRecord = trainingState.dailyPlans[initialWorkout.date]
  const workout = dailyRecord?.working ?? baseWorkout
  const [compact, setCompact] = useState(false)
  const [detailed, setDetailed] = useState(false)
  const [modifyOpen, setModifyOpen] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const modification = dailyRecord?.modification ?? null
  const completion = dailyRecord?.completion ?? null
  const version = dailyRecord?.version ?? 'standard'

  const setWorkout = (
    updater: Workout | ((current: Workout) => Workout),
  ) => {
    const next = typeof updater === 'function' ? updater(workout) : updater
    trainingStore.updateWorkingWorkout(baseWorkout.date, baseWorkout, next)
  }

  const showFlash = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(null), 2200)
  }

  const updateExercise = (next: WorkoutExercise) =>
    setWorkout((w) => ({
      ...w,
      exercises: w.exercises.map((e) => (e.id === next.id ? next : e)),
    }))

  const toggleSet = (exIdx: number, setIdx: number) =>
    setWorkout((w) => {
      const exercises = [...w.exercises]
      const ex = { ...exercises[exIdx] }
      const sets = [...ex.sets]
      sets[setIdx] = { ...sets[setIdx], done: !sets[setIdx].done }
      ex.sets = sets
      ex.done = sets.every((s) => s.done)
      exercises[exIdx] = ex
      return { ...w, exercises }
    })

  const displayedWorkout = applyWorkoutVersion(
    applyModificationToWorkout(workout, modification ?? undefined),
    version,
  )
  const visibleExercises = displayedWorkout.exercises

  const grouped = SECTION_ORDER.map((section) => ({
    section,
    items: visibleExercises.filter((e) => e.section === section),
  })).filter((group) => group.items.length > 0)

  const completedCount = visibleExercises.filter((e) => e.done).length
  const allDone = completedCount === visibleExercises.length && visibleExercises.length > 0
  const pct = visibleExercises.length
    ? Math.round((completedCount / visibleExercises.length) * 100)
    : 0

  const minutes = displayedWorkout.estimatedMinutes
  const intensity = displayedWorkout.intensity

  if (compact) {
    return (
      <CompactMode
        workout={{ ...workout, exercises: visibleExercises }}
        onExit={() => setCompact(false)}
        onToggleSet={toggleSet}
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {flash && (
        <div className="animate-celebrate fixed inset-x-0 top-4 z-50 mx-auto flex w-fit items-center gap-2 rounded-full border border-mint/30 bg-mint-soft px-4 py-2 text-sm font-medium text-mint shadow-lg">
          <PartyPopper className="size-4" />
          {flash}
        </div>
      )}

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="bg-sky-soft px-5 pb-5 pt-4">
          <p className="text-xs font-medium text-sky">{greeting()}, Daniel</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDateLong(workout.date)} · {blockName}
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <h1 className="text-balance text-xl font-semibold tracking-tight">{workout.title}</h1>
            <Badge variant="outline" className={cn('shrink-0 capitalize', intensityBg(intensity))}>
              <Flame className="size-3" />
              {intensity}
            </Badge>
          </div>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">{workout.focus}</p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />~{minutes} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Target className="size-3.5" />
              {completedCount}/{visibleExercises.length} done
            </span>
            {modification && (
              <Badge variant="secondary" className="text-xs">
                Modified · {scopeLabel(modification.scope)}
              </Badge>
            )}
          </div>

          {/* Smooth progress bar */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/70">
            <div
              className="progress-fill h-full rounded-full bg-sky"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-4">
          <Button onClick={() => setCompact(true)} className="flex-1 sm:flex-none">
            <Play className="size-4" />
            Start workout
          </Button>
          <Button
            variant="outline"
            onClick={() => setModifyOpen(true)}
            className="flex-1 sm:flex-none"
          >
            <SlidersHorizontal className="size-4" />
            Modify today
          </Button>
          <div className="flex w-full gap-1 rounded-lg bg-muted/60 p-1 sm:ml-auto sm:w-auto">
            {(['standard', 'short', 'light'] as const).map((version) => {
              const active = version === (dailyRecord?.version ?? 'standard')
              return (
                <button
                  key={version}
                  type="button"
                  onClick={() => {
                    trainingStore.setDailyVersion(
                      workout.date,
                      dailyRecord?.original ?? baseWorkout,
                      workout,
                      version,
                    )
                  }}
                  className={cn(
                    'rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition-colors',
                    active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                  )}
                >
                  {version}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Modification summary */}
      {modification && modification.changes.length > 0 && (
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Today&apos;s adjustments
          </p>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
            {modification.changes.map((c, i) => (
              <li key={i}>
                {c.removed ? (
                  <span>
                    Removed <span className="text-foreground">{c.original}</span> — {c.reason}
                  </span>
                ) : (
                  <span>
                    <span className="text-foreground">{c.updated}</span> — {c.reason}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Detailed logging toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5">
        <div>
          <p className="text-sm font-medium">Detailed logging</p>
          <p className="text-xs text-muted-foreground">
            Track sets, reps, RPE, and form. Off by default.
          </p>
        </div>
        <Switch checked={detailed} onCheckedChange={setDetailed} />
      </div>

      {/* Workout */}
      <section className="flex flex-col gap-5">
        {grouped.map((group) => {
          const accent = sectionAccent(group.section)
          return (
            <div key={group.section}>
              <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span className={cn('size-2 rounded-full', accent.solid)} />
                {SECTION_LABELS[group.section]}
              </h2>
              <div className="flex flex-col gap-2">
                {group.items.map((ex) => (
                  <ExerciseRow
                    key={ex.id}
                    exercise={ex}
                    detailed={detailed}
                    onChange={updateExercise}
                    progression={trainingState.progressionUpdates.find(
                      (update) => update.exerciseId === ex.id || update.exerciseName === ex.name,
                    )}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </section>

      {/* Completion */}
      <CompletionCard
        saved={!!completion}
        onSave={(c) => {
          const effective = displayedWorkout
          const updates = effective.exercises
            .map((exercise) =>
              createProgressionUpdate(
                exercise,
                effective.date,
                c,
                trainingState.progressionUpdates,
              ),
            )
            .filter((update): update is NonNullable<typeof update> => update != null)
          trainingStore.completeWorkout(baseWorkout, effective, c, updates)
          showFlash(
            c.outcome === 'skipped'
              ? 'Logged as skipped'
              : updates.length
                ? `Session saved · ${updates.length} target${updates.length === 1 ? '' : 's'} updated`
                : 'Session saved. Nice work.',
          )
        }}
      />
      {allDone && !completion && (
        <p className="text-center text-xs text-muted-foreground">
          All exercises done — log how it went above to finish.
        </p>
      )}

      <ModifyTodaySheet
        workout={workout}
        open={modifyOpen}
        onOpenChange={setModifyOpen}
        modified={!!modification}
        onApply={(result) => {
          trainingStore.saveModification(
            workout.date,
            dailyRecord?.original ?? baseWorkout,
            workout,
            result,
          )
          if (result.scope !== 'today') {
            const date = new Date(`${workout.date}T12:00:00`)
            const weekday = mondayFirstWeekday(date)
            const planToChange =
              result.scope === 'this_week'
                ? trainingState.weekOverrides[startOfWeekKey(date)]?.plan ??
                  trainingState.recurringPlan
                : trainingState.recurringPlan
            const updatedPlan = applyModificationToPlan(
              planToChange,
              weekday,
              result,
            )
            if (result.scope === 'this_week') {
              trainingStore.saveWeekOverride(startOfWeekKey(date), updatedPlan)
            } else {
              trainingStore.saveRecurringPlan(updatedPlan)
            }
          }
          showFlash(`Plan updated · ${scopeLabel(result.scope)}`)
        }}
        onRevert={() => {
          trainingStore.revertDailyPlan(workout.date)
          showFlash('Reverted to original plan')
        }}
      />
    </div>
  )
}

function scopeLabel(scope: ModificationResult['scope']): string {
  switch (scope) {
    case 'today':
      return 'today only'
    case 'this_week':
      return 'this week'
    case 'recurring':
      return 'recurring'
  }
}
