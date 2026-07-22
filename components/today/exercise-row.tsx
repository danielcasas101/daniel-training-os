'use client'

import { useState } from 'react'
import type { WorkoutExercise } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useExerciseDetail } from '@/components/exercise-detail-provider'
import { ArrowRight, Check, Info, MessageSquarePlus } from 'lucide-react'

export function ExerciseRow({
  exercise,
  detailed,
  onChange,
}: {
  exercise: WorkoutExercise
  detailed: boolean
  onChange: (next: WorkoutExercise) => void
}) {
  const { show } = useExerciseDetail()
  const [showNote, setShowNote] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const toggleComplete = () =>
    onChange({
      ...exercise,
      done: !exercise.done,
      sets: exercise.sets.map((s) => ({ ...s, done: !exercise.done })),
    })

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card transition-all duration-200',
        exercise.done && 'animate-card-settle border-mint/40 bg-mint-soft',
      )}
    >
      <div className="flex items-center gap-2 p-2.5">
        {/* Big tap target to complete */}
        <button
          onClick={toggleComplete}
          aria-label={`Mark ${exercise.name} ${exercise.done ? 'incomplete' : 'complete'}`}
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors',
            exercise.done
              ? 'border-mint bg-mint text-background'
              : 'border-border bg-background text-transparent hover:border-mint/50',
          )}
        >
          <Check className={cn('size-5', exercise.done && 'animate-pop-check')} />
        </button>

        <button
          onClick={toggleComplete}
          className="min-w-0 flex-1 text-left"
        >
          <p className={cn('truncate text-sm font-medium', exercise.done && 'text-muted-foreground line-through')}>
            {exercise.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{exercise.target}</p>
        </button>

        <button
          onClick={() => show(exercise.name)}
          aria-label={`How to do ${exercise.name}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Info className="size-4" />
        </button>
      </div>

      {/* Progression cue: last → today */}
      {!detailed && exercise.previousResult && (
        <div className="mx-2.5 mb-2 flex items-center gap-2 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs">
          <span className="text-muted-foreground">
            Last <span className="font-medium text-foreground">{exercise.previousResult}</span>
          </span>
          <ArrowRight className="size-3 text-muted-foreground" />
          <span className="text-muted-foreground">
            Target <span className="font-medium text-sky">{exercise.target}</span>
          </span>
        </div>
      )}

      {/* Lightweight optional controls */}
      {!detailed && (
        <div className="flex flex-wrap items-center gap-2 px-2.5 pb-2.5">
          {showResult ? (
            <Input
              autoFocus
              value={exercise.actualResult}
              placeholder={`Result (prev ${exercise.previousResult})`}
              className="h-8 flex-1 text-sm"
              onChange={(e) => onChange({ ...exercise, actualResult: e.target.value })}
            />
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={() => setShowResult(true)}
            >
              + Result
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={() => setShowNote((n) => !n)}
          >
            <MessageSquarePlus className="size-3.5" />
            Note
          </Button>
          {showNote && (
            <Input
              value={exercise.notes ?? ''}
              placeholder="Quick note..."
              className="h-8 w-full text-sm"
              onChange={(e) => onChange({ ...exercise, notes: e.target.value })}
            />
          )}
        </div>
      )}

      {/* Detailed logging (only when toggle is on) */}
      {detailed && (
        <div className="border-t border-border px-2.5 py-2.5">
          <div className="flex flex-col gap-1.5">
            {exercise.sets.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <span className="w-9 text-xs text-muted-foreground">Set {s.setNumber}</span>
                <Input
                  value={s.result}
                  placeholder={s.target}
                  className="h-8 flex-1 text-sm"
                  onChange={(e) => {
                    const sets = [...exercise.sets]
                    sets[i] = { ...s, result: e.target.value }
                    onChange({ ...exercise, sets })
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant={s.done ? 'default' : 'outline'}
                  className="h-8"
                  onClick={() => {
                    const sets = [...exercise.sets]
                    sets[i] = { ...s, done: !s.done }
                    onChange({ ...exercise, sets, done: sets.every((x) => x.done) })
                  }}
                >
                  {s.done ? 'Done' : 'Log'}
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">RPE</span>
            <Input
              type="number"
              min={1}
              max={10}
              value={exercise.rpe ?? ''}
              placeholder="-"
              className="h-8 w-16 text-sm"
              onChange={(e) =>
                onChange({ ...exercise, rpe: e.target.value ? Number(e.target.value) : undefined })
              }
            />
            <span className="text-xs text-muted-foreground">Form</span>
            <Input
              placeholder="-"
              className="h-8 w-20 text-sm"
              onChange={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  )
}
