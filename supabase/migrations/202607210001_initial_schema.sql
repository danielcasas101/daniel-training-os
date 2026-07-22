create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Daniel',
  profile jsonb not null default '{}'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  equipment jsonb not null default '[]'::jsonb,
  injury_context jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plan_templates (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.week_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  plan jsonb not null,
  change_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create table public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date date not null,
  original_plan jsonb not null,
  modified_plan jsonb not null,
  modification jsonb,
  version text not null default 'standard' check (version in ('standard', 'short', 'light')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plan_date)
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_date date not null,
  original_plan jsonb not null,
  modified_plan jsonb not null,
  actual_workout jsonb not null,
  completion jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, workout_date)
);

create table public.progression_events (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_date date not null,
  exercise_id text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.skill_milestones (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  milestone_date date not null,
  note text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.flexibility_sessions (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.bodyweight_logs (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  weight_lb numeric(5,1) not null check (weight_lb between 50 and 500),
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  unique (user_id, log_date)
);

create table public.body_notes (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  note_month text not null check (note_month ~ '^[0-9]{4}-[0-9]{2}$'),
  note text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  unique (user_id, note_month)
);

create table public.nutrition_checkins (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  unique (user_id, checkin_date)
);

create table public.exercise_definitions (
  slug text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  definition jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.guide_resources (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  resource jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger plan_templates_updated_at before update on public.plan_templates
for each row execute function public.set_updated_at();
create trigger week_plans_updated_at before update on public.week_plans
for each row execute function public.set_updated_at();
create trigger daily_plans_updated_at before update on public.daily_plans
for each row execute function public.set_updated_at();
create trigger workouts_updated_at before update on public.workouts
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.plan_templates enable row level security;
alter table public.week_plans enable row level security;
alter table public.daily_plans enable row level security;
alter table public.workouts enable row level security;
alter table public.progression_events enable row level security;
alter table public.skill_milestones enable row level security;
alter table public.flexibility_sessions enable row level security;
alter table public.bodyweight_logs enable row level security;
alter table public.body_notes enable row level security;
alter table public.nutrition_checkins enable row level security;
alter table public.exercise_definitions enable row level security;
alter table public.guide_resources enable row level security;

create policy "owners manage profiles" on public.profiles
for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners manage plan templates" on public.plan_templates
for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners manage week plans" on public.week_plans
for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners manage daily plans" on public.daily_plans
for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners manage workouts" on public.workouts
for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners manage progression" on public.progression_events
for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners manage milestones" on public.skill_milestones
for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners manage flexibility" on public.flexibility_sessions
for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners manage bodyweight" on public.bodyweight_logs
for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners manage body notes" on public.body_notes
for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "owners manage nutrition" on public.nutrition_checkins
for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "authenticated users read exercise definitions" on public.exercise_definitions
for select to authenticated using (owner_id is null or owner_id = (select auth.uid()));
create policy "owners manage exercise definitions" on public.exercise_definitions
for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "authenticated users read guides" on public.guide_resources
for select to authenticated using (owner_id is null or owner_id = (select auth.uid()));
create policy "owners manage guides" on public.guide_resources
for all to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Daniel'))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
