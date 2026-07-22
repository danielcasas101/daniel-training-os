'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MobilityItem } from '@/lib/types'
import type { FlexibilityRoutine } from '@/lib/seed-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useExerciseDetail } from '@/components/exercise-detail-provider'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Pause,
  Play,
  Sparkles,
  X,
} from 'lucide-react'
import { useTrainingState } from '@/components/training-state-provider'
import { trainingStore } from '@/lib/training-store'
import { localDateKey } from '@/lib/date'

export function FlexibilityClient({
  items,
  routines,
}: {
  items: MobilityItem[]
  routines: FlexibilityRoutine[]
}) {
  const [activeId, setActiveId] = useState(routines[0].id)
  const [playing, setPlaying] = useState<FlexibilityRoutine | null>(null)
  const [doneToday, setDoneToday] = useState<Record<string, boolean>>({})
  const [note, setNote] = useState('')
  const [milestone, setMilestone] = useState('')
  const [saved, setSaved] = useState(false)
  const { show } = useExerciseDetail()
  const trainingState = useTrainingState()
  const today = localDateKey()

  const active = routines.find((r) => r.id === activeId)!
  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])
  const activeItems = active.itemIds.map((id) => itemMap.get(id)).filter(Boolean) as MobilityItem[]

  if (playing) {
    return (
      <RoutinePlayer
        routine={playing}
        items={playing.itemIds.map((id) => itemMap.get(id)).filter(Boolean) as MobilityItem[]}
        onExit={() => {
          setDoneToday((d) => ({ ...d, [playing.id]: true }))
          trainingStore.saveFlexibilitySession({
            id: `${today}:${playing.id}`,
            date: today,
            routine: playing.name,
            durationMinutes: Number.parseInt(playing.duration, 10) || 0,
          })
          setPlaying(null)
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Today's routine hero */}
      <section className="overflow-hidden rounded-2xl border border-lavender/30 bg-lavender-soft p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-lavender">
          <Sparkles className="size-3.5" />
          Today&apos;s routine
        </div>
        <h2 className="mt-1 text-lg font-semibold">{active.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{active.description}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {active.focusAreas.map((a) => (
            <Badge key={a} variant="outline" className="border-lavender/30 bg-card/60 text-xs text-lavender">
              {a}
            </Badge>
          ))}
        </div>
        <Button
          className="mt-4 w-full bg-lavender text-background hover:bg-lavender/90 sm:w-fit"
          onClick={() => setPlaying(active)}
        >
          <Play className="size-4" />
          Start routine · {active.duration}
        </Button>
      </section>

      {/* Routine picker */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Choose a routine
        </h2>
        <div className="flex flex-col gap-2">
          {routines.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveId(r.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                activeId === r.id
                  ? 'border-lavender bg-lavender-soft'
                  : 'border-border bg-card hover:border-lavender/40',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  {(doneToday[r.id] ||
                    trainingState.flexibilitySessions.some(
                      (session) => session.id === `${today}:${r.id}`,
                    )) && (
                    <Check className="size-3.5 shrink-0 text-mint" />
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{r.description}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {r.duration}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Preview of stretches in selected routine */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          In this routine
        </h2>
        <div className="flex flex-col gap-2">
          {activeItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.area} · {item.sets} × {item.duration}
                </p>
              </div>
              <button
                onClick={() => show(item.name)}
                aria-label={`How to do ${item.name}`}
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Info className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Lightweight tracking */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Log today</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Optional. Just note anything that felt different.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Input
            value={milestone}
            placeholder="Milestone — e.g. palms closer to floor"
            onChange={(e) => setMilestone(e.target.value)}
          />
          <Input
            value={note}
            placeholder="Optional note..."
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            variant="outline"
            className="w-full sm:w-fit"
            onClick={() => {
              trainingStore.saveFlexibilitySession({
                id: `${today}:${active.id}`,
                date: today,
                routine: active.name,
                durationMinutes: Number.parseInt(active.duration, 10) || 0,
                milestone: milestone.trim() || undefined,
                note: note.trim() || undefined,
              })
              setSaved(true)
              setTimeout(() => setSaved(false), 2000)
            }}
          >
            {saved ? (
              <>
                <Check className="size-4" /> Saved
              </>
            ) : (
              'Save note'
            )}
          </Button>
        </div>
      </section>
    </div>
  )
}

function RoutinePlayer({
  routine,
  items,
  onExit,
}: {
  routine: FlexibilityRoutine
  items: MobilityItem[]
  onExit: () => void
}) {
  const [idx, setIdx] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(true)
  const item = items[idx]
  const total = items.length

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  const go = (dir: -1 | 1) => {
    const t = idx + dir
    if (t < 0 || t >= total) return
    setIdx(t)
    setSeconds(0)
    setRunning(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-lavender-soft">
      <div className="flex items-center justify-between border-b border-lavender/20 px-4 py-3">
        <span className="text-xs font-medium text-lavender">
          {routine.name} · {idx + 1}/{total}
        </span>
        <Button variant="ghost" size="icon" onClick={onExit} aria-label="Exit routine">
          <X className="size-5" />
        </Button>
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-center gap-1.5 pt-4">
        {items.map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === idx ? 'w-6 bg-lavender' : i < idx ? 'w-1.5 bg-lavender/50' : 'w-1.5 bg-lavender/20',
            )}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div>
          <p className="text-xs uppercase tracking-wide text-lavender">{item.area}</p>
          <h2 className="mt-2 text-balance text-2xl font-semibold">{item.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {item.sets} × {item.duration}
          </p>
        </div>

        <div className="flex size-44 items-center justify-center rounded-full border-4 border-lavender/30 bg-card/70">
          <span className="font-mono text-5xl font-bold tabular-nums text-foreground">
            {mm}:{ss}
          </span>
        </div>

        <div className="max-w-sm rounded-xl border border-coral/20 bg-coral-soft p-3 text-sm text-muted-foreground">
          <span className="font-medium text-coral">Cue: </span>
          {item.cue}
        </div>

        <Button
          size="lg"
          onClick={() => setRunning((r) => !r)}
          className={cn(
            running
              ? 'bg-card text-foreground hover:bg-card/80'
              : 'bg-lavender text-background hover:bg-lavender/90',
          )}
        >
          {running ? <Pause className="size-5" /> : <Play className="size-5" />}
          {running ? 'Pause' : 'Resume'}
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-lavender/20 p-4">
        <Button variant="outline" onClick={() => go(-1)} disabled={idx === 0}>
          <ChevronLeft className="size-4" />
          Prev
        </Button>
        {idx === total - 1 ? (
          <Button onClick={onExit} className="flex-1 bg-mint text-background hover:bg-mint/90">
            <Check className="size-4" />
            Finish
          </Button>
        ) : (
          <Button onClick={() => go(1)} className="flex-1 bg-lavender text-background hover:bg-lavender/90">
            Next
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
