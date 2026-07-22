// Repository interfaces. These define the data-access contract so a Supabase
// (or other) implementation can be dropped in later without changing UI code.
// The working local repository is implemented by training-store.ts; the protected
// remote implementation lives in supabase/training-repository.ts.

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
  // A future AI implementation must return proposals that require explicit approval.
  proposeChanges(prompt: string): Promise<ProposedPlanChange[]>
}
