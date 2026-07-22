import type {
  BodyweightLog,
  NutritionCheckin,
  Equipment,
  InjuryHistory,
  GuideResource,
  PlanDay,
  PlanModification,
  SessionCompletion,
  Profile,
  UserPreferences,
  Workout,
} from './types'
import type { ProgressionStatus } from './progression'
import { bodyweightLogs, equipment, injuries, preferences, profile, resources, weekPlan } from './seed-data'

export interface ProgressionUpdate {
  id: string
  date: string
  exerciseId: string
  exerciseName: string
  status: ProgressionStatus
  lastResult: string
  nextTarget: string
  reason: string
  nextVariation?: string
  kind: 'hold' | 'reps' | 'weighted' | 'handstand'
  values: number[]
  load?: number
  attempts?: number
  successfulEntries?: number
  form: 'clean' | 'mixed' | 'poor'
  discomfort: 'none' | 'mild' | 'notable'
}

export interface DailyPlanRecord {
  date: string
  original: Workout
  working: Workout
  modification?: PlanModification
  actual?: Workout
  completion?: SessionCompletion
}

export interface WeekOverrideRecord {
  weekStart: string
  plan: PlanDay[]
  changedAt: string
}

export interface FlexibilitySessionRecord {
  id: string
  date: string
  routine: string
  durationMinutes: number
  milestone?: string
  note?: string
}

export interface TrainingState {
  schemaVersion: 1
  profile: Profile
  preferences: UserPreferences
  equipment: Equipment[]
  injuries: InjuryHistory[]
  resources: GuideResource[]
  recurringPlan: PlanDay[]
  weekOverrides: Record<string, WeekOverrideRecord>
  dailyPlans: Record<string, DailyPlanRecord>
  completedWorkouts: Array<{
    id: string
    date: string
    workout: Workout
    completion: SessionCompletion
    progressionUpdates: ProgressionUpdate[]
  }>
  progressionUpdates: ProgressionUpdate[]
  flexibilitySessions: FlexibilitySessionRecord[]
  bodyweight: BodyweightLog[]
  nutritionCheckins: NutritionCheckin[]
}

export const initialTrainingState: TrainingState = {
  schemaVersion: 1,
  profile,
  preferences,
  equipment,
  injuries,
  resources,
  recurringPlan: weekPlan,
  weekOverrides: {},
  dailyPlans: {},
  completedWorkouts: [],
  progressionUpdates: [],
  flexibilitySessions: [],
  bodyweight: bodyweightLogs,
  nutritionCheckins: [],
}
