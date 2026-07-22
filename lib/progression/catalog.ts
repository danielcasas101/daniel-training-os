import type { SessionCompletion, WorkoutExercise } from '@/lib/types'
import type { ProgressionUpdate } from '@/lib/training-state'
import {
  evaluateHandstandProgression,
  evaluateHoldProgression,
  evaluateRepProgression,
} from './engine'
import type {
  DiscomfortLevel,
  FormQuality,
  HandstandResult,
  HoldResult,
  RepResult,
} from './types'

export interface MovementPrescription {
  kind: ProgressionUpdate['kind']
  progressWhen: string
  nextUnlock: string
}

function normalize(value: string) {
  return value.toLowerCase()
}

function numbers(value: string): number[] {
  return [...value.matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]))
}

function resultNumbers(exercise: WorkoutExercise): number[] {
  const setValues = exercise.sets.flatMap((set) => numbers(set.result))
  return setValues.length ? setValues : numbers(exercise.actualResult)
}

function targetShape(target: string) {
  const match = target.match(/(\d+)\s*x\s*(\d+)(?:\s*[-–]\s*(\d+))?/i)
  return {
    sets: match ? Number(match[1]) : 3,
    minimum: match ? Number(match[2]) : 6,
    maximum: match?.[3] ? Number(match[3]) : match ? Number(match[2]) : 8,
  }
}

function quality(completion: SessionCompletion, exercise: WorkoutExercise): FormQuality {
  if (exercise.formQuality) return exercise.formQuality
  if (completion.outcome === 'great') return 'clean'
  if (completion.outcome === 'rough' || completion.outcome === 'skipped') return 'poor'
  return 'mixed'
}

function discomfort(
  completion: SessionCompletion,
  exercise: WorkoutExercise,
): DiscomfortLevel {
  if (exercise.discomfort) return exercise.discomfort
  if (completion.discomfort === 'none') return 'none'
  return completion.outcome === 'rough' ? 'notable' : 'mild'
}

export function movementPrescription(exercise: WorkoutExercise): MovementPrescription {
  const name = normalize(exercise.name)
  if (name.includes('kick-up') || name.includes('kick up')) {
    return {
      kind: 'handstand',
      progressWhen: 'Reach 5/10, then 7/10 clean entries across two sessions',
      nextUnlock: 'Controlled freestanding holds and press-negative preparation',
    }
  }
  if (name.includes('hold') || name.includes('l-sit') || name.includes('planche')) {
    const planche = name.includes('open tuck')
    return {
      kind: 'hold',
      progressWhen: planche
        ? '3+ clean sets at 10s across two relevant sessions'
        : 'Complete every working set cleanly without increased discomfort',
      nextUnlock: planche ? 'Advanced tuck for 3–5 clean seconds' : 'Longer lever or harder variation',
    }
  }
  const weighted = /bench|weighted|dumbbell|cable|machine/.test(name)
  return {
    kind: weighted ? 'weighted' : 'reps',
    progressWhen: 'All working sets reach the top of the rep range with clean form',
    nextUnlock: weighted ? 'Add the smallest load increment and reset reps' : 'Harder variation or added load',
  }
}

function previousFor(
  exercise: WorkoutExercise,
  updates: ProgressionUpdate[],
): ProgressionUpdate[] {
  return updates
    .filter((update) => update.exerciseId === exercise.id || update.exerciseName === exercise.name)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function createProgressionUpdate(
  exercise: WorkoutExercise,
  date: string,
  completion: SessionCompletion,
  updates: ProgressionUpdate[],
): ProgressionUpdate | null {
  if (!exercise.done && !exercise.actualResult.trim() && exercise.sets.every((set) => !set.result.trim())) {
    return null
  }

  const prescription = movementPrescription(exercise)
  const values = resultNumbers(exercise)
  const form = quality(completion, exercise)
  const pain = discomfort(completion, exercise)
  const previous = previousFor(exercise, updates)

  if (prescription.kind === 'handstand') {
    const attempts = values[0] ?? 10
    const successes = values[1] ?? Math.round(attempts * 0.3)
    const bestHold = values[2] ?? 0
    const priorResults: HandstandResult[] = previous.map((item) => ({
      date: item.date,
      attempts: item.attempts ?? 10,
      successfulEntries: item.successfulEntries ?? 0,
      bestHoldSeconds: item.values[2] ?? 0,
      form: item.form,
      discomfort: item.discomfort,
    }))
    const decision = evaluateHandstandProgression(
      {
        attempts: 10,
        targetSuccessRate: 0.5,
        unlockSuccessRate: 0.7,
        targetHoldSeconds: 20,
        unlockSessions: 2,
        minimumWeeklyExposures: 1,
      },
      { date, attempts, successfulEntries: successes, bestHoldSeconds: bestHold, form, discomfort: pain },
      priorResults,
    )
    return {
      id: `${date}:${exercise.id}`,
      date,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      status: decision.status,
      lastResult: `${successes}/${attempts}${bestHold ? ` · ${bestHold}s best` : ''}`,
      nextTarget: `${decision.nextTarget.successfulEntries}/${decision.nextTarget.attempts} entries · ${decision.nextTarget.focus} focus`,
      reason: decision.reason,
      nextVariation: decision.nextVariation,
      kind: 'handstand',
      values: [attempts, successes, bestHold],
      attempts,
      successfulEntries: successes,
      form,
      discomfort: pain,
    }
  }

  if (prescription.kind === 'hold') {
    const shape = targetShape(exercise.target)
    const planche = normalize(exercise.name).includes('open tuck')
    const targetSeconds = previous[previous.length - 1]
      ? numbers(previous[previous.length - 1].nextTarget)[0] ?? (planche ? 8 : shape.maximum)
      : planche
        ? 8
        : shape.maximum
    const holds = values.length ? values : exercise.sets.filter((set) => set.done).map(() => targetSeconds)
    const priorResults: HoldResult[] = previous.map((item) => ({
      date: item.date,
      holdsSeconds: item.values,
      form: item.form,
      discomfort: item.discomfort,
    }))
    const decision = evaluateHoldProgression(
      {
        variation: exercise.name,
        nextVariation: planche ? 'Advanced tuck planche' : prescription.nextUnlock,
        targetSets: Math.min(3, Math.max(1, shape.sets)),
        targetSeconds,
        incrementSeconds: planche ? 1 : 2,
        unlockSeconds: planche ? 10 : Math.max(targetSeconds + 4, shape.maximum),
        unlockSessions: 2,
        minimumWeeklyExposures: 1,
      },
      { date, holdsSeconds: holds, form, discomfort: pain },
      priorResults,
    )
    return {
      id: `${date}:${exercise.id}`,
      date,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      status: decision.status,
      lastResult: holds.length ? `${holds.join(', ')}s` : exercise.actualResult || 'Completed',
      nextTarget: `${decision.nextTarget.sets} × ${decision.nextTarget.seconds}s`,
      reason: decision.reason,
      nextVariation: decision.nextVariation,
      kind: 'hold',
      values: holds,
      form,
      discomfort: pain,
    }
  }

  const shape = targetShape(exercise.target)
  let load: number | undefined
  let reps = values
  const weightedMatch = exercise.actualResult.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(.+)/i)
  if (prescription.kind === 'weighted' && weightedMatch) {
    load = Number(weightedMatch[1])
    reps = numbers(weightedMatch[2])
  }
  if (!reps.length) reps = exercise.sets.filter((set) => set.done).map(() => shape.minimum)
  const priorResults: RepResult[] = previous.map((item) => ({
    date: item.date,
    reps: item.values,
    load: item.load,
    form: item.form,
    discomfort: item.discomfort,
  }))
  const decision = evaluateRepProgression(
    {
      variation: exercise.name,
      sets: shape.sets,
      minimumReps: Math.max(1, shape.minimum - (shape.minimum === shape.maximum ? 2 : 0)),
      maximumReps: shape.maximum,
      load,
      loadIncrement: load == null ? undefined : 5,
      minimumWeeklyExposures: 1,
    },
    { date, reps, load, form, discomfort: pain },
    priorResults,
  )
  return {
    id: `${date}:${exercise.id}`,
    date,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    status: decision.status,
    lastResult: load == null ? reps.join(', ') : `${load} × ${reps.join(', ')}`,
    nextTarget:
      decision.nextTarget.load == null
        ? `${decision.nextTarget.sets} × ${decision.nextTarget.reps}`
        : `${decision.nextTarget.load} × ${decision.nextTarget.reps}`,
    reason: decision.reason,
    nextVariation: decision.nextVariation,
    kind: prescription.kind,
    values: reps,
    load,
    form,
    discomfort: pain,
  }
}
