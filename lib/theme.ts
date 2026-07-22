// -----------------------------------------------------------------------------
// Category color identities — the single source of truth for the app's playful
// accent system. Tokens are defined in app/globals.css; this maps training
// domains and workout sections to those accents so every page stays cohesive.
//
// Each accent ships as a `Theme` of Tailwind utility strings. Components spread
// the parts they need (tint background, ink text, border, solid fill).
// -----------------------------------------------------------------------------

import type { WorkoutSection } from './types'

export type AccentName =
  | 'coral'
  | 'sky'
  | 'lavender'
  | 'mint'
  | 'aqua'
  | 'sunny'

export interface AccentTheme {
  /** Soft tinted background (cards, chips). */
  soft: string
  /** Ink/text + icon color for this accent. */
  text: string
  /** Subtle border color. */
  border: string
  /** Solid fill background (e.g. progress bars, active dots). */
  solid: string
  /** Foreground color to place on top of `solid`. */
  onSolid: string
  /** Raw CSS var reference, for inline styles (charts, gradients). */
  cssVar: string
}

export const ACCENTS: Record<AccentName, AccentTheme> = {
  coral: {
    soft: 'bg-coral-soft',
    text: 'text-coral',
    border: 'border-coral/30',
    solid: 'bg-coral',
    onSolid: 'text-background',
    cssVar: 'var(--coral)',
  },
  sky: {
    soft: 'bg-sky-soft',
    text: 'text-sky',
    border: 'border-sky/30',
    solid: 'bg-sky',
    onSolid: 'text-background',
    cssVar: 'var(--sky)',
  },
  lavender: {
    soft: 'bg-lavender-soft',
    text: 'text-lavender',
    border: 'border-lavender/30',
    solid: 'bg-lavender',
    onSolid: 'text-background',
    cssVar: 'var(--lavender)',
  },
  mint: {
    soft: 'bg-mint-soft',
    text: 'text-mint',
    border: 'border-mint/30',
    solid: 'bg-mint',
    onSolid: 'text-background',
    cssVar: 'var(--mint)',
  },
  aqua: {
    soft: 'bg-aqua-soft',
    text: 'text-aqua',
    border: 'border-aqua/30',
    solid: 'bg-aqua',
    onSolid: 'text-background',
    cssVar: 'var(--aqua)',
  },
  sunny: {
    soft: 'bg-sunny-soft',
    text: 'text-sunny',
    border: 'border-sunny/30',
    solid: 'bg-sunny',
    onSolid: 'text-foreground',
    cssVar: 'var(--sunny)',
  },
}

/** Domain → accent identity, per the product's color language. */
export const DOMAIN_ACCENT = {
  planche: 'coral',
  handstand: 'sky',
  flexibility: 'lavender',
  physique: 'mint',
  swimming: 'aqua',
  diet: 'sunny',
} as const satisfies Record<string, AccentName>

export type Domain = keyof typeof DOMAIN_ACCENT

export function accentFor(domain: Domain): AccentTheme {
  return ACCENTS[DOMAIN_ACCENT[domain]]
}

/** Workout sections map onto the same accent language. */
export const SECTION_ACCENT: Record<WorkoutSection, AccentName> = {
  warmup: 'sunny',
  primary: 'coral',
  secondary: 'sky',
  strength: 'mint',
  flexibility: 'lavender',
  swim: 'aqua',
}

export function sectionAccent(section: WorkoutSection): AccentTheme {
  return ACCENTS[SECTION_ACCENT[section]]
}

/**
 * Best-effort mapping from a free-text skill category / name to an accent.
 * Skills carry a `category: string`, so we match on keywords.
 */
export function accentForCategory(category: string, name = ''): AccentTheme {
  const hay = `${category} ${name}`.toLowerCase()
  if (hay.includes('planche') || hay.includes('push')) return ACCENTS.coral
  if (hay.includes('handstand') || hay.includes('balance')) return ACCENTS.sky
  if (
    hay.includes('flex') ||
    hay.includes('mobility') ||
    hay.includes('split') ||
    hay.includes('bridge')
  )
    return ACCENTS.lavender
  if (hay.includes('swim') || hay.includes('cardio')) return ACCENTS.aqua
  if (
    hay.includes('physique') ||
    hay.includes('strength') ||
    hay.includes('hypertrophy') ||
    hay.includes('pull')
  )
    return ACCENTS.mint
  return ACCENTS.sky
}
