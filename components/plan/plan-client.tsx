'use client'

import { useMemo, useState } from 'react'
import type { PlanDay } from '@/lib/types'
import type { TrainingBlock } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { SECTION_LABELS, WEEKDAYS_LONG, intensityBg } from '@/lib/format'
import { useExerciseDetail } from '@/components/exercise-detail-provider'
import { cn } from '@/lib/utils'
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Flame,
  Info,
  RotateCcw,
  Waves,
  Save,
} from 'lucide-react'
import { useTrainingState } from '@/components/training-state-provider'
import { trainingStore } from '@/lib/training-store'
import { startOfWeekKey } from '@/lib/date'

type DayAction = 'skip' | 'shorten' | 'easier' | 'replace'

interface WeekState {
  order: number[] // indexes into base plan
  actions: Record<string, DayAction | undefined>
}

// The 5 weekly metrics requested — counts of session types in the template.
const METRIC_DEFS: { label: string; match: (d: PlanDay) => boolean }[] = [
  { label: 'Planche', match: (d) => /planche/i.test(d.title + d.primaryFocus) },
  { label: 'Handstand', match: (d) => /handstand|press/i.test(d.title + d.primaryFocus) },
  { label: 'Gym', match: (d) => /gym|size|strength/i.test(d.title + d.primaryFocus) },
  { label: 'Swim', match: (d) => d.swimStatus === 'lesson' },
  { label: 'Flexibility', match: (d) => /flex|mobility|recovery/i.test(d.title + d.flexibilityEmphasis) },
]

export function PlanClient({
  initialPlan,
  block,
  todayWeekday,
}: {
  initialPlan: PlanDay[]
  block: TrainingBlock
  todayWeekday: number
}) {
  const trainingState = useTrainingState()
  const weekStart = startOfWeekKey()
  const templatePlan = trainingState.recurringPlan.length
    ? trainingState.recurringPlan
    : initialPlan
  const sourcePlan = trainingState.weekOverrides[weekStart]?.plan ?? templatePlan
  const [week, setWeek] = useState<WeekState>({
    order: sourcePlan.map((_, i) => i),
    actions: {},
  })

  const weekDays = week.order.map((i) => sourcePlan[i])
  const dirty =
    week.order.some((v, i) => v !== i) ||
    Object.values(week.actions).some(Boolean)

  const move = (orderIdx: number, dir: -1 | 1) => {
    const target = orderIdx + dir
    if (target < 0 || target >= week.order.length) return
    setWeek((w) => {
      const order = [...w.order]
      ;[order[orderIdx], order[target]] = [order[target], order[orderIdx]]
      return { ...w, order }
    })
  }

  const setAction = (dayId: string, action: DayAction) =>
    setWeek((w) => ({
      ...w,
      actions: {
        ...w.actions,
        [dayId]: w.actions[dayId] === action ? undefined : action,
      },
    }))

  const restore = () =>
    setWeek({ order: sourcePlan.map((_, i) => i), actions: {} })

  const effectiveWeek = weekDays.map((day, index) => {
    const action = week.actions[day.id]
    const scheduled = { ...day, weekday: index }
    if (action === 'skip') return { ...scheduled, isRest: true, exercises: [] }
    if (action === 'shorten') {
      return {
        ...scheduled,
        estimatedMinutes: Math.max(10, Math.round(day.estimatedMinutes * 0.5)),
        exercises: day.exercises.filter((exercise) =>
          exercise.section === 'warmup' || exercise.section === 'primary',
        ),
      }
    }
    if (action === 'easier') return { ...scheduled, intensity: 'light' as const }
    if (action === 'replace') {
      return {
        ...scheduled,
        title: 'Flexible replacement session',
        primaryFocus: 'Recovery, mobility, or light skill practice',
        intensity: 'light' as const,
      }
    }
    return scheduled
  })

  const saveWeek = () => {
    trainingStore.saveWeekOverride(weekStart, effectiveWeek)
    setWeek({ order: effectiveWeek.map((_, index) => index), actions: {} })
  }

  const metrics = useMemo(
    () =>
      METRIC_DEFS.map((m) => ({
        label: m.label,
        count: sourcePlan.filter((d) => !d.isRest && m.match(d)).length,
      })),
    [sourcePlan],
  )

  const today =
    sourcePlan.find((d) => d.weekday === todayWeekday) ?? sourcePlan[0]

  return (
    <div className="flex flex-col gap-5">
      {/* Current training block */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{block.name}</p>
            <p className="truncate text-xs text-muted-foreground">{block.focus}</p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            Week {block.weekIndex} / {block.totalWeeks}
          </Badge>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${(block.weekIndex / block.totalWeeks) * 100}%` }}
          />
        </div>
      </section>

      {/* Weekly metrics — exactly 5 */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          This week
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="text-xl font-semibold tabular-nums">{m.count}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Tabs defaultValue="week">
        <TabsList>
          <TabsTrigger value="template">Template</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
        </TabsList>

        {/* Weekly Template — the default recurring routine (read-only) */}
        <TabsContent value="template" className="mt-4 flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Your recurring default routine. Temporary changes live under This Week.
          </p>
          {templatePlan.map((day) => (
            <DayCard key={day.id} day={day} variant="template" />
          ))}
        </TabsContent>

        {/* This Week — temporary, reorderable, with simple actions */}
        <TabsContent value="week" className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Temporary changes for this week only.
            </p>
            {dirty && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={restore}>
                  <RotateCcw className="size-3.5" />
                  Restore
                </Button>
                <Button size="sm" onClick={saveWeek}>
                  <Save className="size-3.5" />
                  Save week
                </Button>
              </div>
            )}
          </div>
          {weekDays.map((day, i) => (
            <DayCard
              key={day.id}
              day={day}
              variant="week"
              action={week.actions[day.id]}
              onUp={() => move(i, -1)}
              onDown={() => move(i, 1)}
              isFirst={i === 0}
              isLast={i === weekDays.length - 1}
              onAction={(a) => setAction(day.id, a)}
            />
          ))}
        </TabsContent>

        {/* Today — exact current-day workout */}
        <TabsContent value="today" className="mt-4">
          <DayCard day={today} variant="today" defaultOpen />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Adjust today&apos;s session from the Today page using Modify today.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const ACTION_LABELS: Record<DayAction, string> = {
  skip: 'Skipped',
  shorten: 'Shortened',
  easier: 'Easier',
  replace: 'Replaced',
}

function DayCard({
  day,
  variant,
  action,
  onUp,
  onDown,
  isFirst,
  isLast,
  onAction,
  defaultOpen,
}: {
  day: PlanDay
  variant: 'template' | 'week' | 'today'
  action?: DayAction
  onUp?: () => void
  onDown?: () => void
  isFirst?: boolean
  isLast?: boolean
  onAction?: (a: DayAction) => void
  defaultOpen?: boolean
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { show } = useExerciseDetail()

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card',
        day.isRest && 'opacity-80',
        action === 'skip' && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {variant === 'week' && (
          <div className="flex w-8 shrink-0 flex-col items-center gap-1 pt-0.5">
            <button
              onClick={onUp}
              disabled={isFirst}
              aria-label="Move earlier"
              className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              <ArrowUp className="size-4" />
            </button>
            <button
              onClick={onDown}
              disabled={isLast}
              aria-label="Move later"
              className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              <ArrowDown className="size-4" />
            </button>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {WEEKDAYS_LONG[day.weekday]}
              </p>
              <h3 className="truncate text-sm font-semibold">{day.title}</h3>
              <p className="truncate text-xs text-muted-foreground">{day.primaryFocus}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="outline" className={cn('capitalize', intensityBg(day.intensity))}>
                {day.intensity}
              </Badge>
              {action && (
                <Badge variant="secondary" className="text-xs">
                  {ACTION_LABELS[action]}
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {day.estimatedMinutes} min
            </span>
            {day.swimStatus !== 'none' && (
              <span className="inline-flex items-center gap-1 capitalize">
                <Waves className="size-3.5" />
                {day.swimStatus}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Flame className="size-3.5" />
              {day.flexibilityEmphasis}
            </span>
          </div>

          {(variant === 'today' || defaultOpen) && !day.isRest && (
            <ul className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
              {day.exercises.map((ex) => (
                <li key={ex.id} className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => show(ex.name)}
                    className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                  >
                    <Info className="size-3 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      <span className="text-muted-foreground">
                        {SECTION_LABELS[ex.section].split(' ')[0]}:
                      </span>{' '}
                      {ex.name}
                    </span>
                  </button>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {ex.target}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {variant === 'week' && !day.isRest && (
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
              <ActionChip active={action === 'skip'} onClick={() => onAction?.('skip')}>
                Skip
              </ActionChip>
              <ActionChip active={action === 'shorten'} onClick={() => onAction?.('shorten')}>
                Shorten
              </ActionChip>
              <ActionChip active={action === 'easier'} onClick={() => onAction?.('easier')}>
                Easier
              </ActionChip>
              <ActionChip active={action === 'replace'} onClick={() => setSheetOpen(true)}>
                Replace
              </ActionChip>
            </div>
          )}
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl sm:rounded-none sm:data-[side=bottom]:inset-y-0 sm:data-[side=bottom]:right-0 sm:data-[side=bottom]:left-auto sm:data-[side=bottom]:h-full sm:data-[side=bottom]:w-full sm:data-[side=bottom]:max-w-md sm:data-[side=bottom]:border-l"
        >
          <SheetHeader>
            <SheetTitle>Replace {day.title}</SheetTitle>
            <SheetDescription>Pick a replacement focus for this day.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-2 px-4 pb-6">
            {['Flexibility session', 'Light cardio / walk', 'Extra recovery', 'Handstand practice only', 'Gym physique session'].map(
              (opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onAction?.('replace')
                    setSheetOpen(false)
                  }}
                  className="rounded-lg border border-border bg-card p-3 text-left text-sm transition-colors hover:border-primary/40"
                >
                  {opt}
                </button>
              ),
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function ActionChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background text-muted-foreground hover:border-muted-foreground/40',
      )}
    >
      {children}
    </button>
  )
}
