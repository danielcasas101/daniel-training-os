'use client'

import { useState } from 'react'
import type { SkillDefinition, UserSkillState } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { accentForCategory, type AccentTheme } from '@/lib/theme'
import {
  AlertTriangle,
  Check,
  ChevronRight,
  ExternalLink,
  Lock,
  Plus,
  Target,
  Trophy,
} from 'lucide-react'
import { useTrainingState } from '@/components/training-state-provider'
import { trainingStore } from '@/lib/training-store'
import type { ProgressionUpdate } from '@/lib/training-state'
import { localDateKey } from '@/lib/date'

function movementPattern(skill: SkillDefinition) {
  return /planche/i.test(skill.name)
    ? /planche/i
    : /handstand/i.test(skill.name)
      ? /handstand|kick.?up/i
      : /press|compression/i.test(skill.name)
        ? /press|compression|pike/i
        : /physique|strength/i.test(skill.name)
          ? /bench|pull|dip|row|dumbbell|cable/i
          : /swim/i
}

export function SkillsClient({
  skills,
  states,
}: {
  skills: SkillDefinition[]
  states: UserSkillState[]
}) {
  const trainingState = useTrainingState()
  const active = skills.filter((skill) => trainingState.activeSkillIds.includes(skill.id))
  const optional = skills.filter((skill) => !trainingState.activeSkillIds.includes(skill.id))
  const stateFor = (id: string) => states.find((s) => s.skillId === id)
  const updateFor = (skill: SkillDefinition) => {
    const pattern = movementPattern(skill)
    return trainingState.progressionUpdates.find((update) => pattern.test(update.exerciseName))
  }
  const exposureFor = (skill: SkillDefinition) => {
    const pattern = movementPattern(skill)
    const today = new Date(`${localDateKey()}T12:00:00`).getTime()
    return new Set(
      trainingState.progressionUpdates
        .filter((update) => {
          const age = today - new Date(`${update.date}T12:00:00`).getTime()
          return age >= 0 && age < 7 * 86_400_000 && pattern.test(update.exerciseName)
        })
        .map((update) => update.date),
    ).size
  }

  const addToPlan = (skill: SkillDefinition) => {
    const plan = trainingState.recurringPlan.map((day) => {
      if (day.weekday !== 5) return day
      const name = `${skill.name} practice`
      if (day.exercises.some((exercise) => exercise.name === name)) return day
      return {
        ...day,
        exercises: [
          ...day.exercises,
          {
            id: `optional-${skill.id}`,
            name,
            target: '15 min',
            section: 'primary' as const,
            cue: 'Keep optional work submaximal so it does not dilute primary goals.',
          },
        ],
      }
    })
    trainingStore.saveRecurringPlan(plan)
  }

  const activateSkill = (skill: SkillDefinition) => {
    trainingStore.activateSkill(skill.id)
    addToPlan(skill)
  }

  return (
    <Tabs defaultValue="active">
      <TabsList>
        <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
        <TabsTrigger value="explore">Explore ({optional.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="mt-4 flex flex-col gap-4">
        {active.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            state={stateFor(skill.id)}
            progression={updateFor(skill)}
            recentExposure={exposureFor(skill)}
            onAdd={() => addToPlan(skill)}
          />
        ))}
      </TabsContent>

      <TabsContent value="explore" className="mt-4">
        <p className="mb-3 text-sm text-muted-foreground">
          Optional skills. Each shows equipment needs and interference with your active goals.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {optional.map((skill) => (
            <OptionalCard key={skill.id} skill={skill} onActivate={() => activateSkill(skill)} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}

function SkillCard({
  skill,
  state,
  progression,
  recentExposure,
  onAdd,
}: {
  skill: SkillDefinition
  state?: UserSkillState
  progression?: ProgressionUpdate
  recentExposure: number
  onAdd: () => void
}) {
  const accent = accentForCategory(skill.category, skill.name)
  const currentStage = skill.stages.find((s) => s.id === state?.currentStageId)
  const effectiveCurrentStage = currentStage ?? skill.stages[0]
  const currentOrder = effectiveCurrentStage?.order ?? 0
  const total = skill.stages.length
  const nextStage = skill.stages.find((s) => s.order === currentOrder + 1)
  // Progress through the ladder, treating the current stage as in-flight.
  const pct = Math.round(((currentOrder - 0.5) / total) * 100)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      {/* Accent header */}
      <div className={cn('flex flex-col gap-3 p-4', accent.soft)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold">{skill.name}</h3>
            <p className={cn('mt-0.5 text-xs font-medium capitalize', accent.text)}>
              {skill.category}
            </p>
          </div>
          <Badge variant="outline" className={cn('shrink-0 capitalize', accent.border, accent.text)}>
            {skill.priority}
          </Badge>
        </div>

        {/* Stage + progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{effectiveCurrentStage?.name ?? '—'}</span>
            <span className={cn('font-medium tabular-nums', accent.text)}>
              Stage {currentOrder} / {total}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-background/70">
            <div
              className={cn('progress-fill h-full rounded-full', accent.solid)}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <Field label="Last result" value={progression?.lastResult ?? state?.bestResult ?? '—'} />
          <Field label="Today target" value={progression?.nextTarget ?? state?.nextMilestone ?? '—'} />
          <Field label="Recent exposure" value={`${recentExposure}× in the last 7 days`} />
          <Field label="Next stage" value={nextStage?.name ?? 'Top stage'} />
        </div>

        {state?.nextMilestone && (
          <div className={cn('flex items-start gap-2 rounded-lg p-2.5 text-xs', accent.soft, accent.text)}>
            <Target className="mt-0.5 size-3.5 shrink-0" />
            <span>
              <span className="font-semibold">Unlock next: </span>
              {state.nextMilestone}
            </span>
          </div>
        )}

        {progression && (
          <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-xs">
            <p className="font-semibold capitalize">
              {progression.status.replaceAll('_', ' ')}
            </p>
            <p className="mt-0.5 text-muted-foreground">{progression.reason}</p>
          </div>
        )}

        {/* Connected progression map */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Progression map
          </p>
          <ol className="relative flex flex-col">
            {skill.stages.map((stage, i) => (
              <StageRow
                key={stage.id}
                stage={stage}
                accent={accent}
                done={stage.order < currentOrder}
                current={stage.order === currentOrder}
                isLast={i === skill.stages.length - 1}
              />
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <Button size="sm" variant="outline" onClick={onAdd}>
            <Plus className="size-3.5" />
            Add to plan
          </Button>
          {skill.guideUrl && (
            <Button
              size="sm"
              variant="ghost"
              nativeButton={false}
              render={<a href={skill.guideUrl} target="_blank" rel="noreferrer" />}
            >
              <ExternalLink className="size-3.5" />
              Guide
            </Button>
          )}
          {state && <HistoryDialog skill={skill} state={state} />}
        </div>
      </div>
    </Card>
  )
}

function StageRow({
  stage,
  accent,
  done,
  current,
  isLast,
}: {
  stage: SkillDefinition['stages'][number]
  accent: AccentTheme
  done: boolean
  current: boolean
  isLast: boolean
}) {
  const [open, setOpen] = useState(false)
  const locked = !done && !current
  return (
    <li className="relative">
      {/* Connector line */}
      {!isLast && (
        <span
          className={cn(
            'absolute left-[15px] top-7 h-[calc(100%-1rem)] w-0.5',
            done ? accent.solid : 'bg-border',
          )}
          aria-hidden
        />
      )}
      <div className={cn('rounded-lg', current && accent.soft)}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-3 px-1.5 py-1.5 text-left text-sm"
        >
          <span
            className={cn(
              'z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-card transition-colors',
              done && cn(accent.solid, 'border-transparent'),
              current && cn(accent.border, accent.text),
              locked && 'border-border text-muted-foreground',
            )}
          >
            {done ? (
              <Check className={cn('size-4', accent.onSolid)} />
            ) : current ? (
              <span className={cn('size-2.5 rounded-full', accent.solid)} />
            ) : (
              <Lock className="size-3.5" />
            )}
          </span>
          <span
            className={cn(
              'flex-1',
              current && cn('font-semibold', accent.text),
              done && 'text-muted-foreground',
            )}
          >
            {stage.name}
          </span>
          <span className="text-xs text-muted-foreground">{stage.timelineRange}</span>
          <ChevronRight
            className={cn('size-3.5 text-muted-foreground transition-transform', open && 'rotate-90')}
          />
        </button>
        {open && (
          <div className="space-y-2 px-11 pb-3 pt-1 text-xs text-muted-foreground">
            <p>{stage.description}</p>
            {stage.exercises.length > 0 && (
              <p>
                <span className="font-medium text-foreground">Exercises: </span>
                {stage.exercises.join(', ')}
              </p>
            )}
            {stage.commonFaults.length > 0 && (
              <p className="flex items-start gap-1 text-warning">
                <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                {stage.commonFaults.join(', ')}
              </p>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium text-foreground">{value}</p>
    </div>
  )
}

function HistoryDialog({
  skill,
  state,
}: {
  skill: SkillDefinition
  state: UserSkillState
}) {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="ghost" />}>
        <Trophy className="size-3.5" />
        History
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{skill.name} history</DialogTitle>
        </DialogHeader>
        <ul className="flex flex-col gap-3">
          {state.history.map((h, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="w-20 shrink-0 text-xs text-muted-foreground">{h.date}</span>
              <span>{h.note}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 border-t border-border pt-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Supporting qualities
          </p>
          <p className="text-sm text-muted-foreground">
            {skill.supportingQualities.join(', ') || '—'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function OptionalCard({ skill, onActivate }: { skill: SkillDefinition; onActivate: () => void }) {
  const accent = accentForCategory(skill.category, skill.name)
  return (
    <Card className="gap-0 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">{skill.name}</h3>
          <p className={cn('text-xs font-medium capitalize', accent.text)}>{skill.category}</p>
        </div>
        <Badge variant="outline">Inactive</Badge>
      </div>
      <div className="mt-3 space-y-2 text-xs">
        <p>
          <span className="text-muted-foreground">Equipment: </span>
          {skill.equipment.join(', ')}
        </p>
        {skill.interference && (
          <p className="flex items-start gap-1 text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-3 shrink-0 text-warning" />
            {skill.interference}
          </p>
        )}
      </div>
      <Button size="sm" variant="outline" className="mt-3 w-full" onClick={onActivate}>
        <Plus className="size-3.5" />
        Activate skill
      </Button>
    </Card>
  )
}
