'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from './database.types'
import type { TrainingState } from '@/lib/training-state'
import { initialTrainingState } from '@/lib/training-state'

const json = (value: unknown) => value as Json
const value = <T>(input: Json | null) => input as T

export async function loadTrainingState(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<TrainingState | null> {
  const [profile, template, weeks, days, workouts, progression, flexibility, bodyweight, nutrition, guides] =
    await Promise.all([
      client.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      client.from('plan_templates').select('plan').eq('user_id', userId).maybeSingle(),
      client.from('week_plans').select('*').eq('user_id', userId),
      client.from('daily_plans').select('*').eq('user_id', userId),
      client.from('workouts').select('*').eq('user_id', userId),
      client.from('progression_events').select('*').eq('user_id', userId),
      client.from('flexibility_sessions').select('*').eq('user_id', userId),
      client.from('bodyweight_logs').select('*').eq('user_id', userId),
      client.from('nutrition_checkins').select('*').eq('user_id', userId),
      client.from('guide_resources').select('*').eq('owner_id', userId),
    ])

  const firstError = [profile, template, weeks, days, workouts, progression, flexibility, bodyweight, nutrition, guides]
    .map((result) => result.error)
    .find(Boolean)
  if (firstError) throw firstError

  const hasRemoteData = Boolean(
    template.data ||
      weeks.data?.length ||
      days.data?.length ||
      workouts.data?.length ||
      progression.data?.length,
  )
  if (!hasRemoteData) return null

  const dailyPlans = Object.fromEntries(
    (days.data ?? []).map((row) => [
      row.plan_date,
      {
        date: row.plan_date,
        original: value<TrainingState['dailyPlans'][string]['original']>(row.original_plan),
        working: value<TrainingState['dailyPlans'][string]['working']>(row.modified_plan),
        modification: row.modification
          ? value<TrainingState['dailyPlans'][string]['modification']>(row.modification)
          : undefined,
      },
    ]),
  ) as TrainingState['dailyPlans']

  const completedWorkouts = (workouts.data ?? []).map((row) => ({
    id: row.id,
    date: row.workout_date,
    workout: value<TrainingState['completedWorkouts'][number]['workout']>(row.actual_workout),
    completion: value<TrainingState['completedWorkouts'][number]['completion']>(row.completion),
    progressionUpdates: (progression.data ?? [])
      .filter((event) => event.event_date === row.workout_date)
      .map((event) => value<TrainingState['progressionUpdates'][number]>(event.payload)),
  }))

  completedWorkouts.forEach((record) => {
    const daily = dailyPlans[record.date]
    if (daily) {
      daily.actual = record.workout
      daily.completion = record.completion
    }
  })

  return {
    ...initialTrainingState,
    profile: profile.data?.profile
      ? value<TrainingState['profile']>(profile.data.profile)
      : initialTrainingState.profile,
    preferences: profile.data?.preferences
      ? value<TrainingState['preferences']>(profile.data.preferences)
      : initialTrainingState.preferences,
    equipment: profile.data?.equipment
      ? value<TrainingState['equipment']>(profile.data.equipment)
      : initialTrainingState.equipment,
    injuries: profile.data?.injury_context
      ? value<TrainingState['injuries']>(profile.data.injury_context)
      : initialTrainingState.injuries,
    recurringPlan: template.data
      ? value<TrainingState['recurringPlan']>(template.data.plan)
      : initialTrainingState.recurringPlan,
    weekOverrides: Object.fromEntries(
      (weeks.data ?? []).map((row) => [
        row.week_start,
        {
          weekStart: row.week_start,
          plan: value<TrainingState['recurringPlan']>(row.plan),
          changedAt: row.updated_at,
        },
      ]),
    ),
    dailyPlans,
    completedWorkouts,
    progressionUpdates: (progression.data ?? []).map((row) =>
      value<TrainingState['progressionUpdates'][number]>(row.payload),
    ),
    flexibilitySessions: (flexibility.data ?? []).map((row) =>
      value<TrainingState['flexibilitySessions'][number]>(row.payload),
    ),
    bodyweight: (bodyweight.data ?? []).map((row) => ({
      id: row.id,
      date: row.log_date,
      weightLb: Number(row.weight_lb),
    })),
    nutritionCheckins: (nutrition.data ?? []).map((row) =>
      value<TrainingState['nutritionCheckins'][number]>(row.payload),
    ),
    resources: guides.data?.length
      ? guides.data.map((row) => value<TrainingState['resources'][number]>(row.resource))
      : initialTrainingState.resources,
  }
}

export async function saveTrainingState(
  client: SupabaseClient<Database>,
  userId: string,
  state: TrainingState,
) {
  const writes = [
    client.from('profiles').upsert({
      user_id: userId,
      display_name: state.profile.name,
      profile: json(state.profile),
      preferences: json(state.preferences),
      equipment: json(state.equipment),
      injury_context: json(state.injuries),
    }),
    client
      .from('plan_templates')
      .upsert({ user_id: userId, plan: json(state.recurringPlan) }, { onConflict: 'user_id' }),
    ...Object.values(state.weekOverrides).map((week) =>
      client.from('week_plans').upsert(
        { user_id: userId, week_start: week.weekStart, plan: json(week.plan) },
        { onConflict: 'user_id,week_start' },
      ),
    ),
    ...Object.values(state.dailyPlans).map((day) =>
      client.from('daily_plans').upsert(
        {
          user_id: userId,
          plan_date: day.date,
          original_plan: json(day.original),
          modified_plan: json(day.working),
          modification: day.modification ? json(day.modification) : null,
        },
        { onConflict: 'user_id,plan_date' },
      ),
    ),
    ...state.completedWorkouts.map((workout) => {
      const day = state.dailyPlans[workout.date]
      return client.from('workouts').upsert(
        {
          user_id: userId,
          workout_date: workout.date,
          original_plan: json(day?.original ?? workout.workout),
          modified_plan: json(day?.working ?? workout.workout),
          actual_workout: json(workout.workout),
          completion: json(workout.completion),
        },
        { onConflict: 'user_id,workout_date' },
      )
    }),
    ...state.progressionUpdates.map((update) =>
      client.from('progression_events').upsert({
        id: update.id,
        user_id: userId,
        event_date: update.date,
        exercise_id: update.exerciseId,
        payload: json(update),
      }),
    ),
    ...state.flexibilitySessions.map((session) =>
      client.from('flexibility_sessions').upsert({
        id: session.id,
        user_id: userId,
        session_date: session.date,
        payload: json(session),
      }),
    ),
    ...state.bodyweight.map((entry) =>
      client.from('bodyweight_logs').upsert(
        {
          id: entry.id,
          user_id: userId,
          log_date: entry.date,
          weight_lb: entry.weightLb,
        },
        { onConflict: 'user_id,log_date' },
      ),
    ),
    ...state.nutritionCheckins.map((entry) =>
      client.from('nutrition_checkins').upsert(
        {
          id: entry.id,
          user_id: userId,
          checkin_date: entry.date,
          payload: json(entry),
        },
        { onConflict: 'user_id,checkin_date' },
      ),
    ),
    ...state.resources.map((resource) =>
      client.from('guide_resources').upsert({
        id: resource.id,
        owner_id: userId,
        resource: json(resource),
      }),
    ),
  ]
  const results = await Promise.all(writes)
  const error = results.map((result) => result.error).find(Boolean)
  if (error) throw error
}
