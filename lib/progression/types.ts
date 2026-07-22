export type FormQuality = 'clean' | 'mixed' | 'poor'
export type DiscomfortLevel = 'none' | 'mild' | 'notable'

export type ProgressionStatus =
  | 'improving'
  | 'stable'
  | 'stalled'
  | 'insufficient_exposure'
  | 'ready_to_progress'
  | 'limited_by_discomfort'

export interface ProgressionDecision<TTarget> {
  status: ProgressionStatus
  nextTarget: TTarget
  reason: string
  nextVariation?: string
  progressionSuggested: boolean
}

export interface DatedResult {
  date: string
  form: FormQuality
  discomfort: DiscomfortLevel
}

export interface HoldTarget {
  variation: string
  sets: number
  seconds: number
}

export interface HoldResult extends DatedResult {
  holdsSeconds: number[]
}

export interface HoldProgressionConfig {
  variation: string
  nextVariation: string
  targetSets: number
  targetSeconds: number
  incrementSeconds: number
  unlockSeconds: number
  unlockSessions: number
  minimumWeeklyExposures: number
}

export interface RepTarget {
  variation: string
  sets: number
  reps: number
  load?: number
}

export interface RepResult extends DatedResult {
  reps: number[]
  load?: number
}

export interface RepProgressionConfig {
  variation: string
  sets: number
  minimumReps: number
  maximumReps: number
  load?: number
  loadIncrement?: number
  minimumWeeklyExposures: number
}

export interface HandstandTarget {
  attempts: number
  successfulEntries: number
  holdSeconds: number
  focus: 'entries' | 'line' | 'hold'
}

export interface HandstandResult extends DatedResult {
  attempts: number
  successfulEntries: number
  bestHoldSeconds: number
  lineQuality?: FormQuality
}

export interface HandstandProgressionConfig {
  attempts: number
  targetSuccessRate: number
  unlockSuccessRate: number
  targetHoldSeconds: number
  unlockSessions: number
  minimumWeeklyExposures: number
}

export interface FlexibilityTarget {
  routine: string
  durationMinutes: number
  focus: string
}

export interface FlexibilityResult extends DatedResult {
  completed: boolean
  durationMinutes: number
  milestone?: string
}
