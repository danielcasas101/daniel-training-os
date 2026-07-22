import type {
  DatedResult,
  FlexibilityResult,
  FlexibilityTarget,
  HandstandProgressionConfig,
  HandstandResult,
  HandstandTarget,
  HoldProgressionConfig,
  HoldResult,
  HoldTarget,
  ProgressionDecision,
  RepProgressionConfig,
  RepResult,
  RepTarget,
} from './types'

const DAY_MS = 86_400_000

function dateValue(date: string): number {
  return new Date(`${date}T12:00:00`).getTime()
}

export function recentExposureCount<T extends DatedResult>(
  history: T[],
  asOf: string,
  days = 7,
): number {
  const end = dateValue(asOf)
  const start = end - (days - 1) * DAY_MS
  return history.filter((item) => {
    const value = dateValue(item.date)
    return value >= start && value <= end
  }).length
}

function insufficientExposure<T extends DatedResult>(
  history: T[],
  asOf: string,
  minimum: number,
): boolean {
  return recentExposureCount(history, asOf) < minimum
}

function hasNotableDiscomfort(result: DatedResult): boolean {
  return result.discomfort === 'notable'
}

export function evaluateHoldProgression(
  config: HoldProgressionConfig,
  result: HoldResult,
  previous: HoldResult[] = [],
): ProgressionDecision<HoldTarget> {
  const history = [...previous, result]
  const best = Math.max(0, ...result.holdsSeconds)
  const cleanSets = result.holdsSeconds.filter((seconds) => seconds >= config.targetSeconds).length
  const base = {
    variation: config.variation,
    sets: config.targetSets,
    seconds: config.targetSeconds,
  }

  if (hasNotableDiscomfort(result)) {
    return {
      status: 'limited_by_discomfort',
      nextTarget: {
        ...base,
        seconds: Math.max(3, config.targetSeconds - config.incrementSeconds),
      },
      reason: 'Notable discomfort was reported, so reduce the next exposure and reassess.',
      progressionSuggested: false,
    }
  }

  if (insufficientExposure(history, result.date, config.minimumWeeklyExposures)) {
    return {
      status: 'insufficient_exposure',
      nextTarget: base,
      reason: `Only ${recentExposureCount(history, result.date)} relevant exposure(s) occurred in the last 7 days.`,
      progressionSuggested: false,
    }
  }

  const unlockQualifiers = history
    .slice(-Math.max(config.unlockSessions + 2, 4))
    .filter(
      (item) =>
        item.form === 'clean' &&
        item.discomfort === 'none' &&
        Math.max(0, ...item.holdsSeconds) >= config.unlockSeconds &&
        item.holdsSeconds.filter((seconds) => seconds >= config.unlockSeconds).length >=
          config.targetSets,
    )

  if (unlockQualifiers.length >= config.unlockSessions) {
    return {
      status: 'ready_to_progress',
      nextTarget: base,
      nextVariation: config.nextVariation,
      reason: `${config.unlockSessions} clean sessions met the ${config.unlockSeconds}s progression standard.`,
      progressionSuggested: true,
    }
  }

  if (result.form === 'clean' && cleanSets >= config.targetSets) {
    return {
      status: 'improving',
      nextTarget: { ...base, seconds: config.targetSeconds + config.incrementSeconds },
      reason: 'Every working set met the target with clean form.',
      progressionSuggested: false,
    }
  }

  if (result.form === 'poor' || best < config.targetSeconds * 0.7) {
    return {
      status: 'stable',
      nextTarget: {
        ...base,
        seconds: Math.max(3, config.targetSeconds - config.incrementSeconds),
      },
      reason: 'The target was missed substantially or form declined, so reduce slightly next time.',
      progressionSuggested: false,
    }
  }

  const recentBest = history.slice(-4).map((item) => Math.max(0, ...item.holdsSeconds))
  const stalled =
    recentBest.length >= 4 && Math.max(...recentBest) - Math.min(...recentBest) < config.incrementSeconds

  return {
    status: stalled ? 'stalled' : 'stable',
    nextTarget: base,
    reason: stalled
      ? 'Four relevant sessions show no meaningful hold improvement; review volume, form, and recovery.'
      : 'The target was partially completed; repeat it and accumulate cleaner volume.',
    progressionSuggested: false,
  }
}

export function evaluateRepProgression(
  config: RepProgressionConfig,
  result: RepResult,
  previous: RepResult[] = [],
): ProgressionDecision<RepTarget> {
  const history = [...previous, result]
  const base: RepTarget = {
    variation: config.variation,
    sets: config.sets,
    reps: config.minimumReps,
    load: result.load ?? config.load,
  }

  if (hasNotableDiscomfort(result)) {
    return {
      status: 'limited_by_discomfort',
      nextTarget: { ...base, reps: config.minimumReps },
      reason: 'Notable discomfort was reported; hold load and return to the bottom of the rep range.',
      progressionSuggested: false,
    }
  }

  if (insufficientExposure(history, result.date, config.minimumWeeklyExposures)) {
    return {
      status: 'insufficient_exposure',
      nextTarget: base,
      reason: `Only ${recentExposureCount(history, result.date)} relevant exposure(s) occurred in the last 7 days.`,
      progressionSuggested: false,
    }
  }

  const completedSets = result.reps.length >= config.sets
  const allAtTop = completedSets && result.reps.slice(0, config.sets).every((rep) => rep >= config.maximumReps)

  if (allAtTop && result.form === 'clean') {
    const canAddLoad = config.load != null && config.loadIncrement != null
    return {
      status: canAddLoad ? 'ready_to_progress' : 'improving',
      nextTarget: {
        ...base,
        reps: config.minimumReps,
        load: canAddLoad ? (result.load ?? config.load ?? 0) + config.loadIncrement! : undefined,
      },
      reason: canAddLoad
        ? 'All working sets reached the top of the range; add load and reset repetitions.'
        : 'All working sets reached the top of the range; advance the variation when appropriate.',
      progressionSuggested: canAddLoad,
    }
  }

  const minimumAchieved = result.reps.length ? Math.min(...result.reps) : 0
  const metRange = completedSets && minimumAchieved >= config.minimumReps && result.form !== 'poor'
  if (metRange) {
    return {
      status: 'improving',
      nextTarget: { ...base, reps: Math.min(config.maximumReps, minimumAchieved + 1) },
      reason: 'All working sets stayed in range; add one repetition before changing load.',
      progressionSuggested: false,
    }
  }

  const recentMinimums = history
    .slice(-4)
    .map((item) => (item.reps.length ? Math.min(...item.reps) : 0))
  const stalled =
    result.form !== 'poor' &&
    recentMinimums.length >= 4 &&
    Math.max(...recentMinimums) - Math.min(...recentMinimums) < 1

  return {
    status: stalled ? 'stalled' : 'stable',
    nextTarget: base,
    reason: stalled
      ? 'Four relevant sessions show no repetition improvement; review load, volume, and recovery.'
      : 'Repeat the current load and bottom-of-range target until all working sets are clean.',
    progressionSuggested: false,
  }
}

export const evaluateWeightedProgression = evaluateRepProgression

export function evaluateHandstandProgression(
  config: HandstandProgressionConfig,
  result: HandstandResult,
  previous: HandstandResult[] = [],
): ProgressionDecision<HandstandTarget> {
  const history = [...previous, result]
  const rate = result.attempts > 0 ? result.successfulEntries / result.attempts : 0
  const targetSuccesses = Math.ceil(config.attempts * config.targetSuccessRate)
  const base: HandstandTarget = {
    attempts: config.attempts,
    successfulEntries: targetSuccesses,
    holdSeconds: config.targetHoldSeconds,
    focus: rate < config.targetSuccessRate ? 'entries' : 'line',
  }

  if (hasNotableDiscomfort(result)) {
    return {
      status: 'limited_by_discomfort',
      nextTarget: { ...base, attempts: Math.max(5, Math.floor(config.attempts / 2)) },
      reason: 'Notable discomfort was reported; reduce entry volume and avoid forced positions.',
      progressionSuggested: false,
    }
  }

  if (insufficientExposure(history, result.date, config.minimumWeeklyExposures)) {
    return {
      status: 'insufficient_exposure',
      nextTarget: base,
      reason: `Only ${recentExposureCount(history, result.date)} relevant exposure(s) occurred in the last 7 days.`,
      progressionSuggested: false,
    }
  }

  const qualifiers = history
    .slice(-Math.max(4, config.unlockSessions + 1))
    .filter(
      (item) =>
        item.attempts > 0 &&
        item.successfulEntries / item.attempts >= config.unlockSuccessRate &&
        item.form !== 'poor' &&
        item.discomfort !== 'notable',
    )

  if (qualifiers.length >= config.unlockSessions) {
    return {
      status: 'ready_to_progress',
      nextTarget: { ...base, focus: 'line' },
      reason: `${config.unlockSessions} sessions met the entry-consistency standard.`,
      nextVariation: 'Controlled freestanding holds and press-negative preparation',
      progressionSuggested: true,
    }
  }

  if (rate < config.targetSuccessRate) {
    const recentRates = history
      .slice(-4)
      .map((item) => (item.attempts > 0 ? item.successfulEntries / item.attempts : 0))
    const stalled =
      recentRates.length >= 4 && Math.max(...recentRates) - Math.min(...recentRates) < 0.05
    return {
      status: stalled ? 'stalled' : 'stable',
      nextTarget: { ...base, focus: 'entries' },
      reason: stalled
        ? 'Four relevant sessions show no meaningful entry-rate improvement; simplify the entry drill and review fatigue.'
        : `Entry success was ${Math.round(rate * 100)}%; prioritize repeatable kick-ups even if the best hold is already strong.`,
      progressionSuggested: false,
    }
  }

  return {
    status: 'improving',
    nextTarget: {
      ...base,
      successfulEntries: Math.min(config.attempts, result.successfulEntries + 1),
      focus: result.lineQuality === 'clean' ? 'hold' : 'line',
    },
    reason: 'Entry consistency met the current target; improve line quality before chasing longer maximums.',
    progressionSuggested: false,
  }
}

export function evaluateFlexibilityProgression(
  target: FlexibilityTarget,
  result: FlexibilityResult,
  previous: FlexibilityResult[] = [],
): ProgressionDecision<FlexibilityTarget> {
  if (hasNotableDiscomfort(result)) {
    return {
      status: 'limited_by_discomfort',
      nextTarget: { ...target, durationMinutes: Math.max(5, Math.round(target.durationMinutes * 0.7)) },
      reason: 'Notable discomfort was reported; use a shorter, gentler routine next time.',
      progressionSuggested: false,
    }
  }

  if (!result.completed) {
    return {
      status: 'stable',
      nextTarget: target,
      reason: 'The routine was not completed; repeat it without increasing duration.',
      progressionSuggested: false,
    }
  }

  const recentCompleted = [...previous, result].slice(-4).filter((item) => item.completed).length
  return {
    status: result.milestone ? 'improving' : recentCompleted >= 3 ? 'improving' : 'stable',
    nextTarget: target,
    reason: result.milestone
      ? `Milestone recorded: ${result.milestone}`
      : 'Routine completed; consistency matters more than measuring range every session.',
    progressionSuggested: false,
  }
}
