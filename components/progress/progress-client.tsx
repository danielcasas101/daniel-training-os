'use client'

import { useState } from 'react'
import type {
  SkillDefinition,
  UserSkillState,
  BodyweightLog,
  PlanDay,
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { TrendChart } from '@/components/charts/trend-chart'
import { cn } from '@/lib/utils'
import { ACCENTS, type AccentTheme } from '@/lib/theme'
import {
  Activity,
  Check,
  Flame,
  Plus,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { useTrainingState } from '@/components/training-state-provider'
import type { ProgressionStatus } from '@/lib/progression'
import { localDateKey } from '@/lib/date'

const STATUS_LABEL: Record<ProgressionStatus, string> = {
  improving: 'Improving',
  stable: 'Stable',
  stalled: 'Stalled',
  insufficient_exposure: 'Insufficient exposure',
  ready_to_progress: 'Ready to progress',
  limited_by_discomfort: 'Limited by discomfort',
}

function shortDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Meaningful, low-frequency updates Daniel might log — not daily testing.
const UPDATE_PROMPTS = [
  'New open tuck best',
  'Handstand kick-ups feel more consistent',
  'First advanced tuck hold',
  'New L-sit best',
  'Bodyweight changed noticeably',
  'New pain issue',
  'Something else',
]

interface MilestoneEntry {
  id: string
  date: string
  note: string
}

export function ProgressClient({
  skills,
  skillStates,
  bodyweightLogs,
}: {
  skills: SkillDefinition[]
  skillStates: UserSkillState[]
  bodyweightLogs: BodyweightLog[]
  plan: PlanDay[]
}) {
  const trainingState = useTrainingState()
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [milestones, setMilestones] = useState<MilestoneEntry[]>(() =>
    skillStates
      .flatMap((s) => s.history.map((h, i) => ({ id: `${s.skillId}-${i}`, ...h })))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5),
  )

  const stateFor = (id: string) => skillStates.find((s) => s.skillId === id)
  const skillFor = (id: string) => skills.find((s) => s.id === id)
  const stageName = (skillId: string) => {
    const st = stateFor(skillId)
    const sk = skillFor(skillId)
    return sk?.stages.find((stg) => stg.id === st?.currentStageId)?.name ?? '—'
  }

  const effectiveBodyweight = trainingState.bodyweight.length
    ? trainingState.bodyweight
    : bodyweightLogs
  const bwSorted = [...effectiveBodyweight].sort((a, b) => a.date.localeCompare(b.date))
  const bwSeries = bwSorted.map((b) => ({ label: shortDate(b.date), value: b.weightLb }))
  const bwCurrent = bwSorted[bwSorted.length - 1]?.weightLb
  const bwChange =
    bwCurrent != null ? bwCurrent - (bwSorted[0]?.weightLb ?? bwCurrent) : 0
  const latestUpdates = Object.values(
    trainingState.progressionUpdates.reduce<
      Record<string, (typeof trainingState.progressionUpdates)[number]>
    >((acc, update) => {
      if (!acc[update.exerciseId] || acc[update.exerciseId].date < update.date) {
        acc[update.exerciseId] = update
      }
      return acc
    }, {}),
  ).sort((a, b) => b.date.localeCompare(a.date))
  const plancheUpdate = latestUpdates.find((update) => /planche/i.test(update.exerciseName))
  const handstandUpdate = latestUpdates.find((update) =>
    /kick.?up|handstand/i.test(update.exerciseName),
  )
  const todayValue = new Date(`${localDateKey()}T12:00:00`).getTime()
  const recentCompleted = trainingState.completedWorkouts.filter((workout) => {
    const age = todayValue - new Date(`${workout.date}T12:00:00`).getTime()
    return age >= 0 && age < 7 * 86_400_000 && workout.completion.outcome !== 'skipped'
  }).length

  // Snapshot cards
  const cards: {
    icon: typeof Sparkles
    label: string
    value: string
    sub?: string
    accent: AccentTheme
  }[] = [
    {
      icon: Sparkles,
      label: 'Planche stage',
      value: stageName('skill-planche'),
      sub: plancheUpdate?.nextTarget ?? stateFor('skill-planche')?.bestResult,
      accent: ACCENTS.coral,
    },
    {
      icon: Activity,
      label: 'Handstand stage',
      value: stageName('skill-handstand'),
      sub: handstandUpdate?.nextTarget ?? stateFor('skill-handstand')?.bestResult,
      accent: ACCENTS.sky,
    },
    {
      icon: Trophy,
      label: 'Best recent hold',
      value: '10s',
      sub: 'Open tuck, parallettes',
      accent: ACCENTS.mint,
    },
    {
      icon: Flame,
      label: 'Kick-up consistency',
      value: '3 / 10',
      sub: 'Freestanding attempts',
      accent: ACCENTS.sunny,
    },
  ]

  function saveUpdate() {
    if (!prompt && !note.trim()) return
    const today = new Date().toISOString().slice(0, 10)
    const text = note.trim() ? `${prompt ? prompt + ' — ' : ''}${note.trim()}` : prompt!
    setMilestones((prev) => [
      { id: `u-${Date.now()}`, date: today, note: text },
      ...prev,
    ])
    setNote('')
    setPrompt(null)
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Snapshot */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={cn('rounded-xl border p-4', c.accent.soft, c.accent.border)}
          >
            <div className={cn('flex size-7 items-center justify-center rounded-lg', c.accent.solid)}>
              <c.icon className={cn('size-4', c.accent.onSolid)} />
            </div>
            <p className="mt-2 text-lg font-semibold leading-tight text-balance">
              {c.value}
            </p>
            <p className="text-xs font-medium">{c.label}</p>
            {c.sub && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{c.sub}</p>
            )}
          </div>
        ))}
      </section>

      {/* Trends — just the two that matter */}
      <section className="grid gap-4 lg:grid-cols-2">
        <TrendChart
          title="Bodyweight trend"
          data={bwSeries}
          unit="lb"
          color="var(--chart-2)"
          area={false}
          note={`${bwCurrent ?? '—'} lb now · ${bwChange >= 0 ? '+' : ''}${bwChange.toFixed(1)} lb this period`}
        />
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="size-4 text-mint" />
            <h3 className="text-sm font-medium">Weekly consistency</h3>
          </div>
          <p className="text-3xl font-semibold tabular-nums">{recentCompleted} / 6</p>
          <p className="text-xs text-muted-foreground">
            Planned sessions completed this week
          </p>
          <div className="mt-3 flex gap-1.5">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div
                key={i}
                className={cn(
                  'flex h-7 flex-1 items-center justify-center rounded text-[10px] font-medium',
                  i < 5
                    ? 'bg-mint text-background'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {d}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Progression decisions
        </h2>
        {latestUpdates.length ? (
          <div className="flex flex-col gap-2">
            {latestUpdates.slice(0, 6).map((update) => (
              <div key={update.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{update.exerciseName}</p>
                  <Badge variant="secondary">{STATUS_LABEL[update.status]}</Badge>
                </div>
                <div className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                  <p><span className="text-muted-foreground">Last: </span>{update.lastResult}</p>
                  <p><span className="text-muted-foreground">Next: </span>{update.nextTarget}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{update.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Complete a workout with a quick result to generate the first next-session targets.
          </p>
        )}
      </section>

      {/* Recent milestones + update */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent milestones
          </h2>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Log an update
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {milestones.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              No updates yet. Log one only when something meaningful changes.
            </p>
          )}
          {milestones.map((m) => (
            <div
              key={m.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
            >
              <Trophy className="mt-0.5 size-4 shrink-0 text-coral" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">{m.note}</p>
                <p className="text-xs text-muted-foreground">{shortDate(m.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Log an update</SheetTitle>
            <SheetDescription>
              Only when something meaningful changes — no daily testing required.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-wrap gap-2">
              {UPDATE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrompt(p === prompt ? null : p)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition-colors',
                    prompt === p
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Optional detail (e.g. 'Open tuck 11s clean, felt easy')"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
            <Button onClick={saveUpdate} disabled={!prompt && !note.trim()}>
              <Check className="size-4" />
              Save update
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
