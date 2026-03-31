create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text not null check (role in ('student', 'hoc')),
  level integer,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.timetable (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  day text not null check (day in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  scheduled_time time not null,
  lecturer text not null,
  venue text not null,
  status text not null check (status in ('scheduled', 'ongoing', 'cancelled', 'postponed')),
  created_at timestamptz not null default now()
);

create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  timetable_id uuid references public.timetable(id) on delete cascade,
  started_at timestamptz not null default now(),
  started_by uuid references public.users(id)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  description text not null,
  deadline timestamptz not null,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  file_url text not null,
  uploaded_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.updates_board (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  content text not null,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.timetable enable row level security;
alter table public.class_sessions enable row level security;
alter table public.assignments enable row level security;
alter table public.notes enable row level security;
alter table public.updates_board enable row level security;

create policy "read own user row" on public.users
  for select using (auth.email() = email);

create policy "read courses" on public.courses
  for select using (true);

create policy "read timetable" on public.timetable
  for select using (true);

create policy "read class sessions" on public.class_sessions
  for select using (true);

create policy "read assignments" on public.assignments
  for select using (true);

create policy "read notes" on public.notes
  for select using (true);

create policy "read updates" on public.updates_board
  for select using (true);

create policy "hoc insert timetable" on public.timetable
  for insert to authenticated
  with check (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));

create policy "hoc insert assignments" on public.assignments
  for insert to authenticated
  with check (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));

create policy "hoc insert notes" on public.notes
  for insert to authenticated
  with check (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));

create policy "hoc insert updates" on public.updates_board
  for insert to authenticated
  with check (exists (select 1 from public.users where email = auth.email() and role = 'hoc'));
