'use client'

import { useEffect, useState } from 'react'
import type { Workout } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { SECTION_LABELS } from '@/lib/format'
import { Check, ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react'
import { cn } from '@/lib/utils'

function useTimer() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])
  const reset = () => setSeconds(0)
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return { display: `${mm}:${ss}`, running, setRunning, reset }
}

export function CompactMode({
  workout,
  onExit,
  onToggleSet,
}: {
  workout: Workout
  onExit: () => void
  onToggleSet: (exerciseIdx: number, setIdx: number) => void
}) {
  const [idx, setIdx] = useState(0)
  const timer = useTimer()
  const exercise = workout.exercises[idx]
  const total = workout.exercises.length

  const next = () => {
    if (idx < total - 1) {
      setIdx(idx + 1)
      timer.reset()
    }
  }
  const prev = () => {
    if (idx > 0) {
      setIdx(idx - 1)
      timer.reset()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-xs font-medium text-muted-foreground">
          Compact Mode · {idx + 1}/{total}
        </span>
        <Button variant="ghost" size="icon" onClick={onExit} aria-label="Exit compact mode">
          <X className="size-5" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-primary">
            {SECTION_LABELS[exercise.section]}
          </p>
          <h2 className="mt-2 text-balance text-2xl font-semibold">
            {exercise.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Target {exercise.target} · Prev {exercise.previousResult}
          </p>
        </div>

        <div className="font-mono text-6xl font-bold tabular-nums">
          {timer.display}
        </div>

        <div className="flex gap-3">
          <Button
            size="lg"
            variant={timer.running ? 'secondary' : 'default'}
            onClick={() => timer.setRunning(!timer.running)}
          >
            {timer.running ? <Pause className="size-5" /> : <Play className="size-5" />}
            {timer.running ? 'Pause' : 'Start'} timer
          </Button>
          <Button size="lg" variant="outline" onClick={timer.reset}>
            Reset
          </Button>
        </div>

        <div className="flex w-full max-w-sm flex-wrap justify-center gap-2">
          {exercise.sets.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onToggleSet(idx, i)}
              className={cn(
                'flex size-12 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                s.done
                  ? 'border-success bg-success text-background'
                  : 'border-border bg-card text-muted-foreground',
              )}
            >
              {s.done ? <Check className="size-5" /> : s.setNumber}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border p-4">
        <Button variant="outline" onClick={prev} disabled={idx === 0}>
          <ChevronLeft className="size-4" />
          Prev
        </Button>
        {idx === total - 1 ? (
          <Button onClick={onExit} className="flex-1">
            <Check className="size-4" />
            Finish
          </Button>
        ) : (
          <Button onClick={next} className="flex-1">
            Next
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
