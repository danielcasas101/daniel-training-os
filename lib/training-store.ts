'use client'

import type { BodyweightLog, Equipment, GuideResource, InjuryHistory, NutritionCheckin, PlanDay, PlanModification, Profile, SessionCompletion, UserPreferences, Workout } from './types'
import type { FlexibilitySessionRecord, ProgressionUpdate, TrainingState } from './training-state'
import { initialTrainingState } from './training-state'

const STORAGE_KEY = 'daniel-training-os:v1'
let snapshot: TrainingState = initialTrainingState
let initialized = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function persist(next: TrainingState) {
  snapshot = next
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  emit()
}

function mergeStored(value: Partial<TrainingState>): TrainingState {
  return {
    ...initialTrainingState,
    ...value,
    profile: value.profile ?? initialTrainingState.profile,
    preferences: value.preferences ?? initialTrainingState.preferences,
    equipment: value.equipment ?? initialTrainingState.equipment,
    injuries: value.injuries ?? initialTrainingState.injuries,
    resources: value.resources ?? initialTrainingState.resources,
    recurringPlan: value.recurringPlan?.length ? value.recurringPlan : initialTrainingState.recurringPlan,
    weekOverrides: value.weekOverrides ?? {},
    dailyPlans: value.dailyPlans ?? {},
    completedWorkouts: value.completedWorkouts ?? [],
    progressionUpdates: value.progressionUpdates ?? [],
    flexibilitySessions: value.flexibilitySessions ?? [],
    bodyweight: value.bodyweight?.length ? value.bodyweight : initialTrainingState.bodyweight,
    nutritionCheckins: value.nutritionCheckins ?? [],
  }
}

export const trainingStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => snapshot,
  getServerSnapshot: () => initialTrainingState,
  initialize() {
    if (initialized || typeof window === 'undefined') return
    initialized = true
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      snapshot = raw ? mergeStored(JSON.parse(raw) as Partial<TrainingState>) : initialTrainingState
    } catch {
      snapshot = initialTrainingState
    }
    emit()
  },
  replaceState(next: TrainingState) {
    persist(mergeStored(next))
  },
  updateWorkingWorkout(date: string, original: Workout, working: Workout) {
    const existing = snapshot.dailyPlans[date]
    persist({
      ...snapshot,
      dailyPlans: {
        ...snapshot.dailyPlans,
        [date]: {
          date,
          original: existing?.original ?? original,
          working,
          modification: existing?.modification,
          actual: existing?.actual,
          completion: existing?.completion,
        },
      },
    })
  },
  saveModification(date: string, original: Workout, working: Workout, modification: PlanModification) {
    const existing = snapshot.dailyPlans[date]
    persist({
      ...snapshot,
      dailyPlans: {
        ...snapshot.dailyPlans,
        [date]: {
          date,
          original: existing?.original ?? original,
          working,
          modification,
          actual: existing?.actual,
          completion: existing?.completion,
        },
      },
    })
  },
  revertDailyPlan(date: string) {
    const existing = snapshot.dailyPlans[date]
    if (!existing) return
    persist({
      ...snapshot,
      dailyPlans: {
        ...snapshot.dailyPlans,
        [date]: { date, original: existing.original, working: existing.original },
      },
    })
  },
  completeWorkout(
    original: Workout,
    workout: Workout,
    completion: SessionCompletion,
    progressionUpdates: ProgressionUpdate[],
  ) {
    const actual = { ...workout, status: 'completed' as const }
    const existing = snapshot.dailyPlans[workout.date]
    const record = {
      id: `completed-${workout.date}`,
      date: workout.date,
      workout: actual,
      completion,
      progressionUpdates,
    }
    persist({
      ...snapshot,
      dailyPlans: {
        ...snapshot.dailyPlans,
        [workout.date]: {
          date: workout.date,
          original: existing?.original ?? original,
          working: actual,
          modification: existing?.modification,
          actual,
          completion,
        },
      },
      completedWorkouts: [
        record,
        ...snapshot.completedWorkouts.filter((item) => item.date !== workout.date),
      ],
      progressionUpdates: [
        ...progressionUpdates,
        ...snapshot.progressionUpdates.filter(
          (item) => !progressionUpdates.some((update) => update.id === item.id),
        ),
      ],
    })
  },
  saveRecurringPlan(plan: PlanDay[]) {
    persist({ ...snapshot, recurringPlan: plan })
  },
  saveSettings(
    profile: Profile,
    preferences: UserPreferences,
    equipment: Equipment[],
    injuries: InjuryHistory[],
  ) {
    persist({ ...snapshot, profile, preferences, equipment, injuries })
  },
  saveResources(resources: GuideResource[]) {
    persist({ ...snapshot, resources })
  },
  saveWeekOverride(weekStart: string, plan: PlanDay[]) {
    persist({
      ...snapshot,
      weekOverrides: {
        ...snapshot.weekOverrides,
        [weekStart]: { weekStart, plan, changedAt: new Date().toISOString() },
      },
    })
  },
  saveFlexibilitySession(session: FlexibilitySessionRecord) {
    persist({
      ...snapshot,
      flexibilitySessions: [
        session,
        ...snapshot.flexibilitySessions.filter((item) => item.id !== session.id),
      ],
    })
  },
  saveBodyweight(entry: BodyweightLog) {
    persist({
      ...snapshot,
      bodyweight: [...snapshot.bodyweight.filter((item) => item.id !== entry.id), entry].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    })
  },
  saveNutritionCheckin(entry: NutritionCheckin) {
    persist({
      ...snapshot,
      nutritionCheckins: [entry, ...snapshot.nutritionCheckins.filter((item) => item.id !== entry.id)],
    })
  },
}
