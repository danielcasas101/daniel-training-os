// Core domain types for Daniel Training OS.
// These mirror the planned Supabase tables so repository implementations can
// swap mock data for real persistence without touching UI components.

export type ID = string

export type Intensity = 'light' | 'moderate' | 'hard'
export type SkillPriority = 'primary' | 'secondary' | 'optional'
export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5
export type WorkoutVersion = 'standard' | 'short' | 'light'

export type PlanMode =
  | 'summer'
  | 'school'
  | 'finals'
  | 'travel'
  | 'skill_emphasis'
  | 'size_emphasis'
  | 'recovery'

export type NutritionMode =
  | 'performance_maintenance'
  | 'slow_gain'
  | 'maintenance'
  | 'mini_cut'

export interface Profile {
  id: ID
  name: string
  context: string
  bodyweightLb: number
  timezone: string
}

export interface UserPreferences {
  id: ID
  activeMode: PlanMode
  nutritionMode: NutritionMode
  advancedMacros: boolean
  units: 'imperial' | 'metric'
}

export interface Equipment {
  id: ID
  name: string
  available: boolean
  location: 'gym' | 'home' | 'outdoor' | 'pool'
}

export interface InjuryHistory {
  id: ID
  area: string
  status: 'historical' | 'monitoring' | 'active'
  notes: string
}

export interface TrainingBlock {
  id: ID
  name: string
  focus: string
  startDate: string
  endDate: string
  weekIndex: number
  totalWeeks: number
}

export interface PlannedExercise {
  id: ID
  name: string
  target: string
  cue?: string
  section: WorkoutSection
}

export type WorkoutSection =
  | 'warmup'
  | 'primary'
  | 'secondary'
  | 'strength'
  | 'flexibility'
  | 'swim'

export interface PlanDay {
  id: ID
  weekday: number // 0 = Mon ... 6 = Sun
  title: string
  primaryFocus: string
  estimatedMinutes: number
  intensity: Intensity
  swimStatus: 'none' | 'lesson' | 'optional' | 'easy'
  flexibilityEmphasis: string
  exercises: PlannedExercise[]
  versions: WorkoutVersion[]
  isRest?: boolean
}

export interface ExerciseSet {
  id: ID
  setNumber: number
  target: string
  result: string
  rpe?: number
  done: boolean
}

export interface WorkoutExercise {
  id: ID
  name: string
  section: WorkoutSection
  target: string
  previousResult: string
  actualResult: string
  cue?: string
  notes?: string
  rpe?: number
  formQuality?: 'clean' | 'mixed' | 'poor'
  discomfort?: 'none' | 'mild' | 'notable'
  done: boolean
  sets: ExerciseSet[]
}

export interface Workout {
  id: ID
  date: string
  title: string
  blockId: ID
  focus: string
  estimatedMinutes: number
  intensity: Intensity
  exercises: WorkoutExercise[]
  status: 'planned' | 'in_progress' | 'completed'
  notes?: string
}

export interface SkillStage {
  id: ID
  name: string
  order: number
  description: string
  exercises: string[]
  commonFaults: string[]
  timelineRange: string
}

export interface SkillDefinition {
  id: ID
  name: string
  priority: SkillPriority
  active: boolean
  category: string
  prerequisites: string[]
  supportingQualities: string[]
  recommendedFrequency: string
  currentWeeklyFrequency: number
  stages: SkillStage[]
  equipment: string[]
  interference?: string
  guideUrl?: string
}

export interface UserSkillState {
  skillId: ID
  currentStageId: ID
  bestResult: string
  nextMilestone: string
  history: { date: string; note: string }[]
}

export interface SkillTest {
  id: ID
  skillId: ID
  date: string
  variation: string
  metric: string
  value: number
  formScore?: number
  surface?: 'floor' | 'parallettes' | 'wall' | 'pool'
  pain?: PainLevel
  type: 'practice' | 'best_set' | 'monthly_test'
}

export interface ReadinessLog {
  id: ID
  date: string
  energy: number
  sleep: number
  wrist: PainLevel
  forearm: PainLevel
  elbow: PainLevel
  shoulder: PainLevel
}

export interface PainLog {
  id: ID
  date: string
  area: string
  level: PainLevel
  note?: string
}

export interface SwimLog {
  id: ID
  date: string
  type: 'lesson' | 'endurance' | 'technique' | 'easy'
  durationMin: number
  notes?: string
}

export interface MobilityItem {
  id: ID
  area: string
  name: string
  duration: string
  sets: string
  cue: string
  purpose: string
  contraindication?: string
  progression: string
}

export interface MobilityLog {
  id: ID
  date: string
  routine: string
  area: string
}

export interface BodyweightLog {
  id: ID
  date: string
  weightLb: number
}

export interface NutritionCheckin {
  id: ID
  date: string
  bodyweightLb?: number
  protein: 'low' | 'adequate' | 'high'
  meals: number
  hunger: number
  energy: number
  hydration: number
  notes?: string
}

// Lightweight daily diet check-in (default experience).
export interface SimpleDietCheckin {
  id: ID
  date: string
  protein: 'low' | 'okay' | 'good'
  ateEnough: 'yes' | 'unsure' | 'no'
  hydration: 'low' | 'okay' | 'good'
  bodyweightLb?: number
  note?: string
}

export interface GuideResource {
  id: ID
  title: string
  skill: string
  stage: string
  contentType: 'video' | 'article' | 'program' | 'drill'
  source: string
  url: string
  summary: string
  relevance: string
  saved: boolean
  completed: boolean
  notes?: string
  bodyArea?: string
  equipment?: string
  durationMin?: number
}

export interface CoachMessage {
  id: ID
  role: 'user' | 'coach'
  content: string
  createdAt: string
  review?: CoachReview
}

export interface CoachReview {
  noticed: string[]
  keep: string[]
  change: string[]
  warnings: string[]
  nextFocus: string[]
  proposedEdits: ProposedPlanChange[]
  dataUsed: string[]
}

export interface ProposedPlanChange {
  id: ID
  summary: string
  detail: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface CoachConversation {
  id: ID
  title: string
  messages: CoachMessage[]
}

// --- Exercise / drill instructions (shared detail sheet) ---

export interface ExerciseInstruction {
  // Matched by exercise/drill name (case-insensitive) or explicit key.
  key: string
  title: string
  summary: string
  setup: string
  howTo: string[]
  cues: string[]
  commonMistake: string
  easier: string
  harder: string
  feelsLike: string
  discomfortWarning?: string
  whyInPlan: string
  guideUrl?: string
}

// --- Lightweight daily completion ---

export type SessionOutcome = 'great' | 'fine' | 'rough' | 'skipped'
export type DiscomfortArea =
  | 'none'
  | 'forearm'
  | 'wrist'
  | 'elbow'
  | 'shoulder'
  | 'other'

export interface SessionCompletion {
  outcome: SessionOutcome
  discomfort: DiscomfortArea
  note?: string
}

// --- Daily plan modifications (date-scoped, non-destructive) ---

export type ModificationReason =
  | 'no_pool'
  | 'no_gym'
  | 'no_equipment'
  | 'less_time'
  | 'travel'
  | 'fatigue'
  | 'discomfort'
  | 'schedule'
  | 'custom'

export type ModificationStrategy =
  | 'keep_focus'
  | 'shorter'
  | 'replace_unavailable'
  | 'easier'
  | 'manual'

export type ModificationScope =
  | 'today'
  | 'this_week'
  | 'recurring'

export interface PlanItemChange {
  original: string
  updated: string
  reason: string
  removed?: boolean
}

export interface PlanModification {
  reason: ModificationReason
  strategy: ModificationStrategy
  scope: ModificationScope
  changes: PlanItemChange[]
  note: string
}
