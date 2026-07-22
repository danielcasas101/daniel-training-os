import { describe, expect, it } from 'vitest'
import type { SessionCompletion, WorkoutExercise } from '@/lib/types'
import { createProgressionUpdate } from './catalog'

const completion: SessionCompletion = {
  outcome: 'great',
  discomfort: 'none',
}

function exercise(overrides: Partial<WorkoutExercise>): WorkoutExercise {
  return {
    id: 'exercise',
    name: 'Exercise',
    section: 'primary',
    target: '3 x 8',
    previousResult: '',
    actualResult: '',
    done: true,
    sets: [],
    ...overrides,
  }
}

describe('movement catalog parsing', () => {
  it('does not invent performance from a completion checkbox', () => {
    const update = createProgressionUpdate(
      exercise({
        id: 'planche',
        name: 'Open tuck planche holds',
        target: '6 x max',
        sets: [{ id: 'set-1', setNumber: 1, target: 'max', result: '', done: true }],
      }),
      '2026-07-21',
      completion,
      [],
    )
    expect(update).toMatchObject({
      status: 'stable',
      values: [],
      nextTarget: '6 x max',
    })
    expect(update?.reason).toContain('result is needed')
  })

  it('interprets common successes/attempts handstand notation', () => {
    const update = createProgressionUpdate(
      exercise({
        id: 'kickups',
        name: 'Freestanding kick-up practice',
        target: '10 attempts',
        actualResult: '3/10, 40s best hold',
      }),
      '2026-07-21',
      completion,
      [],
    )
    expect(update).toMatchObject({
      attempts: 10,
      successfulEntries: 3,
      lastResult: '3/10 · 40s best',
    })
    expect(update?.nextTarget).toContain('entries')
  })

  it('keeps load and reps separate for weighted progression', () => {
    const update = createProgressionUpdate(
      exercise({
        id: 'bench',
        name: 'Bench press',
        target: '3 x 6-8',
        actualResult: '185 x 8, 8, 8',
      }),
      '2026-07-21',
      completion,
      [],
    )
    expect(update).toMatchObject({ load: 185, values: [8, 8, 8] })
    expect(update?.nextTarget).toBe('190 × 6')
  })
})
