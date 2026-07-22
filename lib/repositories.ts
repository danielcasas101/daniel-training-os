// Repository interfaces. These define the data-access contract so a Supabase
// (or other) implementation can be dropped in later without changing UI code.
// For the first version, see ./repositories.mock.ts.

import type {
  BodyweightLog,
  CoachConversation,
  Equipment,
  GuideResource,
  InjuryHistory,
  MobilityItem,
  NutritionCheckin,
  PlanDay,
  Profile,
  ProposedPlanChange,
  ReadinessLog,
  SkillDefinition,
  SkillTest,
  SwimLog,
  TrainingBlock,
  UserPreferences,
  UserSkillState,
  Workout,
} from './types'

export interface ProfileRepository {
  getProfile(): Promise<Profile>
  getPreferences(): Promise<UserPreferences>
  getEquipment(): Promise<Equipment[]>
  getInjuries(): Promise<InjuryHistory[]>
}

export interface PlanRepository {
  getCurrentBlock(): Promise<TrainingBlock>
  getWeekPlan(): Promise<PlanDay[]>
  updatePlanDay(day: PlanDay): Promise<PlanDay>
}

export interface WorkoutRepository {
  getToday(): Promise<Workout>
  saveWorkout(workout: Workout): Promise<Workout>
}

export interface SkillRepository {
  getSkills(): Promise<SkillDefinition[]>
  getSkillStates(): Promise<UserSkillState[]>
  getSkillTests(): Promise<SkillTest[]>
}

export interface LogRepository {
  getReadiness(): Promise<ReadinessLog[]>
  getSwimLogs(): Promise<SwimLog[]>
  getBodyweight(): Promise<BodyweightLog[]>
  getNutritionCheckins(): Promise<NutritionCheckin[]>
  getMobilityItems(): Promise<MobilityItem[]>
}

export interface LibraryRepository {
  getResources(): Promise<GuideResource[]>
}

export interface CoachRepository {
  getConversation(): Promise<CoachConversation>
  // Later: streamed via OpenAI. For now, returns a structured mock review.
  proposeChanges(prompt: string): Promise<ProposedPlanChange[]>
}
