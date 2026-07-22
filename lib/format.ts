import type { Intensity, PainLevel, PlanMode, NutritionMode } from './types'

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const WEEKDAYS_LONG = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export const SECTION_LABELS: Record<string, string> = {
  warmup: 'Warm-up',
  primary: 'Primary skill',
  secondary: 'Secondary skill',
  strength: 'Strength / Hypertrophy',
  flexibility: 'Flexibility / Mobility',
  swim: 'Swimming / Cardio',
}

export const PLAN_MODES: { value: PlanMode; label: string }[] = [
  { value: 'summer', label: 'Summer' },
  { value: 'school', label: 'School' },
  { value: 'finals', label: 'Finals' },
  { value: 'travel', label: 'Travel' },
  { value: 'skill_emphasis', label: 'Skill Emphasis' },
  { value: 'size_emphasis', label: 'Size Emphasis' },
  { value: 'recovery', label: 'Recovery / Pain' },
]

export const NUTRITION_MODES: { value: NutritionMode; label: string; desc: string }[] = [
  { value: 'performance_maintenance', label: 'Performance & Physique Maintenance', desc: 'Hold weight, support skill work and physique.' },
  { value: 'slow_gain', label: 'Slow Gain', desc: 'Gradual surplus to add size while keeping abs.' },
  { value: 'maintenance', label: 'Maintenance', desc: 'Stable weight, balanced intake.' },
  { value: 'mini_cut', label: 'Mini-Cut', desc: 'Short controlled deficit to sharpen abs.' },
]

export function intensityColor(intensity: Intensity): string {
  switch (intensity) {
    case 'hard':
      return 'text-destructive'
    case 'moderate':
      return 'text-warning'
    case 'light':
      return 'text-success'
  }
}

export function intensityBg(intensity: Intensity): string {
  switch (intensity) {
    case 'hard':
      return 'bg-destructive/15 text-destructive border-destructive/20'
    case 'moderate':
      return 'bg-warning/15 text-warning border-warning/20'
    case 'light':
      return 'bg-success/15 text-success border-success/20'
  }
}

export function painColor(level: PainLevel): string {
  if (level === 0) return 'text-success'
  if (level <= 2) return 'text-warning'
  return 'text-destructive'
}

export function painLabel(level: PainLevel): string {
  const labels = ['None', 'Trace', 'Mild', 'Moderate', 'High', 'Severe']
  return labels[level] ?? 'Unknown'
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''))
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function shortDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
