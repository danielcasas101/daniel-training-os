# Daniel Training OS

A mobile-first personal training application for measurable calisthenics progression, handstand practice, physique support, flexibility, swimming, and lightweight nutrition guidance.

## What works

- Date-aware daily workouts generated from a Monday-first recurring template
- Separate recurring templates, current-week overrides, daily modifications, and completed workouts
- Fast workout logging with optional detailed sets, form, notes, and discomfort
- Deterministic next-target generation for timed holds, rep ranges, weighted movements, and handstand entry consistency
- Stall, exposure, form, and discomfort-aware progression statuses
- Guided flexibility routines and lightweight flexibility milestones
- Local persistence that works without an account
- Optional Supabase email-link authentication and cross-device synchronization
- Supabase migration with Row Level Security and no client-side service-role key
- Responsive warm, bright design with reduced-motion support

## Local development

Requirements: Node.js 20+ and pnpm 10.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Quality checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/202607210001_initial_schema.sql`.
3. Copy `.env.example` to `.env.local` and set the project URL and anon key.
4. Add the deployed `/auth/callback` URL to the Supabase authentication redirect allowlist.

The anon key is safe to expose to the browser when RLS remains enabled. Never add a service-role key to this application.

## Data model

The application deliberately keeps these records distinct:

1. Recurring weekly template
2. Current-week override
3. Original and modified daily plan
4. Actual completed workout
5. Progression events and next-session decisions

Local storage provides an offline-friendly fallback. After sign-in, the same state is synchronized into normalized Supabase tables owned by the authenticated user.

## Deployment

Deploy through Vercel after connecting the GitHub repository. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project, then verify email sign-in, refresh persistence, and mobile navigation.
