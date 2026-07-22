import type { PlanDay, PlanModification, Workout, WorkoutExercise } from './types'
import { localDateKey, mondayFirstWeekday } from './date'

function buildSets(id: string, target: string) {
  const match = target.match(/(\d+)\s*x\s*(.+)/i)
  const count = match ? Number(match[1]) : 1
  const setTarget = match?.[2]?.trim() ?? target
  return Array.from({ length: Math.min(Math.max(count, 1), 10) }, (_, index) => ({
    id: `${id}-set-${index + 1}`,
    setNumber: index + 1,
    target: setTarget,
    result: '',
    done: false,
  }))
}

export function workoutFromPlan(plan: PlanDay[], date = new Date()): Workout {
  const day = plan.find((item) => item.weekday === mondayFirstWeekday(date)) ?? plan[0]
  const dateKey = localDateKey(date)
  const exercises: WorkoutExercise[] = day.exercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    section: exercise.section,
    target: exercise.target,
    previousResult: '',
    actualResult: '',
    cue: exercise.cue,
    done: false,
    sets: buildSets(exercise.id, exercise.target),
  }))
  return {
    id: `workout-${dateKey}`,
    date: dateKey,
    title: day.title,
    blockId: 'block-1',
    focus: day.primaryFocus,
    estimatedMinutes: day.estimatedMinutes,
    intensity: day.intensity,
    exercises,
    status: 'planned',
  }
}

export function applyModificationToWorkout(
  workout: Workout,
  modification?: PlanModification,
): Workout {
  if (!modification) return workout
  const removed = new Set(
    modification.changes.filter((change) => change.removed).map((change) => change.original),
  )
  const replacements = new Map(
    modification.changes
      .filter((change) => !change.removed && change.updated)
      .map((change) => [change.original, change.updated]),
  )
  return {
    ...workout,
    estimatedMinutes:
      modification.strategy === 'shorter'
        ? Math.max(10, Math.round(workout.estimatedMinutes * 0.5))
        : workout.estimatedMinutes,
    intensity: modification.strategy === 'easier' ? 'light' : workout.intensity,
    exercises: workout.exercises
      .filter((exercise) => !removed.has(exercise.name))
      .map((exercise) => ({
        ...exercise,
        name: replacements.get(exercise.name) ?? exercise.name,
      })),
  }
}

export function applyModificationToPlan(
  plan: PlanDay[],
  weekday: number,
  modification: PlanModification,
): PlanDay[] {
  return plan.map((day) => {
    if (day.weekday !== weekday) return day
    const removed = new Set(
      modification.changes.filter((change) => change.removed).map((change) => change.original),
    )
    const replacements = new Map(
      modification.changes
        .filter((change) => !change.removed && change.updated)
        .map((change) => [change.original, change.updated]),
    )
    return {
      ...day,
      estimatedMinutes:
        modification.strategy === 'shorter'
          ? Math.max(10, Math.round(day.estimatedMinutes * 0.5))
          : day.estimatedMinutes,
      intensity: modification.strategy === 'easier' ? 'light' : day.intensity,
      swimStatus: modification.reason === 'no_pool' ? 'none' : day.swimStatus,
      exercises: day.exercises
        .filter((exercise) => !removed.has(exercise.name))
        .map((exercise) => ({ ...exercise, name: replacements.get(exercise.name) ?? exercise.name })),
    }
  })
}
