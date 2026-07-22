'use client'

import { useState } from 'react'
import type { BodyweightLog, Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { TrendChart } from '@/components/charts/trend-chart'
import { cn } from '@/lib/utils'
import { Check, Plus, Scale, TrendingUp } from 'lucide-react'
import { useTrainingState } from '@/components/training-state-provider'
import { trainingStore } from '@/lib/training-store'
import { localDateKey, startOfWeekKey } from '@/lib/date'

function shortDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function BodyClient({
  profile,
  logs,
}: {
  profile: Profile
  logs: BodyweightLog[]
}) {
  const trainingState = useTrainingState()
  const entries = trainingState.bodyweight.length ? trainingState.bodyweight : logs
  const [weight, setWeight] = useState('')
  const [adding, setAdding] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)
  const currentMonth = localDateKey().slice(0, 7)
  const note = trainingState.bodyNotes.find((entry) => entry.month === currentMonth)?.note ?? ''

  function addEntry() {
    const w = parseFloat(weight)
    if (!w || Number.isNaN(w)) return
    const today = localDateKey()
    trainingStore.saveBodyweight({ id: `bw-${today}`, date: today, weightLb: w })
    setWeight('')
    setAdding(false)
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const series = sorted.map((e) => ({ label: shortDate(e.date), value: e.weightLb }))
  const current = sorted[sorted.length - 1]?.weightLb ?? profile.bodyweightLb
  const start = sorted[0]?.weightLb ?? current
  const change = current - start
  const weekStart = startOfWeekKey()
  const gymTarget = trainingState.recurringPlan.filter(
    (day) => !day.isRest && /gym|size|strength/i.test(`${day.title} ${day.primaryFocus}`),
  ).length
  const gymCompleted = trainingState.completedWorkouts.filter(
    (record) =>
      record.date >= weekStart &&
      record.completion.outcome !== 'skipped' &&
      record.workout.exercises.some((exercise) => exercise.section === 'strength'),
  ).length

  return (
    <div className="flex flex-col gap-6">
      {/* Snapshot */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <Scale className="size-4 text-primary" />
          <p className="mt-2 text-2xl font-semibold tabular-nums">{current}</p>
          <p className="text-xs text-muted-foreground">Current bodyweight (lb)</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <TrendingUp className="size-4 text-primary" />
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground">Change this period (lb)</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-2xl font-semibold tabular-nums">
            {gymCompleted} / {Math.max(gymTarget, 1)}
          </p>
          <p className="text-xs text-muted-foreground">Gym sessions this week</p>
        </div>
      </section>

      {/* Physique focus */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Physique focus</h2>
          <Badge variant="secondary">Maintenance · lean-gain bias</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          Hold a steady bodyweight to keep skill work feeling light, with a slight lean
          gain over time. Prioritize shoulders, upper back, and core to support planche
          and handstand progress.
        </p>
      </section>

      {/* Bodyweight log */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Bodyweight
          </h2>
          {!adding && (
            <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
              <Plus className="size-4" />
              Log weight
            </Button>
          )}
        </div>
        {adding && (
          <div className="mb-3 flex items-end gap-2 rounded-lg border border-border bg-card p-3">
            <Input
              type="number"
              inputMode="decimal"
              placeholder="168"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              autoFocus
            />
            <Button onClick={addEntry}>Add</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        )}
        <TrendChart
          title="Trend"
          data={series}
          unit="lb"
          color="var(--chart-2)"
          area={false}
          note="Weigh in whenever — weekly is plenty."
        />
      </section>

      {/* Optional monthly note */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium">Monthly note</h2>
          <span className="text-xs text-muted-foreground">Optional</span>
        </div>
        <Textarea
          placeholder="How does training and physique feel this month? Energy, recovery, anything notable."
          value={note}
          onChange={(e) => {
            trainingStore.saveBodyNote({
              id: `body-note-${currentMonth}`,
              month: currentMonth,
              note: e.target.value,
            })
            setNoteSaved(false)
          }}
          rows={3}
        />
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          disabled={!note.trim()}
          onClick={() => setNoteSaved(true)}
        >
          <Check className={cn('size-4', !noteSaved && 'opacity-0')} />
          {noteSaved ? 'Saved' : 'Save note'}
        </Button>
      </section>
    </div>
  )
}
