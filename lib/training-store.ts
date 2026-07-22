'use client'

import type { BodyweightLog, Equipment, GuideResource, InjuryHistory, NutritionCheckin, PlanDay, PlanModification, Profile, SessionCompletion, UserPreferences, Workout, WorkoutVersion } from './types'
import type { BodyNoteRecord, FlexibilitySessionRecord, MilestoneRecord, ProgressionUpdate, TrainingState } from './training-state'
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
    resources: (value.resources ?? initialTrainingState.resources).map((resource) =>
      resource.url.includes('example.com')
        ? { ...resource, url: '', source: 'Daniel Training OS' }
        : resource,
    ),
    activeSkillIds: value.activeSkillIds ?? initialTrainingState.activeSkillIds,
    recurringPlan: value.recurringPlan?.length ? value.recurringPlan : initialTrainingState.recurringPlan,
    weekOverrides: value.weekOverrides ?? {},
    dailyPlans: Object.fromEntries(
      Object.entries(value.dailyPlans ?? {}).map(([date, record]) => [
        date,
        { ...record, version: record.version ?? 'standard' },
      ]),
    ),
    completedWorkouts: value.completedWorkouts ?? [],
    progressionUpdates: value.progressionUpdates ?? [],
    milestones: value.milestones ?? [],
    flexibilitySessions: value.flexibilitySessions ?? [],
    bodyweight: value.bodyweight?.length ? value.bodyweight : initialTrainingState.bodyweight,
    bodyNotes: value.bodyNotes ?? [],
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
          version: existing?.version ?? 'standard',
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
          version: existing?.version ?? 'standard',
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
        [date]: { date, original: existing.original, working: existing.original, version: 'standard' },
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
          version: existing?.version ?? 'standard',
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
  setDailyVersion(date: string, original: Workout, working: Workout, version: WorkoutVersion) {
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
          version,
        },
      },
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
  activateSkill(skillId: string) {
    if (snapshot.activeSkillIds.includes(skillId)) return
    persist({ ...snapshot, activeSkillIds: [...snapshot.activeSkillIds, skillId] })
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
  clearWeekOverride(weekStart: string) {
    const next = { ...snapshot.weekOverrides }
    delete next[weekStart]
    persist({ ...snapshot, weekOverrides: next })
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
  saveMilestone(milestone: MilestoneRecord) {
    persist({
      ...snapshot,
      milestones: [milestone, ...snapshot.milestones.filter((item) => item.id !== milestone.id)],
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
  saveBodyNote(entry: BodyNoteRecord) {
    persist({
      ...snapshot,
      bodyNotes: [entry, ...snapshot.bodyNotes.filter((item) => item.id !== entry.id)],
    })
  },
  saveNutritionCheckin(entry: NutritionCheckin) {
    persist({
      ...snapshot,
      nutritionCheckins: [entry, ...snapshot.nutritionCheckins.filter((item) => item.id !== entry.id)],
    })
  },
}
