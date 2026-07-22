import { describe, expect, it } from 'vitest'
import { applyModificationToPlan, applyModificationToWorkout, workoutFromPlan } from './planning'
import { weekPlan } from './seed-data'

describe('planning records', () => {
  it('builds the correct Monday-first workout for a date', () => {
    const monday = workoutFromPlan(weekPlan, new Date('2026-07-20T12:00:00'))
    const tuesday = workoutFromPlan(weekPlan, new Date('2026-07-21T12:00:00'))
    expect(monday.title).toContain('Handstand')
    expect(tuesday.title).toContain('Planche')
  })

  it('keeps the original workout while deriving a date-specific no-pool plan', () => {
    const original = workoutFromPlan(weekPlan, new Date('2026-07-21T12:00:00'))
    const modification = {
      reason: 'no_pool' as const,
      strategy: 'replace_unavailable' as const,
      scope: 'today' as const,
      note: '',
      changes: original.exercises
        .filter((exercise) => exercise.section === 'swim')
        .map((exercise) => ({
          original: exercise.name,
          updated: '',
          removed: true,
          reason: 'Pool unavailable.',
        })),
    }
    const modified = applyModificationToWorkout(original, modification)
    expect(original.exercises.some((exercise) => exercise.section === 'swim')).toBe(true)
    expect(modified.exercises.some((exercise) => exercise.section === 'swim')).toBe(false)
  })

  it('applies a recurring modification only to matching weekdays', () => {
    const changed = applyModificationToPlan(weekPlan, 1, {
      reason: 'no_pool',
      strategy: 'replace_unavailable',
      scope: 'recurring',
      note: '',
      changes: [
        {
          original: 'Swim lesson',
          updated: '',
          removed: true,
          reason: 'No recurring pool access.',
        },
      ],
    })
    expect(changed.find((day) => day.weekday === 1)?.swimStatus).toBe('none')
    expect(changed.find((day) => day.weekday === 3)?.swimStatus).toBe('lesson')
  })
})
