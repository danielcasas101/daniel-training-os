import { describe, expect, it } from 'vitest'
import {
  evaluateFlexibilityProgression,
  evaluateHandstandProgression,
  evaluateHoldProgression,
  evaluateRepProgression,
  recentExposureCount,
} from './engine'

const clean = { form: 'clean' as const, discomfort: 'none' as const }

describe('progression engine', () => {
  it('counts only recent relevant exposures', () => {
    const history = [
      { date: '2026-07-01', ...clean },
      { date: '2026-07-16', ...clean },
      { date: '2026-07-21', ...clean },
    ]
    expect(recentExposureCount(history, '2026-07-21')).toBe(2)
  })

  it('increments a clean hold target', () => {
    const decision = evaluateHoldProgression(
      {
        variation: 'Open tuck',
        nextVariation: 'Advanced tuck',
        targetSets: 3,
        targetSeconds: 8,
        incrementSeconds: 1,
        unlockSeconds: 10,
        unlockSessions: 2,
        minimumWeeklyExposures: 1,
      },
      { date: '2026-07-21', holdsSeconds: [8, 9, 8], ...clean },
    )
    expect(decision.status).toBe('improving')
    expect(decision.nextTarget.seconds).toBe(9)
  })

  it('requires repeatable hold sessions before unlocking', () => {
    const config = {
      variation: 'Open tuck',
      nextVariation: 'Advanced tuck',
      targetSets: 3,
      targetSeconds: 10,
      incrementSeconds: 1,
      unlockSeconds: 10,
      unlockSessions: 2,
      minimumWeeklyExposures: 2,
    }
    const previous = [{ date: '2026-07-18', holdsSeconds: [10, 10, 11], ...clean }]
    const decision = evaluateHoldProgression(
      config,
      { date: '2026-07-21', holdsSeconds: [10, 11, 10], ...clean },
      previous,
    )
    expect(decision.status).toBe('ready_to_progress')
    expect(decision.nextVariation).toBe('Advanced tuck')
  })

  it('does not progress through notable discomfort', () => {
    const decision = evaluateHoldProgression(
      {
        variation: 'Open tuck',
        nextVariation: 'Advanced tuck',
        targetSets: 3,
        targetSeconds: 10,
        incrementSeconds: 1,
        unlockSeconds: 10,
        unlockSessions: 2,
        minimumWeeklyExposures: 1,
      },
      {
        date: '2026-07-21',
        holdsSeconds: [12, 12, 12],
        form: 'clean',
        discomfort: 'notable',
      },
    )
    expect(decision.status).toBe('limited_by_discomfort')
    expect(decision.progressionSuggested).toBe(false)
  })

  it('adds weight only after every set reaches the top of the range', () => {
    const decision = evaluateRepProgression(
      {
        variation: 'Weighted pull-up',
        sets: 3,
        minimumReps: 6,
        maximumReps: 8,
        load: 55,
        loadIncrement: 5,
        minimumWeeklyExposures: 1,
      },
      { date: '2026-07-21', reps: [8, 8, 8], load: 55, ...clean },
    )
    expect(decision.status).toBe('ready_to_progress')
    expect(decision.nextTarget).toMatchObject({ load: 60, reps: 6 })
  })

  it('does not call one missed rep session a stall', () => {
    const decision = evaluateRepProgression(
      {
        variation: 'Weighted pull-up',
        sets: 3,
        minimumReps: 6,
        maximumReps: 8,
        load: 55,
        loadIncrement: 5,
        minimumWeeklyExposures: 1,
      },
      { date: '2026-07-21', reps: [6, 5, 5], load: 55, ...clean },
    )
    expect(decision.status).toBe('stable')
  })

  it('prioritizes handstand entries when holds are strong but success is weak', () => {
    const decision = evaluateHandstandProgression(
      {
        attempts: 10,
        targetSuccessRate: 0.5,
        unlockSuccessRate: 0.7,
        targetHoldSeconds: 20,
        unlockSessions: 2,
        minimumWeeklyExposures: 1,
      },
      {
        date: '2026-07-21',
        attempts: 10,
        successfulEntries: 3,
        bestHoldSeconds: 40,
        ...clean,
      },
    )
    expect(decision.nextTarget.focus).toBe('entries')
    expect(decision.reason).toContain('30%')
  })

  it('keeps flexibility logging lightweight', () => {
    const decision = evaluateFlexibilityProgression(
      { routine: 'Pancake daily', durationMinutes: 15, focus: 'Pancake' },
      {
        date: '2026-07-21',
        completed: true,
        durationMinutes: 15,
        milestone: 'Easier anterior pelvic tilt',
        ...clean,
      },
    )
    expect(decision.status).toBe('improving')
    expect(decision.reason).toContain('pelvic tilt')
  })
})
