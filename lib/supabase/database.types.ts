export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

type OwnedPayloadRow = {
  id: string
  user_id: string
  payload: Json
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: Table<{
        user_id: string
        display_name: string
        profile: Json
        preferences: Json
        equipment: Json
        injury_context: Json
        created_at: string
        updated_at: string
      }>
      plan_templates: Table<
        { user_id: string; plan: Json; updated_at: string },
        { user_id: string; plan: Json; updated_at?: string }
      >
      week_plans: Table<
        {
          id: string
          user_id: string
          week_start: string
          plan: Json
          change_note: string | null
          created_at: string
          updated_at: string
        },
        {
          id?: string
          user_id: string
          week_start: string
          plan: Json
          change_note?: string | null
        }
      >
      daily_plans: Table<
        {
          id: string
          user_id: string
          plan_date: string
          original_plan: Json
          modified_plan: Json
          modification: Json | null
          version: string
          created_at: string
          updated_at: string
        },
        {
          id?: string
          user_id: string
          plan_date: string
          original_plan: Json
          modified_plan: Json
          modification?: Json | null
          version?: string
        }
      >
      workouts: Table<
        {
          id: string
          user_id: string
          workout_date: string
          original_plan: Json
          modified_plan: Json
          actual_workout: Json
          completion: Json
          created_at: string
          updated_at: string
        },
        {
          id?: string
          user_id: string
          workout_date: string
          original_plan: Json
          modified_plan: Json
          actual_workout: Json
          completion: Json
        }
      >
      progression_events: Table<OwnedPayloadRow & { event_date: string; exercise_id: string }>
      skill_milestones: Table<{
        id: string
        user_id: string
        milestone_date: string
        note: string
        created_at: string
      }>
      flexibility_sessions: Table<OwnedPayloadRow & { session_date: string }>
      bodyweight_logs: Table<{
        id: string
        user_id: string
        log_date: string
        weight_lb: number
        created_at: string
      }>
      body_notes: Table<{
        id: string
        user_id: string
        note_month: string
        note: string
        created_at: string
      }>
      nutrition_checkins: Table<OwnedPayloadRow & { checkin_date: string }>
      exercise_definitions: Table<{
        slug: string
        owner_id: string | null
        definition: Json
        updated_at: string
      }>
      guide_resources: Table<{
        id: string
        owner_id: string | null
        resource: Json
        updated_at: string
      }>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
