-- FitPulse Complete Database Schema for Supabase (PostgreSQL 17)
-- Follows Supabase Security & Postgres Performance Best Practices:
-- 1. RLS enabled on all public tables
-- 2. Policies scoped TO authenticated with cached (select auth.uid())
-- 3. Explicit USING and WITH CHECK on UPDATE policies
-- 4. Composite & Foreign Key indexes for fast time-series line charts and "last workout" lookups

-- 1. User Profiles & Preferences (Goals, Level, Sunday Weight Reminder)
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  primary_goal text not null default 'blutdruck' check (primary_goal in ('blutdruck', 'muskelaufbau', 'fit_im_alter', 'ausdauer')),
  fitness_level text not null default 'fortgeschritten' check (fitness_level in ('anfaenger', 'fortgeschritten', 'profi')),
  sunday_reminder_enabled boolean not null default true,
  sunday_reminder_time text not null default '09:00',
  target_weight_kg numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "user_profiles_select_own" on public.user_profiles
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "user_profiles_insert_own" on public.user_profiles
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "user_profiles_update_own" on public.user_profiles
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "user_profiles_delete_own" on public.user_profiles
  for delete to authenticated
  using ( (select auth.uid()) = user_id );


-- 2. Custom & Adaptive Training Plans
create table if not exists public.training_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal text not null check (goal in ('blutdruck', 'muskelaufbau', 'fit_im_alter', 'ausdauer')),
  level text not null check (level in ('anfaenger', 'fortgeschritten', 'profi')),
  description text,
  auto_progression boolean not null default true,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists training_plans_user_id_idx on public.training_plans (user_id);

alter table public.training_plans enable row level security;

create policy "training_plans_select_own" on public.training_plans
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "training_plans_insert_own" on public.training_plans
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "training_plans_update_own" on public.training_plans
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "training_plans_delete_own" on public.training_plans
  for delete to authenticated
  using ( (select auth.uid()) = user_id );


-- 3. Strength, Isometric & Stretching Logs (supports auto-prefill from most recent entry)
create table if not exists public.strength_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  exercise_name text not null,
  category text not null check (category in ('isometrisch', 'geraete', 'koerpergewicht', 'dehnung')),
  weight_kg numeric(6,2) not null default 0,
  sets integer not null default 3 check (sets > 0),
  reps integer not null default 0 check (reps >= 0),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  rpe smallint check (rpe between 1 and 10),
  notes text,
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Composite indexes for fast "last logged exercise" prefill & time-series dashboard queries
create index if not exists strength_logs_user_exercise_time_idx
  on public.strength_logs (user_id, exercise_id, performed_at desc);

create index if not exists strength_logs_user_time_idx
  on public.strength_logs (user_id, performed_at asc);

alter table public.strength_logs enable row level security;

create policy "strength_logs_select_own" on public.strength_logs
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "strength_logs_insert_own" on public.strength_logs
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "strength_logs_update_own" on public.strength_logs
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "strength_logs_delete_own" on public.strength_logs
  for delete to authenticated
  using ( (select auth.uid()) = user_id );


-- 4. Cardio / Endurance Logs (Running & Cycling: km, duration, elevation gain)
create table if not exists public.cardio_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  discipline text not null check (discipline in ('laufen', 'radfahren')),
  distance_km numeric(6,2) not null check (distance_km > 0),
  duration_minutes numeric(6,2) not null check (duration_minutes > 0),
  elevation_meters integer not null default 0 check (elevation_meters >= 0),
  avg_heart_rate integer,
  notes text,
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists cardio_logs_user_discipline_time_idx
  on public.cardio_logs (user_id, discipline, performed_at asc);

alter table public.cardio_logs enable row level security;

create policy "cardio_logs_select_own" on public.cardio_logs
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "cardio_logs_insert_own" on public.cardio_logs
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "cardio_logs_update_own" on public.cardio_logs
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "cardio_logs_delete_own" on public.cardio_logs
  for delete to authenticated
  using ( (select auth.uid()) = user_id );


-- 5. Body Weight Logs (Sunday Check-In & Trend)
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric(5,2) not null check (weight_kg > 20 and weight_kg < 400),
  systolic_bp integer,
  diastolic_bp integer,
  notes text,
  measured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists weight_logs_user_time_idx
  on public.weight_logs (user_id, measured_at asc);

alter table public.weight_logs enable row level security;

create policy "weight_logs_select_own" on public.weight_logs
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "weight_logs_insert_own" on public.weight_logs
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "weight_logs_update_own" on public.weight_logs
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "weight_logs_delete_own" on public.weight_logs
  for delete to authenticated
  using ( (select auth.uid()) = user_id );

-- Grant explicit Data API table permissions to authenticated role
grant select, insert, update, delete on public.user_profiles to authenticated;
grant select, insert, update, delete on public.training_plans to authenticated;
grant select, insert, update, delete on public.strength_logs to authenticated;
grant select, insert, update, delete on public.cardio_logs to authenticated;
grant select, insert, update, delete on public.weight_logs to authenticated;
